const startButton = document.getElementById("startButton");
const status = document.getElementById("status");
const timer = document.getElementById("timer");
const intervention = document.getElementById("intervention");

let audioContext;
let analyser;
let microphone;
let dataArray;

let silenceStart = null;
let interventionTriggered = false;


startButton.addEventListener("click", async () => {

    const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
    });

    audioContext = new AudioContext();

    microphone = audioContext.createMediaStreamSource(stream);

    analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;

    dataArray = new Uint8Array(analyser.fftSize);

    microphone.connect(analyser);

    startButton.disabled = true;
    status.textContent = "Monitoring...";

    detectSound();
});


function detectSound() {

    analyser.getByteTimeDomainData(dataArray);

    let sum = 0;

    for (let i = 0; i < dataArray.length; i++) {

        const value = dataArray[i] - 128;

        sum += value * value;
    }

    const volume = Math.sqrt(sum / dataArray.length);

    const isSilent = volume < 5;


    if (isSilent) {

        if (silenceStart === null) {
            silenceStart = Date.now();
        }

        const silenceTime = Math.floor(
            (Date.now() - silenceStart) / 1000
        );

        timer.textContent = `Silence: ${silenceTime}s`;

        updateStatus(silenceTime);

    } else {

        silenceStart = null;
        interventionTriggered = false;

        timer.textContent = "Silence: 0s";

        status.textContent = "Someone is talking...";

        intervention.textContent = "";
    }


    requestAnimationFrame(detectSound);
}


function updateStatus(seconds) {

    if (seconds < 5) {

        status.textContent = "Normal";

    } else if (seconds < 10) {

        status.textContent = "Getting quiet...";

    } else if (seconds < 15) {

        status.textContent = "Awkward silence detected.";

    } else {

        status.textContent = "INTERVENTION REQUIRED";

        triggerIntervention();
    }
}


function triggerIntervention() {

    if (interventionTriggered) {
        return;
    }

    interventionTriggered = true;

    intervention.textContent =
        "Someone should probably say something.";
}
