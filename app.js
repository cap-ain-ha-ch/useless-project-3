const startButton = document.getElementById("startButton");
const status = document.getElementById("status");
const timer = document.getElementById("timer");
const intervention = document.getElementById("intervention");

const thresholdSlider = document.getElementById("threshold");
const thresholdValue = document.getElementById("thresholdValue");
const levelDisplay = document.getElementById("level");

let audioContext;
let analyser;
let microphone;
let dataArray;

let silenceStart = null;
let interventionTriggered = false;


// Update the displayed threshold
thresholdSlider.addEventListener("input", () => {
    thresholdValue.textContent = thresholdSlider.value;
});


// Start microphone monitoring
startButton.addEventListener("click", async () => {

    try {

        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true
        });

        audioContext = new AudioContext();

        microphone =
            audioContext.createMediaStreamSource(stream);

        analyser = audioContext.createAnalyser();

        analyser.fftSize = 512;

        dataArray =
            new Uint8Array(analyser.fftSize);

        microphone.connect(analyser);

        startButton.disabled = true;

        status.textContent = "Monitoring...";

        detectSound();

    } catch (error) {

        console.error(error);

        status.textContent =
            "Microphone access was denied.";
    }
});


// Continuously analyze microphone
function detectSound() {

    analyser.getByteTimeDomainData(dataArray);

    let sum = 0;

    for (let i = 0; i < dataArray.length; i++) {

        const value =
            dataArray[i] - 128;

        sum += value * value;
    }

    const volume =
        Math.sqrt(sum / dataArray.length);

    const threshold =
        Number(thresholdSlider.value);

    const isSilent =
        volume < threshold;


    if (isSilent) {

        // Silence has just started
        if (silenceStart === null) {
            silenceStart = Date.now();
        }

        const silenceTime =
            Math.floor(
                (Date.now() - silenceStart) / 1000
            );

        timer.textContent =
            `Silence: ${silenceTime}s`;

        updateLevel(silenceTime);

    } else {

        // Someone started talking
        silenceStart = null;
        interventionTriggered = false;

        timer.textContent =
            "Silence: 0s";

        levelDisplay.textContent =
            "Level 0";

        status.textContent =
            "Someone is talking...";

        intervention.textContent =
            "";
    }

    requestAnimationFrame(detectSound);
}


// Determine the current level
function updateLevel(seconds) {

    let level;

    if (seconds < 5) {

        level = 0;

        status.textContent =
            "Normal";

    } else if (seconds < 10) {

        level = 1;

        status.textContent =
            "Getting quiet...";

    } else if (seconds < 20) {

        level = 2;

        status.textContent =
            "Awkward silence detected.";

    } else if (seconds < 30) {

        level = 3;

        status.textContent =
            "This is becoming uncomfortable.";

    } else {

        level = 4;

        status.textContent =
            "INTERVENTION REQUIRED";

        triggerIntervention();
    }

    levelDisplay.textContent =
        `Level ${level}`;
}


// Trigger the intervention only once
function triggerIntervention() {

    if (interventionTriggered) {
        return;
    }

    interventionTriggered = true;

    intervention.textContent =
        "Someone should probably say something.";
}

