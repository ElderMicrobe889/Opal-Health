const THRESHOLD = 5;

class NoiseGate extends AudioWorkletProcessor {

  constructor(){
    super();
    this._smoothingCount = 0;
    this._threshold = THRESHOLD / 100;
    this._currentActivityStatus = false;
    this.port.onmessage = this.handleMessage_.bind(this);
  }

  handleMessage_(event) {
    if (event.data.message.type == "updateThreshold"){
      this._threshold = event.data.message.threshold / 100;
    }
  }

  process (inputs, outputs, parameters) {

    const input = inputs[0];
    const output = outputs[0];

    for (let channel = 0; channel < output.length; ++channel) {
      const inputChannel = input[channel];
      const outputChannel = output[channel];

      if ( inputChannel != undefined && outputChannel != undefined){
        //Note to self, put a console.log here and you will unleash the power of satan upon your browser
        for (let i = 0; i < outputChannel.length; ++i) {
          let micActive = inputChannel[i] > this._threshold;
          outputChannel[i] = micActive? inputChannel[i] : 0;
          if (micActive != this._currentActivityStatus) {
            this._currentActivityStatus = micActive;
            this.port.postMessage({
              message : {type: "activityChanged", micActive}
            });
            this._smoothingCount = 0;
          }
        }

      }

    }

  }

}

registerProcessor('noise-gate', NoiseGate);
