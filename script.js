const messageButton = document.querySelector(".message-button");
const voicemail = document.querySelector("#voicemail");
const voicemailAudio = document.querySelector("#voicemail-audio");
const voicemailAmbience = document.querySelector("#voicemail-ambience");
const atmosphereAudio = document.querySelector("#atmosphere-audio");
const soundToggle = document.querySelector("[data-sound-toggle]");
const signupForm = document.querySelector("[data-signup-form]");
const formStatus = document.querySelector("[data-form-status]");
let voicemailTimer;
let voicemailContext;
let voicemailSource;

function prepareVoicemailSound() {
  if (!voicemailAudio) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  if (!voicemailContext) {
    voicemailContext = new AudioContext();
    voicemailSource = voicemailContext.createMediaElementSource(voicemailAudio);
    const highpass = voicemailContext.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.value = 425;
    highpass.Q.value = 0.82;
    const lowpass = voicemailContext.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 2750;
    lowpass.Q.value = 0.76;
    voicemailSource.connect(highpass).connect(lowpass).connect(voicemailContext.destination);
  }
  voicemailContext.resume();
}

if (atmosphereAudio) atmosphereAudio.volume = 0.52;

// Browsers often block audible autoplay. Keep sound as the intended default,
// then begin it on the visitor's first interaction when autoplay is withheld.
atmosphereAudio?.play().catch(() => {
  const beginAtmosphere = () => {
    atmosphereAudio.play().catch(() => {});
    document.removeEventListener("pointerdown", beginAtmosphere);
    document.removeEventListener("keydown", beginAtmosphere);
  };
  document.addEventListener("pointerdown", beginAtmosphere, { once: true });
  document.addEventListener("keydown", beginAtmosphere, { once: true });
});

document.querySelector("[data-year]").textContent = new Date().getFullYear();

messageButton?.addEventListener("click", async () => {
  const isOpen = messageButton.getAttribute("aria-expanded") === "true";
  messageButton.setAttribute("aria-expanded", String(!isOpen));
  voicemail.hidden = isOpen;
  const label = messageButton.querySelector("[data-message-label]");

  if (isOpen) {
    clearTimeout(voicemailTimer);
    voicemailAudio?.pause();
    voicemailAmbience?.pause();
    if (voicemailAudio) voicemailAudio.currentTime = 0;
    if (voicemailAmbience) voicemailAmbience.currentTime = 0;
    label.textContent = "Open voicemail";
    return;
  }

  label.textContent = "Playing voicemail";
  try {
    prepareVoicemailSound();
    if (atmosphereAudio && !atmosphereAudio.paused) atmosphereAudio.volume = 0.12;
    if (voicemailAmbience) {
      voicemailAmbience.currentTime = 0;
      voicemailAmbience.volume = 1;
      await voicemailAmbience.play();
    }
    voicemailTimer = setTimeout(() => voicemailAudio?.play().catch(() => {}), 490);
  } catch {
    label.textContent = "Voicemail transcript";
  }
});

voicemailAudio?.addEventListener("ended", () => {
  if (atmosphereAudio && !atmosphereAudio.paused) atmosphereAudio.volume = 0.52;
  messageButton.querySelector("[data-message-label]").textContent = "Play again";
});

soundToggle?.addEventListener("click", async () => {
  const label = soundToggle.querySelector("[data-sound-label]");
  if (atmosphereAudio.paused) {
    atmosphereAudio.volume = 0.52;
    try {
      await atmosphereAudio.play();
      soundToggle.setAttribute("aria-pressed", "true");
      label.textContent = "Atmosphere on";
    } catch {
      label.textContent = "Sound unavailable";
    }
  } else {
    atmosphereAudio.pause();
    soundToggle.setAttribute("aria-pressed", "false");
    label.textContent = "Atmosphere off";
  }
});

signupForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!signupForm.checkValidity()) {
    signupForm.reportValidity();
    return;
  }

  const endpoint = signupForm.dataset.endpoint;
  if (!endpoint) {
    formStatus.textContent = "Email signup is being connected. Please check back shortly.";
    return;
  }

  const button = signupForm.querySelector("button[type='submit']");
  button.disabled = true;
  formStatus.textContent = "Adding you to the case file…";

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      body: new FormData(signupForm),
      headers: { Accept: "application/json" },
    });

    if (!response.ok) throw new Error("Signup failed");

    signupForm.reset();
    formStatus.textContent = "You’re in. Watch your inbox for confirmation.";
  } catch {
    formStatus.textContent = "That didn’t go through. Please try again in a moment.";
  } finally {
    button.disabled = false;
  }
});
