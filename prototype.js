const assets = {
  intake: "assets/prototype/agency-office-clean-playable-plate-v0.3.png",
  office: "assets/prototype/agency-office-clean-playable-plate-v0.3.png",
  dialogue: "assets/prototype/shane-sophia-office-dialogue-clean-plate-v0.3.png",
  voicemail: "assets/prototype/voicemail-analysis-clean-plate-v0.3.png",
  housing: "assets/prototype/housing-choice-playable-plate-v0.3.png",
  housingKeys: "assets/prototype/housing-paperwork-keys-closeup-v0.2.png",
  housingLease: "assets/prototype/A17-lease-check-keys-triptych-v0.1.png",
  housingFirstLook: {
    "Downtown efficiency": "assets/prototype/A18-downtown-efficiency-first-look-v0.1.png",
    "Warehouse District conversion": "assets/prototype/A18-warehouse-conversion-first-look-v0.1.png",
    "Harbourtown-edge brownstone": "assets/prototype/A18-harbourtown-brownstone-first-look-v0.1.png",
  },
  housingFirstNight: {
    "Downtown efficiency": "assets/prototype/A29-downtown-efficiency-first-night-v0.1.png",
    "Warehouse District conversion": "assets/prototype/warehouse-first-night-getting-ready-bed-v0.5.png",
    "Harbourtown-edge brownstone": "assets/prototype/A29-harbourtown-brownstone-first-night-v0.1.png",
  },
  bedtime: {
    sink: "assets/prototype/bathroom-sink-washcloth-toothbrush-bedtime-v0.6.png",
    changing: "assets/prototype/changing-behind-screen-bedtime-v0.6.png",
    bedEdge: "assets/prototype/sitting-on-bed-edge-bedtime-v0.6.png",
  },
  harbourtown: "assets/prototype/harbourtown-arrival-profile-adaptable-v0.4.png",
  ellie: "assets/prototype/sophia-ellie-dock-conversation-v0.4.png",
  camera: "assets/prototype/pov-camera-blue-container-id-clean-v0.4.png",
  note: "assets/prototype/field-note-overlay-safe-plate-v0.4.png",
  board: "assets/prototype/return-to-board-playable-plate-v0.3.png",
  boardClose: "assets/prototype/board-theory-follow-up-overlay-safe-v0.4.png",
  housingNight: "assets/prototype/housing-first-night-clean-plate-v0.4.png",
  officeSleep: "assets/prototype/office-sleep-fallback-clean-plate-v0.4.png",
};

const steps = [
  "intake",
  "arrival",
  "intro",
  "tools",
  "pin",
  "route",
  "housingTour",
  "housingFirstLook",
  "voicemail",
  "prep",
  "harbourtown",
  "ellie",
  "camera",
  "note",
  "board",
  "wrapup",
  "bedtimeSink",
  "bedtimeChanging",
  "bedtimeBedEdge",
  "ending",
];

const state = {
  step: "intake",
  visited: new Set(["intake"]),
  profile: {},
  inspections: new Set(),
  pin: "",
  route: "",
  housing: "",
  voicemail: new Set(),
  harbour: new Set(),
  clueCaptured: false,
  note: "",
  board: new Set(),
  theory: "",
  followup: "",
  lateHousing: false,
};

const el = {
  image: document.querySelector("[data-scene-image]"),
  workspace: document.querySelector("[data-workspace]"),
  speaker: document.querySelector("[data-speaker]"),
  line: document.querySelector("[data-line]"),
  actions: document.querySelector("[data-actions]"),
  panel: document.querySelector("[data-dialogue-panel]"),
  day: document.querySelector("[data-day]"),
  location: document.querySelector("[data-location]"),
  progress: document.querySelector("[data-progress]"),
  profile: document.querySelector("[data-profile-summary]"),
  route: document.querySelector("[data-route-summary]"),
  evidence: document.querySelector("[data-evidence-list]"),
  notes: document.querySelector("[data-note-list]"),
  game: document.querySelector(".game-shell"),
};

function icon(name) {
  const paths = {
    camera: '<circle cx="12" cy="13" r="3.2"></circle><path d="M4 8h3l1.4-2h7.2L17 8h3v11H4z"></path>',
    notebook: '<path d="M7 4h10a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"></path><path d="M9 8h6M9 12h6M9 16h4"></path>',
    phone: '<rect x="8" y="3" width="8" height="18" rx="2"></rect><path d="M11 18h2"></path>',
    board: '<path d="M5 4h14v16H5z"></path><path d="M8 8h8M8 12h5M8 16h7"></path>',
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">${paths[name]}</svg>`;
}

function setScene(step) {
  state.step = step;
  state.visited.add(step);
  render();
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
}

function button(label, onClick, className = "primary-button", attrs = "") {
  return `<button class="${className}" type="button" ${attrs}>${label}</button>`;
}

function bindButtons(handlers) {
  Object.entries(handlers).forEach(([key, handler]) => {
    document.querySelectorAll(`[data-action="${key}"]`).forEach((node) => {
      node.addEventListener("click", handler);
    });
  });
}

function render() {
  el.game.dataset.step = state.step;
  renderProgress();
  renderState();
  const renderers = {
    intake,
    arrival,
    intro,
    tools,
    pin,
    route,
    housingTour,
    housingFirstLook,
    voicemail,
    prep,
    harbourtown,
    ellie,
    camera,
    note,
    board,
    wrapup,
    bedtimeSink,
    bedtimeChanging,
    bedtimeBedEdge,
    ending,
  };
  renderers[state.step]();
}

function scene(image, location, speaker, line) {
  el.image.src = image;
  el.location.textContent = location;
  el.speaker.textContent = speaker;
  el.line.textContent = line;
  setStoryPanel(speaker);
  el.actions.innerHTML = "";
  el.workspace.innerHTML = "";
}

function setStoryPanel(speaker) {
  const key = speaker.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const speechSpeakers = new Set(["shane", "sophia", "ellie", "marlene"]);
  const diegeticSpeakers = new Set(["phone", "camera", "notebook", "sophia-s-note", "agency-form-01", "anonymous-caller"]);
  el.panel.dataset.speakerKey = key || "narration";
  el.panel.dataset.mode = speechSpeakers.has(key) ? "speech" : diegeticSpeakers.has(key) ? "diegetic" : "caption";
}

function renderProgress() {
  const current = steps.indexOf(state.step);
  el.progress.innerHTML = steps
    .filter((step) => step !== "housingTour")
    .slice(0, 9)
    .map((_, index) => {
      const className = index < Math.min(current, 8) ? "done" : index === Math.min(current, 8) ? "active" : "";
      return `<span class="${className}"></span>`;
    })
    .join("");
}

function housingFirstLookAsset() {
  return assets.housingFirstLook[state.housing] || assets.housing;
}

function housingNightAsset() {
  return assets.housingFirstNight[state.housing] || assets.housingNight;
}

function renderState() {
  const profile = state.profile.name
    ? `${state.profile.name} · ${state.profile.pronouns || "pronouns unset"}`
    : "Intake pending";
  el.profile.textContent = profile;
  el.route.textContent = state.route
    ? `${state.route === "housing" ? "Housing first" : "Case first"}${state.housing ? ` · ${state.housing}` : ""}`
    : "Unchosen";

  const evidence = [];
  if (state.voicemail.size) evidence.push("Voicemail phrases marked");
  if (state.clueCaptured) evidence.push("Altered Blue Container ID photographed");
  if (state.board.has("evidence")) evidence.push("Evidence card pinned");
  el.evidence.innerHTML = evidence.length ? evidence.map((item) => `<li>${item}</li>`).join("") : "<li>No evidence placed yet</li>";

  const notes = [];
  if (state.note) notes.push(state.note);
  if (state.board.has("theory")) notes.push(`Theory: ${state.theory || "repaint may hide when supplies moved"}`);
  if (state.board.has("follow")) notes.push(`Follow-up: ${state.followup || "maintenance and correction logs"}`);
  el.notes.innerHTML = notes.length ? notes.map((item) => `<li>${item}</li>`).join("") : "<li>Notebook empty</li>";
}

function intake() {
  scene(assets.intake, "Agency Intake", "Agency Form 01", "Junior investigator intake. The room is quiet enough to hear the pen hesitate.");
  el.workspace.innerHTML = `
    <form class="card" data-intake-form>
      <p class="eyebrow">Junior investigator intake</p>
      <h1>Saint Meridian</h1>
      <div class="field-grid">
        <div class="field">
          <label for="name">Preferred name</label>
          <input id="name" name="name" required autocomplete="given-name" />
        </div>
        <div class="field">
          <label for="pronouns">Pronouns</label>
          <select id="pronouns" name="pronouns" required>
            <option value="">Select</option>
            <option>she/her</option>
            <option>he/him</option>
            <option>they/them</option>
            <option>she/they</option>
            <option>he/they</option>
          </select>
        </div>
        <div class="field">
          <label for="appearance">Visible profile</label>
          <input id="appearance" name="appearance" required placeholder="hair, glasses, build, presentation" />
        </div>
        <div class="field">
          <label for="temper">Working tendency</label>
          <select id="temper" name="temper" required>
            <option value="">Select</option>
            <option>careful observer</option>
            <option>direct questioner</option>
            <option>pattern finder</option>
            <option>quiet listener</option>
          </select>
        </div>
        <div class="field wide">
          <label for="why">Why this work?</label>
          <textarea id="why" name="why" required></textarea>
        </div>
      </div>
      <p>This proof-of-concept uses AI-assisted temporary imagery and music under Christian Piatt's creative direction. Final production is planned with human art and music direction.</p>
      <button class="primary-button" type="submit">Sign intake</button>
    </form>`;
  document.querySelector("[data-intake-form]").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    state.profile = Object.fromEntries(new FormData(form));
    setScene("arrival");
  });
}

function arrival() {
  scene(assets.office, "Agency Office", "Narration", `${state.profile.name || "You"} steps into the agency before anyone has decided what kind of investigator you are. The board is already looking back.`);
  const inspectDone = state.inspections.has("desk") && state.inspections.has("board") && state.inspections.has("file");
  el.workspace.innerHTML = `
    <div class="card">
      <p class="eyebrow">First look</p>
      <h2>The office faces inward.</h2>
      <div class="hotspot-grid">
        ${hotspot("desk", "Your desk", "A camera, notebook, and agency phone wait in a careful row.")}
        ${hotspot("board", "The board", "Bella Moreau's name has a place before you understand why.")}
        ${hotspot("file", "The file", "A fifteen-year-old girl looks back from a photograph nobody has learned how to answer.")}
      </div>
    </div>`;
  el.actions.innerHTML = inspectDone ? button("Continue", "", "primary-button", 'data-action="next"') : "";
  bindHotspots();
  bindButtons({ next: () => setScene("intro") });
}

function hotspot(id, title, text) {
  const done = state.inspections.has(id) ? "done" : "";
  return `<button class="hotspot ${done}" type="button" data-hotspot="${id}"><strong>${title}</strong><span>${text}</span></button>`;
}

function bindHotspots() {
  document.querySelectorAll("[data-hotspot]").forEach((node) => {
    node.addEventListener("click", () => {
      state.inspections.add(node.dataset.hotspot);
      render();
    });
  });
}

function intro() {
  scene(assets.dialogue, "Agency Office", "Sophia", "Shane trusts evidence because it does not flatter anyone. I trust what people do when evidence makes them afraid.");
  el.workspace.innerHTML = `
    <div class="card">
      <p class="eyebrow">Shane Parker · Sophia Alvarez</p>
      <h2>First briefing</h2>
      <div class="choice-grid">
        <button class="choice-button" type="button" data-action="tone" data-tone="observe"><strong>Watch first</strong><span>Let the room reveal its order.</span></button>
        <button class="choice-button" type="button" data-action="tone" data-tone="ask"><strong>Ask directly</strong><span>Put the first question on the table.</span></button>
        <button class="choice-button" type="button" data-action="tone" data-tone="connect"><strong>Name the pattern</strong><span>Start with the thread between Bella and the docks.</span></button>
      </div>
    </div>`;
  bindButtons({ tone: (event) => {
    state.profile.tone = event.currentTarget.dataset.tone;
    setScene("tools");
  }});
}

function tools() {
  scene(assets.office, "Agency Office", "Shane", "The tools are ordinary. That's the point. Ordinary things survive panic better than theories do.");
  el.workspace.innerHTML = `
    <div class="tool-panel">
      <div class="tool-row">
        <div class="tool">${icon("camera")}Camera</div>
        <div class="tool">${icon("notebook")}Notebook</div>
        <div class="tool">${icon("phone")}Phone</div>
        <div class="tool">${icon("board")}Case board</div>
      </div>
    </div>
    <div class="card">
      <p>Cafe Origin coffee cools beside the phone. Sophia's note is short enough to be annoying.</p>
    </div>`;
  el.actions.innerHTML = button("Check phone", "", "primary-button", 'data-action="phone"');
  bindButtons({ phone: () => setScene("pin") });
}

function pin() {
  scene(assets.housing, "Player Desk", "Sophia's note", "Yes. Really. - S");
  const unlocked = state.pin === "5150";
  el.workspace.innerHTML = `
    <div class="phone-ui">
      <div class="phone-screen">
        <p class="label">Agency phone</p>
        <div class="pin-display">${state.pin.padEnd(4, "•")}</div>
        <div class="pin-grid">
          ${[1,2,3,4,5,6,7,8,9,"clear",0,"enter"].map((key) => `<button class="pin-key" type="button" data-key="${key}">${key}</button>`).join("")}
        </div>
        <p class="phone-note">${unlocked ? "Unlocked" : "PIN required"}</p>
      </div>
    </div>`;
  el.actions.innerHTML = unlocked ? button("Open messages", "", "primary-button", 'data-action="route"') : "";
  document.querySelectorAll("[data-key]").forEach((key) => {
    key.addEventListener("click", () => {
      const value = key.dataset.key;
      if (value === "clear") state.pin = "";
      else if (value === "enter" && state.pin !== "5150") state.pin = "";
      else if (value !== "enter" && state.pin.length < 4) state.pin += value;
      render();
    });
  });
  bindButtons({ route: () => setScene("route") });
}

function route() {
  scene(assets.housing, "Agency Office", "Phone", "Two messages wait: Marlene with housing keys, and an anonymous caller pulling the room toward Harbourtown.");
  el.workspace.innerHTML = `
    <div class="card">
      <p class="eyebrow">First choice</p>
      <h2>What gets your first hour?</h2>
      <div class="choice-grid">
        <button class="choice-button" type="button" data-action="housing"><strong>Housing first</strong><span>Marlene has keys, terms, and a clock that does not care about case boards.</span></button>
        <button class="choice-button" type="button" data-action="case"><strong>Case first</strong><span>The caller gave you a place, a color, and just enough fear to be useful.</span></button>
      </div>
    </div>`;
  bindButtons({
    housing: () => {
      state.route = "housing";
      setScene("housingTour");
    },
    case: () => {
      state.route = "case";
      setScene("voicemail");
    },
  });
}

function housingTour() {
  scene(assets.housing, "Housing Office", "Marlene", "I have three workable options. Workable is not a promise of peace, privacy, or silence.");
  el.workspace.innerHTML = `
    <div class="card">
      <p class="eyebrow">Housing options</p>
      <h2>Choose a key</h2>
      <div class="choice-grid">
        <button class="choice-button" type="button" data-action="home" data-home="Downtown efficiency"><strong>Downtown efficiency</strong><span>Close, narrow, honest about its limits.</span></button>
        <button class="choice-button" type="button" data-action="home" data-home="Warehouse District conversion"><strong>Warehouse District conversion</strong><span>More space than comfort, fewer questions than walls.</span></button>
        <button class="choice-button" type="button" data-action="home" data-home="Harbourtown-edge brownstone"><strong>Harbourtown-edge brownstone</strong><span>Near enough to hear the port before breakfast and the rumors before lunch.</span></button>
      </div>
    </div>`;
  bindButtons({ home: (event) => {
    state.housing = event.currentTarget.dataset.home;
    setScene("housingFirstLook");
  }});
}

function housingFirstLook() {
  const descriptions = {
    "Downtown efficiency": "The room is narrow, close to the street, and honest about what it cannot hold.",
    "Warehouse District conversion": "Old industrial walls make the space feel larger than the night can use.",
    "Harbourtown-edge brownstone": "The port is close enough to become a sound instead of a place.",
  };
  const housedLate = state.lateHousing;
  scene(housingFirstLookAsset(), state.housing, "Narration", descriptions[state.housing] || "The key works. The place begins answering to you.");
  el.workspace.innerHTML = `
    <div class="card">
      <p class="eyebrow">First look</p>
      <h2>${state.housing}</h2>
      <p>${housedLate ? "The case is already on the board. The room becomes the unfinished thing you come back to." : "Keys, terms, and one quiet room. The case waits without becoming smaller."}</p>
    </div>`;
  el.actions.innerHTML = housedLate
    ? button("End at home", "", "primary-button", 'data-action="finish-late-home"')
    : button("Return to case", "", "primary-button", 'data-action="return-case"');
  bindButtons({
    "return-case": () => setScene("voicemail"),
    "finish-late-home": () => {
      state.lateHousing = false;
      setScene("wrapup");
    },
  });
}

function voicemail() {
  scene(assets.voicemail, "Agency Office", "Anonymous caller", "Something is wrong at the docks. Go to Harbourtown. Ask about the Blue Containers.");
  const phrases = [
    ["docks", "at the docks"],
    ["harbourtown", "Go to Harbourtown"],
    ["blue", "Blue Containers"],
  ];
  const ready = state.voicemail.size >= 2;
  el.workspace.innerHTML = `
    <div class="card">
      <p class="eyebrow">Voicemail analysis</p>
      <div class="waveform">${Array.from({ length: 24 }, (_, i) => `<i style="height:${18 + ((i * 17) % 52)}px"></i>`).join("")}</div>
      <div class="transcript">
        ${phrases.map(([id, text]) => `<button class="chip ${state.voicemail.has(id) ? "selected" : ""}" type="button" data-phrase="${id}">${text}</button>`).join("")}
      </div>
    </div>`;
  el.actions.innerHTML = ready ? button("Draft first theory", "", "primary-button", 'data-action="prep"') : button("Replay", "", "ghost-button", 'data-action="noop" disabled');
  document.querySelectorAll("[data-phrase]").forEach((node) => {
    node.addEventListener("click", () => {
      state.voicemail.has(node.dataset.phrase) ? state.voicemail.delete(node.dataset.phrase) : state.voicemail.add(node.dataset.phrase);
      render();
    });
  });
  bindButtons({ prep: () => setScene("prep") });
}

function prep() {
  scene(assets.dialogue, "Agency Office", "Shane", "Sophia takes Harbourtown. I start with records. If the paperwork is trying to look boring, make it nervous.");
  el.workspace.innerHTML = `
    <div class="card">
      <p class="eyebrow">First theory</p>
      <h2>Blue Containers?</h2>
      <p>The caller gives you a place, a phrase, and a pressure point. The fact is small. The pattern is not.</p>
    </div>`;
  el.actions.innerHTML = button("Meet Sophia at Harbourtown", "", "primary-button", 'data-action="go"');
  bindButtons({ go: () => setScene("harbourtown") });
}

function harbourtown() {
  scene(assets.harbourtown, "Harbourtown", "Sophia", "Look before you photograph. People notice a camera. Containers only tell on themselves if you let the scene stay quiet.");
  const ready = state.harbour.has("routine") && state.harbour.has("sightline");
  el.workspace.innerHTML = `
    <div class="card">
      <p class="eyebrow">Public edge</p>
      <h2>Harbourtown</h2>
      <div class="hotspot-grid">
        <button class="hotspot ${state.harbour.has("routine") ? "done" : ""}" type="button" data-harbour="routine"><strong>Worker rhythm</strong><span>Who moves freely, who waits, who pretends waiting is normal.</span></button>
        <button class="hotspot ${state.harbour.has("sightline") ? "done" : ""}" type="button" data-harbour="sightline"><strong>Container sightline</strong><span>A repainted ID sits just wrong in the row.</span></button>
      </div>
    </div>`;
  el.actions.innerHTML = ready ? button("Ask Ellie", "", "primary-button", 'data-action="ellie"') : "";
  document.querySelectorAll("[data-harbour]").forEach((node) => {
    node.addEventListener("click", () => {
      state.harbour.add(node.dataset.harbour);
      render();
    });
  });
  bindButtons({ ellie: () => setScene("ellie") });
}

function ellie() {
  scene(assets.ellie, "Harbourtown Docks", "Ellie", "Blue ones move like anything else until somebody important needs them to have moved yesterday.");
  el.workspace.innerHTML = `
    <div class="card">
      <p class="eyebrow">Source note</p>
      <h2>Ellie will talk, carefully.</h2>
      <div class="choice-grid">
        <button class="choice-button" type="button" data-action="camera" data-topic="blue"><strong>Blue Containers</strong><span>Ask what changes when they come through.</span></button>
        <button class="choice-button" type="button" data-action="camera" data-topic="routine"><strong>Handling routine</strong><span>Ask what normal looks like before someone edits it.</span></button>
      </div>
    </div>`;
  bindButtons({ camera: () => setScene("camera") });
}

function camera() {
  scene(assets.camera, "Container Yard Public Edge", "Camera", "The altered ID fills the frame. Fresh blue paint catches light differently around the number line.");
  el.workspace.innerHTML = `
    <div class="camera-ui">
      <div class="reticle" aria-hidden="true"></div>
      <div class="capture-flash" data-flash></div>
      <div class="camera-hud">
        <span>Altered ID area</span>
        <button class="primary-button" type="button" data-action="capture">${state.clueCaptured ? "Captured" : "Capture"}</button>
      </div>
    </div>`;
  el.actions.innerHTML = state.clueCaptured ? button("Open notebook", "", "primary-button", 'data-action="note"') : "";
  bindButtons({
    capture: () => {
      state.clueCaptured = true;
      document.querySelector("[data-flash]")?.classList.add("on");
      setTimeout(render, 350);
    },
    note: () => setScene("note"),
  });
}

function note() {
  scene(assets.note, "Harbourtown", "Notebook", "The photograph is a fact. The note decides what kind of fact you think it is.");
  const categories = [
    ["fact", "Fact: fresh blue paint around altered Blue Container ID"],
    ["report", "Report: caller named Harbourtown and Blue Containers"],
    ["interpretation", "Interpretation: repaint may hide when supplies moved"],
    ["follow-up", "Follow-up: request maintenance and correction logs"],
  ];
  el.workspace.innerHTML = `
    <div class="note-ui">
      <p class="eyebrow">Field note</p>
      <div class="note-tabs">
        ${categories.map(([id, text]) => `<button class="chip ${state.note === text ? "selected" : ""}" type="button" data-note="${text}">${id}</button>`).join("")}
      </div>
    </div>`;
  el.actions.innerHTML = state.note ? button("Return to agency", "", "primary-button", 'data-action="board"') : "";
  document.querySelectorAll("[data-note]").forEach((node) => {
    node.addEventListener("click", () => {
      state.note = node.dataset.note;
      render();
    });
  });
  bindButtons({ board: () => setScene("board") });
}

function board() {
  scene(assets.boardClose, "Agency Office", "Sophia", "Now decide what deserves gravity. Not everything strange earns a pin.");
  const theoryOptions = [
    "repaint may hide when supplies moved",
    "someone corrected the record after the container moved",
    "Blue Containers may be ordinary cover for a protected route",
  ];
  const followOptions = [
    "maintenance and correction logs",
    "gate logs and shift handoffs",
    "who authorized the repaint",
  ];
  const cards = [
    ["evidence", "Evidence", "Player photo: altered Blue Container ID, fresh paint around the number line."],
    ["theory", "Theory", state.theory ? `Player theory: ${state.theory}.` : "Choose the strongest interpretation before pinning."],
    ["follow", "Follow-up", state.followup ? `Next pull: ${state.followup}.` : "Choose what the agency checks next."],
  ];
  const complete = cards.every(([id]) => state.board.has(id));
  el.workspace.innerHTML = `
    <div class="board-ui">
      <p class="eyebrow">Case board</p>
      <div class="interpretation-grid">
        <div>
          <p class="label">Theory wording</p>
          ${theoryOptions.map((text) => `<button class="chip ${state.theory === text ? "selected" : ""}" type="button" data-theory="${text}">${text}</button>`).join("")}
        </div>
        <div>
          <p class="label">Follow-up wording</p>
          ${followOptions.map((text) => `<button class="chip ${state.followup === text ? "selected" : ""}" type="button" data-followup="${text}">${text}</button>`).join("")}
        </div>
      </div>
      <div class="board-grid">
        ${cards.map(([id, title, text]) => `
          <button class="board-card ${state.board.has(id) ? "placed" : ""}" type="button" data-board="${id}">
            <strong>${title}</strong><span>${text}</span>
          </button>`).join("")}
      </div>
    </div>`;
  el.actions.innerHTML = complete ? button("Close Day One", "", "primary-button", 'data-action="wrapup"') : "";
  document.querySelectorAll("[data-theory]").forEach((node) => {
    node.addEventListener("click", () => {
      state.theory = node.dataset.theory;
      state.board.delete("theory");
      render();
    });
  });
  document.querySelectorAll("[data-followup]").forEach((node) => {
    node.addEventListener("click", () => {
      state.followup = node.dataset.followup;
      state.board.delete("follow");
      render();
    });
  });
  document.querySelectorAll("[data-board]").forEach((node) => {
    node.addEventListener("click", () => {
      const id = node.dataset.board;
      if (id === "theory" && !state.theory) return;
      if (id === "follow" && !state.followup) return;
      state.board.add(id);
      render();
    });
  });
  bindButtons({ wrapup: () => setScene("wrapup") });
}

function wrapup() {
  const housed = Boolean(state.housing);
  scene(housed ? housingNightAsset() : assets.officeSleep, housed ? state.housing : "Agency Office", housed ? "Narration" : "Sophia", housed ? "The key waits in your pocket. The case does not understand boundaries yet." : "You can still deal with Marlene, or you can sleep here and let the board keep its lights on.");
  el.workspace.innerHTML = `
    <div class="card">
      <p class="eyebrow">End of day</p>
      <h2>${housed ? "Getting ready" : "One last choice"}</h2>
      <p>${housed ? "The room is yours for the night. The case stays outside the frame for as long as it can." : "Case first does not erase housing. It only decides which unfinished thing gets the room."}</p>
    </div>`;
  el.actions.innerHTML = housed
    ? button("Wash up", "", "primary-button", 'data-action="bedtime-sink"')
    : `${button("Handle housing now", "", "ghost-button", 'data-action="late-housing"')} ${button("Sleep at office", "", "primary-button", 'data-action="ending"')}`;
  bindButtons({
    "bedtime-sink": () => setScene("bedtimeSink"),
    ending: () => setScene("ending"),
    "late-housing": () => {
      state.lateHousing = true;
      setScene("housingTour");
    },
  });
}

function bedtimeSink() {
  scene(assets.bedtime.sink, state.housing, "Narration", "Water runs. The city keeps its lights on. For one minute, the case is only a shape in the next room.");
  el.workspace.innerHTML = `
    <div class="card">
      <p class="eyebrow">Bedtime</p>
      <h2>Wash up</h2>
      <p>Toothbrush, washcloth, glass. Ordinary motions, performed carefully.</p>
    </div>`;
  el.actions.innerHTML = button("Change clothes", "", "primary-button", 'data-action="bedtime-changing"');
  bindButtons({ "bedtime-changing": () => setScene("bedtimeChanging") });
}

function bedtimeChanging() {
  scene(assets.bedtime.changing, state.housing, "Narration", "Behind the screen, the day becomes fabric and shadow. The phone stays where you can hear it.");
  el.workspace.innerHTML = `
    <div class="card">
      <p class="eyebrow">Bedtime</p>
      <h2>Change clothes</h2>
      <p>The screen gives privacy. The room gives none.</p>
    </div>`;
  el.actions.innerHTML = button("Sit down", "", "primary-button", 'data-action="bedtime-bed-edge"');
  bindButtons({ "bedtime-bed-edge": () => setScene("bedtimeBedEdge") });
}

function bedtimeBedEdge() {
  scene(assets.bedtime.bedEdge, state.housing, "Narration", "You sit down before you lie down. The first day does not end so much as loosen its grip.");
  el.workspace.innerHTML = `
    <div class="card">
      <p class="eyebrow">Bedtime</p>
      <h2>Edge of sleep</h2>
      <p>The notebook is closed. The question is not.</p>
    </div>`;
  el.actions.innerHTML = button("End at home", "", "primary-button", 'data-action="ending"');
  bindButtons({ ending: () => setScene("ending") });
}

function ending() {
  const housed = Boolean(state.housing);
  scene(housed ? housingNightAsset() : assets.officeSleep, housed ? state.housing : "Agency Office", housed ? "Narration" : "Shane", housed ? "The key works. The case comes in behind you." : "Couch is yours if you need it. Lock the board room before you sleep.");
  el.workspace.innerHTML = `
    <div class="card">
      <p class="eyebrow">Day One complete</p>
      <h2>${housed ? "Chosen housing" : "Office fallback"}</h2>
      <p>The records say it left. The paint is still wet. Bella's case is still waiting.</p>
    </div>`;
  el.actions.innerHTML = `
    ${button("Replay case first", "", "ghost-button", 'data-action="reset-case"')}
    ${button("Replay housing first", "", "ghost-button", 'data-action="reset-housing"')}`;
  bindButtons({
    "reset-case": () => reset("case"),
    "reset-housing": () => reset("housing"),
  });
}

function reset(route) {
  state.inspections = new Set(["desk", "board", "file"]);
  state.pin = "5150";
  state.route = route;
  state.housing = "";
  state.voicemail = new Set();
  state.harbour = new Set();
  state.clueCaptured = false;
  state.note = "";
  state.board = new Set();
  state.theory = "";
  state.followup = "";
  state.lateHousing = false;
  setScene(route === "housing" ? "housingTour" : "voicemail");
}

render();
