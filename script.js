const messageButton = document.querySelector(".message-button");
const voicemail = document.querySelector("#voicemail");
const voicemailAudio = document.querySelector("#voicemail-audio");
const atmosphereAudio = document.querySelector("#atmosphere-audio");
const soundToggle = document.querySelector("[data-sound-toggle]");
const signupForm = document.querySelector("[data-signup-form]");
const formStatus = document.querySelector("[data-form-status]");
const lightbox = document.querySelector("[data-lightbox]");
const lightboxPanel = lightbox?.querySelector(".lightbox-panel");
const lightboxImage = lightbox?.querySelector("[data-lightbox-image]");
const lightboxCaption = lightbox?.querySelector(".lightbox-panel [data-lightbox-caption]");
const lightboxCloseButtons = lightbox?.querySelectorAll("[data-lightbox-close]");
let voicemailTimer;
let voicemailContext;
let voicemailSource;
let lastLightboxTrigger;

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
    if (voicemailAudio) voicemailAudio.currentTime = 0;
    label.textContent = "Open voicemail";
    return;
  }

  label.textContent = "Playing voicemail";
  try {
    prepareVoicemailSound();
    if (atmosphereAudio && !atmosphereAudio.paused) atmosphereAudio.volume = 0.12;
    if (voicemailAudio) {
      voicemailAudio.currentTime = 0;
      await voicemailAudio.play();
    }
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
      label.textContent = "Music on";
    } catch {
      label.textContent = "Sound unavailable";
    }
  } else {
    atmosphereAudio.pause();
    soundToggle.setAttribute("aria-pressed", "false");
    label.textContent = "Music off";
  }
});

function closeLightbox() {
  if (!lightbox || !lightboxImage || !lightboxPanel) return;
  lightbox.hidden = true;
  document.body.classList.remove("lightbox-open");
  lightboxImage.removeAttribute("src");
  lightboxImage.alt = "";
  lightboxPanel.classList.remove("is-portrait", "is-shane");
  lastLightboxTrigger?.focus();
}

document.querySelectorAll("[data-lightbox-src]").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    if (!lightbox || !lightboxImage || !lightboxCaption || !lightboxPanel) return;
    const source = trigger.dataset.lightboxSrc;
    const caption = trigger.dataset.lightboxCaption || "";
    const kind = trigger.dataset.lightboxKind || "";
    if (!source) return;

    lastLightboxTrigger = trigger;
    lightboxImage.src = source;
    lightboxImage.alt = caption;
    lightboxCaption.textContent = caption;
    lightboxPanel.classList.toggle("is-portrait", kind.includes("portrait"));
    lightboxPanel.classList.toggle("is-shane", kind.includes("shane"));
    lightbox.hidden = false;
    document.body.classList.add("lightbox-open");
    lightbox.querySelector(".lightbox-close")?.focus();
  });
});

lightboxCloseButtons?.forEach((button) => button.addEventListener("click", closeLightbox));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && lightbox && !lightbox.hidden) closeLightbox();
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
