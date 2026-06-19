const messageButton = document.querySelector(".message-button");
const voicemail = document.querySelector("#voicemail");
const signupForm = document.querySelector("[data-signup-form]");
const formStatus = document.querySelector("[data-form-status]");

document.querySelector("[data-year]").textContent = new Date().getFullYear();

messageButton?.addEventListener("click", () => {
  const isOpen = messageButton.getAttribute("aria-expanded") === "true";
  messageButton.setAttribute("aria-expanded", String(!isOpen));
  voicemail.hidden = isOpen;
  messageButton.querySelector("[data-message-label]").textContent = isOpen ? "Play the message" : "Hide the message";
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
