'use strict';
import Comm from "./Comms.js";

function getTimeStamp(){
  const today = new Date();
  let hours = today.getHours();
  let tod = "am";
  if (hours > 12) {
    tod = "pm";
    hours -= 12;
  }
  return `[${hours}:${today.getMinutes()} ${tod}]`;
}

function chatMessage(comm, eventData){
  if (eventData.senderName != "Me" && $("#messageMenuContainer").css("top") != "0px") $("#chatIcon").attr("src", "/static/service/IMG/ChatUnread.svg/");
  let newMessage = document.createElement('p');
  if (eventData.senderName != "__system__"){
    $(newMessage).text(getTimeStamp() + " " + eventData.senderName + ": " + eventData.message);
  } else {
    $(newMessage).text(eventData.message);
    $(newMessage).css("color", "#691c93");
  }
  $('#messages').append(newMessage);
  $("#messages")[0].scrollBy(0, 5000);
}

function localMicActivityChanged(comm, eventData){
  $("#localVideo").toggleClass("activeVideo", eventData.newMicActivity);
}

function remoteMicActivityChanged(comm, eventData){
  $("#remoteVideo").toggleClass("activeVideo", eventData.newMicActivity);
}

function showError(error){
  $("#covidDiv").addClass("active");
  $("#error").text(error);
}

function otherLeave(comm, eventData){
  chatMessage(comm, eventData={message: `${eventData.otherName} Left`, senderName:"__system__"});
}

function cantJoin(comm, eventData){
  showAlert("Can't Join, there are already two people in the meeting!");
  $("#coverDiv").removeClass("hide");
}

function remoteMicChange(comm, eventData){
  $("#remoteMic").toggleClass("crossed", !eventData.newMicStatus);
}

function micError(comm, eventData){
  $(".micToggle").toggleClass("crossed", true);
  showAlert("There Was An Error Accessing Your Microphone");
}

function camError(comm, eventData){
  $(".camToggle").toggleClass("crossed", true);
  showAlert("There Was An Error Accessing Your Camera");
}

function complete(){
  window.location.replace("/service/complete/");
}

$(document).ready(function(){

  const lv = $("#localVideo")[0];
  const rv = $("#remoteVideo")[0];
  const ra = $("#remoteAudio")[0];
  const noVideoImageURL = "/static/service/IMG/noCam.png";
  const envFacing = "/static/service/IMG/FlipCameraToEnv.svg";
  const userFacing = "/static/service/IMG/FlipCameraToUser.svg";

  const events = {
    camError,
    micError,
    localMicActivityChanged,
    remoteMicActivityChanged,
    chatMessage,
    remoteMicChange,
    cantJoin,
    otherLeave
  }

  const app_id = JSON.parse($('#appointment-name').text());
  const my_name = JSON.parse($("#my_name").text());
  const code = "Rrv8qPaCmE9Jkyg0";

  const comm = new Comm(lv, rv, ra, noVideoImageURL, events);
  comm.registerMessageType('endApp', complete);

  $(".micToggle").click(function(){
    comm.toggleMic();
    $(".micToggle").toggleClass("crossed");
  });

  $(".camToggle").click(function(){
    comm.toggleCam();
    $(".camToggle").toggleClass("crossed");
  });

  $("#join").click(function(){
    comm.join(code, app_id, my_name);
    chatMessage(comm, {message: `Welcome, ${my_name}!`, senderName: "__system__"});
    $("#coverDiv").addClass("hide");
  });

  $(".leave").click(function(){
    window.location.replace("/service/appointments/");
  });

  $(".flip").click(function(){
    comm.flipCamera();
    let current = $(".flip > img").attr("src");
    $(".flip > img").attr("src", current == envFacing? userFacing : envFacing);
  });

  $("#end").click(function(){
    comm.sendMessage("endApp", true);
    window.location.replace('/service/finalize/?id=' + app_id);
  });
  
  $("#messageMenuButton").click(function() {
    $("#messageMenuContainer").toggleClass("show");
    $("#chatIcon").attr("src", "/static/service/IMG/Chat.svg/");
  });

  $("#send").click(function(){
    let message = $("#messageInput").val();
    if (message.trim() != ""){
      chatMessage(comm, {message, senderName : "Me"});
      $("#chatIcon").attr("src", "/static/service/IMG/Chat.svg/");
      comm.sendChatMessage(message);
      $("#messageInput").val("");      
    }
  });
  let big = (window.screen.width > 1263);
  window.addEventListener("resize", function(event) {
      let x = 5;
      if (window.screen.width < 1263 && big && !$("#messageMenuContainer").hasClass("show")) {
          big = false;
          $("#messageMenuContainer").css("left", "100vw");
          setTimeout(() => { $("#messageMenuContainer").css("left", "0px"); }, 500);
      }
      big = (window.screen.width > 1263);
  });

   $(document).ready(function() {
        $("#covidButton").click(function(){
            $("#covidDiv").removeClass("active");
        });            
    });


  comm.init();

});

$(document).keypress(function(e){
  if (e.which == 13 && $("#messageInput").is(":focus")){
    $("#send").click();
    $("#chatIcon").attr("src", "/static/service/IMG/Chat.svg/");
  }
});