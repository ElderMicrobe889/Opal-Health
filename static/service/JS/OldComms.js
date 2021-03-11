class Comm{

  constructor(localVideo, remoteVideo, remoteAudio, noVideo, noAudio, on){

    this.signalTypes = {};
    this.messageTypes = {};

    this.config = {
      iceServers: [{
        urls: 'stun:stun.l.google.com:19302'
      }],
      iceCandidatePoolSize:20
    };

    document.comm = this;
    this.on = on;

    /*  
      remoteMicUpdate : Remote Mic Updated
      stat_change     : Status changed
      error           : On Error, Do Something
      cantJoin        : When the user isn't allowed to join (already 2 people OR they're already connected in another tab)
      micError        : Can't Start Microphone
      camError        : Can't Start Camera
      chatMessage     : Someone Sent A Chat Message
      otherLeave      : The Other Person Left
      localMicActivityUpdate : Local mic's activity has changed
    */

    this.status = "Constructed";
    this.on.stat_change(this);
    this.my = {};
    this.remote = {};
    this.no = {};
    this.old = {};
    this.my.videoElement = localVideo;
    this.remote.videoElement = remoteVideo;
    this.remote.audioElement = remoteAudio;
    this.no.video = noVideo.captureStream? noVideo.captureStream() : noVideo.mozCaptureStream();
    this.no.audio = noAudio.captureStream? noAudio.captureStream() : noAudio.mozCaptureStream();
    this.my.videoElement.srcObject = this.no.video;

  }

  init(){

    this.pc = new RTCPeerConnection(this.config);
    this.my.video = this.no.video;
    this.my.audio = this.no.audio;
    this.my.camOn = false;
    this.my.micOn = false;
    this.old.micOn = false;
    this.old.camOn = false;
    this.queued = [];
    this.my.videoElement.srcObject = this.my.video;
    this.registerSignalType('candidate', this.candidate);
    this.registerSignalType('sdp', this.sdp);
    this.registerMessageType('chat', this.chat);
    this.registerMessageType('stat', this.stat);
    this.registerMessageType('camStat', this.camStat);
    this.status = "Initialized";
    this.on.stat_change(this);

  }

  //Peer Connection Stuff

  pcChannel(event){
    let me = document.comm;
    me.dataChannel = event.channel;
    me.dataChannel.onmessage = me.channelData;
    me.channelInitialized = true;
  }

  pcCandidate(event){
    let me = document.comm;
    if (event.candidate) {
      me.sendSignal('candidate', event.candidate);
    }
  }

  pcTrack(event){
    const stream = event.streams[0];
    let me = document.comm;
    if (event.track.kind == "video"){
      let st = new MediaStream([event.track]);
      me.remote.videoElement.srcObject = me.remote.camOn? st : me.no.video;
      me.remote.video = st;
    }
    else if (event.track.kind == "audio"){
      me.remote.audioElement.srcObject = new MediaStream([event.track]);
    }
  }

  //DataChannel Stuff

  channelCatchUp(){
    this.queued.forEach(ctn => {
      this.dataChannel.send(ctn);
    });
    this.queued = [];
  }

  channelOpen(event){
    let me = document.comm;
    me.channelInitialized = true;
    me.channelCatchUp();
  }

  initChannel(){
    this.dataChannel = this.pc.createDataChannel("Healine Data Channel");
    this.dataChannel.onopen = this.channelOpen;
    this.dataChannel.onmessage = this.channelData;
  }

  //Message Stuff

  registerMessageType(type, func){
    this.messageTypes[type] = func;
  }

  sendMessage(type, content){
      let ctn = {
        name : this.my.name,
        type,
        content
      }

      let data = JSON.stringify(ctn);

      if (this.channelInitialized){
        this.dataChannel.send(data);
      } else {
        this.queued.push(data);
      }
  }

  msg(message){
    this.sendMessage("chat", message);
  }

  //Signalling Stuff

  registerSignalType(type, func){
    this.signalTypes[type] = func;
  }

  sendSignal(type, content){
    this.push({type, content});
  }

  push(message){
    if (this.joined){
      this.drone.publish({
        room: this.roomCode,
        message
      });
    }
  }

  con(){
    if(this.my.micOn) this.sendMessage('stat', true);
    if(this.my.camOn) this.sendMessage('camStat', true);
  }

  initStreams(){
    this.my.audioSender = this.pc.addTrack(this.my.audio.getAudioTracks()[0]);
    this.my.videoSender = this.pc.addTrack(this.my.video.getVideoTracks()[0]);
  }

  initRTC(){
    this.pc.ontrack = this.pcTrack;
    this.initStreams();
    this.pc.onicecandidate = this.pcCandidate;
    this.pc.ondatachannel = this.pcChannel;
    this.initChannel();
    this.isNegotationing = false;

    if (this.isOfferer) {
      this.pc.onnegotiationneeded = () => {
        if (!this.isNegotationing){
          this.isNegotationing = true;
          this.pc.createOffer().then(this.localDescCreated).catch(this.on.error);
        }
      }
    }

    this.room.on('data', this.roomData);
  }

  pcCallBack(){
    let me = document.comm;
    me.sendSignal('sdp', me.pc.localDescription);
  }

  localDescCreated(desc) {
    let me = document.comm;
    me.pc.setLocalDescription(desc).then(me.pcCallBack).catch(me.on.error);
    me.status = "Connected";
    me.on.stat_change(me);
    me.con();
  }

  onSuccess(){}

  makeAnswer(){
    let me = document.comm;
    if (!me.isOfferer) {
      me.pc.createAnswer().then(me.localDescCreated).catch(me.on.error);
    }
  }

  sdp(desc, client, me){
    me.remote.id = client.id;
    me.remote.name = client.clientData.name;
    me.pc.setRemoteDescription(new RTCSessionDescription(desc)).then(me.makeAnswer).catch(me.on.error);
  }

  candidate(can, client, me){
    me.pc.addIceCandidate(new RTCIceCandidate(can)).then(me.onSuccess).catch(me.on.error);
  }

  chat(msg, client, me){
    me.on.chatMessage(client.clientData.name, msg, me); 
  }

  stat(mic, client, me){
    console.log(mic);
    me.remote.micOn = mic;
    me.on.remoteMicUpdate(me);
  }

  roomData(message, client){
    let me = document.comm;
    if (client.id !== me.drone.clientId) me.signalTypes[message.type](message.content, client, me);
  }

  channelData(event){
    let me = document.comm;
    let data = JSON.parse(event.data);
    let client = {clientData:{name:data.name}};
    me.messageTypes[data.type](data.content, client, me);
  }

  roomInit(error){
    let me = document.comm;
    if (error){me.on.error(error);}
  }

  roomMembers(members){
    let me = document.comm;
    let valid = true;

    members.forEach(member => {
      if (me.my.id != member.id && me.my.name == member.clientData.name){
        valid = false;
      }
    });

    if(members.length > 2){
      valid = false;
    }

    me.isOfferer = members.length === 2;
    if (valid){
      me.initRTC();
    } else {
      me.on.cantJoin(me);
    }
  }

  roomLeave(member){
    let me = document.comm;
    if (me.joined && member.id == me.remote.id){
      me.remote.videoElement.srcObject = null;
      me.remote.videoElement.load();
      me.remote.audioElement.srcObject = null;
      me.remote.micOn = false;
      me.isNegotationing = false;
      me.isOfferer = false;
      me.pc.close();
      me.pc = null;
      me.my.videoSender = null;
      me.my.audioSender = null;
      me.channelInitialized = false;
      me.dataChannel.close();
      me.dataChannel = null;
      me.on.remoteMicUpdate(me);
      me.remote.id = null;
      me.remote.video = null;
      me.remote.name = null;
      me.on.otherLeave(member.clientData.name, me);
      me.pc = new RTCPeerConnection(this.config);
      me.initRTC();
    }
  }

  droneInit(error){

    let me = document.comm;

    if(error){me.on.error(error);return;}
    me.room = me.drone.subscribe(me.roomCode);

    me.my.id = me.drone.clientId;

    me.room.on('open', me.roomInit);
    me.room.on('members', me.roomMembers);
    me.room.on('member_leave', me.roomLeave);

  }

  join(droneKey, roomCode, myName){

    this.my.name = myName;
    this.joined = true;
    this.drone = new ScaleDrone(droneKey, {data: {name:this.my.name}});
    this.roomCode = "observable-" + roomCode;
    this.drone.on("open", this.droneInit);

  }

  pushVideoStream(){

    this.my.videoSender.replaceTrack(this.my.video.getVideoTracks()[0]);
    this.sendMessage('camStat', this.my.camOn);
    
  }

  pushAudioStream(){

    this.my.audioSender.replaceTrack(this.my.audio.getAudioTracks()[0]);
    this.sendMessage('stat', this.my.micOn);

  }

  micError(error){
    let me = document.comm;
    me.my.micOn = false;
    me.old.micOn = false;
    me.on.micError(me);
  }

  camStat(cam, client, me){
    me.remote.camOn = cam;
    me.remote.videoElement.srcObject = me.remote.camOn? me.remote.video : me.no.video;
  }

  camError(error){
    let me = document.comm;
    console.error(error);
    me.my.camOn = false;
    me.old.camOn = false;
    me.on.camError(me);
  }

  streamUpdate(){

    let cam_changed = this.old.camOn != this.my.camOn;
    let mic_changed = this.old.micOn != this.my.micOn;

    if (!this.my.micOn && mic_changed) {
      this.my.audio.getAudioTracks()[0].stop();
    }

    if (!this.my.camOn && cam_changed) {
      this.my.video.getVideoTracks()[0].stop();
    }

    if (mic_changed){
      if (this.my.micOn){
        navigator.mediaDevices.getUserMedia({audio: true}).then(stream => { 
          this.my.audio = stream;
          if (this.joined) this.pushAudioStream();
          this.on.micSuccess(this);
        }, this.micError); 
      } 
      else {
        this.my.audio = this.no.audio;   
        if (this.joined) this.pushAudioStream();
      }
    } 

    if (cam_changed) {
      if (this.my.camOn){
        navigator.mediaDevices.getUserMedia({video: {facingMode : "user"}}).then(stream => {
          this.my.video = stream;
          this.my.videoElement.srcObject = this.my.video;
          if (this.joined) this.pushVideoStream();
          this.on.camSuccess(this);
        }, this.camError);
      } 
      else {
        this.my.video = this.no.video;
        this.my.videoElement.srcObject = this.my.video;
        if (this.joined) this.pushVideoStream();
      }
    }
    
    this.old.camOn = this.my.camOn;
    this.old.micOn = this.my.micOn;

  }

  toggleMic(){
    this.my.micOn = !this.my.micOn;
    this.streamUpdate();
  }

  toggleCam(){
    this.my.camOn = !this.my.camOn;
    this.streamUpdate();
  }

}