/* =========================================================================
   app.js — Notes Keeper application logic
   ========================================================================= */
import {
  auth,
  watchAuthState,
  signInGuest,
  signUpWithEmail,
  sendVerificationEmail,
  loginWithEmail,
  loginWithGoogle,
  logout,
  requestPasswordReset,
  changePassword,
  changeDisplayName,
  subscribeToNotes,
  createNote,
  updateNote,
  deleteNoteForever,
  batchUpdateOrder
} from "./firebase.js";

/* --------------------------------- Icons -------------------------------- */
const ICONS = {
  notes: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="3" width="16" height="18" rx="2"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="12" y2="16"/></svg>',
  archive: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8"/><line x1="10" y1="13" x2="14" y2="13"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
  unlock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-2"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M5 20h14"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/></svg>',
  grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1.2"/><rect x="14" y="3" width="7" height="7" rx="1.2"/><rect x="3" y="14" width="7" height="7" rx="1.2"/><rect x="14" y="14" width="7" height="7" rx="1.2"/></svg>',
  list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/></svg>',
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="4.5"/><line x1="12" y1="1.5" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22.5"/><line x1="1.5" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22.5" y2="12"/><line x1="4.6" y1="4.6" x2="6.3" y2="6.3"/><line x1="17.7" y1="17.7" x2="19.4" y2="19.4"/><line x1="4.6" y1="19.4" x2="6.3" y2="17.7"/><line x1="17.7" y1="6.3" x2="19.4" y2="4.6"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>',
  markdown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M6 15V9l3 3 3-3v6"/><path d="M15 9v6"/><path d="M13 13l2 2 2-2"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2l2 5 5 1-4 4 1 6-4-3-4 3 1-6-4-4 5-1z"/></svg>',
  restore: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 12a9 9 0 1 0 3-6.7"/><polyline points="3 4 3 9 8 9"/></svg>',
  google: '<svg viewBox="0 0 24 24"><path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.2s2.7-6.2 6-6.2c1.9 0 3.1.8 3.9 1.5l2.6-2.5C16.9 3.2 14.7 2.2 12 2.2 6.9 2.2 2.7 6.4 2.7 11.5S6.9 20.8 12 20.8c6.9 0 9-4.8 9-7.3 0-.5-.05-.9-.12-1.3H12z"/></svg>',
  more: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>'
};
function iconSvg(name) { return ICONS[name] || ""; }
function hydrateIcons(root = document) {
  root.querySelectorAll("[data-icon]").forEach((el) => {
    el.innerHTML = iconSvg(el.dataset.icon);
  });
}

/* --------------------------------- Colors -------------------------------- */
const COLORS = [
  { key: "default", label: "Default" },
  { key: "amber", label: "Amber" },
  { key: "rose", label: "Rose" },
  { key: "sage", label: "Sage" },
  { key: "sky", label: "Sky" },
  { key: "lavender", label: "Lavender" },
  { key: "clay", label: "Clay" },
  { key: "slate", label: "Slate" }
];

/* --------------------------------- State --------------------------------- */
const state = {
  user: null,
  notes: [],
  view: "all", // all | archived | hidden | trash
  layout: localStorage.getItem("nk_layout") || "grid",
  theme: localStorage.getItem("nk_theme") || "dark",
  search: "",
  unlockedNoteIds: new Set(), // notes unlocked this session
  activeNoteId: null,
  dragId: null
};

const TRASH_RETENTION_DAYS = 30;

/* ------------------------------ DOM shortcuts ----------------------------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $all = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* ================================ Init =================================== */
document.addEventListener("DOMContentLoaded", () => {
  hydrateIcons();
  applyTheme(state.theme);
  applyLayoutIcon();
  buildColorSwatches($("#composerColors"), null, (key) => {
    composerState.color = key;
  });
  buildColorSwatches($("#modalColors"), null, (key) => {
    if (state.activeNoteId) saveModalField({ color: key });
    highlightColorSwatches($("#modalColors"), key);
  });
  wireStaticEvents();
  watchAuthState(onAuthChange);
  setInterval(sweepExpiredTrash, 60 * 60 * 1000); // hourly sweep while open
});

/* ============================== Auth handling ============================= */
let unsubscribeNotes = null;

async function onAuthChange(user) {
  if (!user) {
    try {
      await signInGuest();
      await addDemoNote(auth.currentUser.uid);
    } catch (e) {
      console.error(e);
      toast("Could not start a guest session", "error");
    }
    return; // onAuthChange will fire again with the anonymous user
  }
  state.user = user;
  updateAccountUI(user);

  if (unsubscribeNotes) unsubscribeNotes();
  unsubscribeNotes = subscribeToNotes(
    user.uid,
    (notes) => {
      state.notes = notes;
      sweepExpiredTrash();
      render();
    },
    (err) => {
      //console.error(err);
      toast("Couldn't sync notes — check your Firebase config", "error");
    }
  );
}

function updateAccountUI(user) {
  const banner = $("#guestBanner");
  const name = $("#accountName");
  const status = $("#accountStatus");
  const avatar = $("#accountAvatar");
  const signInBtn = $("#accountSignInBtn");
  const signOutBtn = $("#accountSignOutBtn");
  const settingsBtn = $("#accountSettingsBtn");

  if (user.isAnonymous) {
    // banner.hidden = localStorage.getItem("nk_banner_dismissed") === "1";
    banner.hidden = false; // always show banner for now
    name.textContent = "Guest";
    status.textContent = "Not signed in";
    avatar.textContent = "G";
    signInBtn.hidden = false;
    signOutBtn.hidden = true;
    settingsBtn.hidden = true;
  } else {
    banner.hidden = true;
    const label = user.displayName || user.email || "Account";
    name.textContent = label;
    status.textContent = user.email || "Signed in";
    avatar.textContent = label.charAt(0).toUpperCase();
    signInBtn.hidden = true;
    signOutBtn.hidden = false;
    settingsBtn.hidden = false;
  }
}

/* ================================ Rendering ================================ */
function currentNotes() {
  const q = state.search.trim().toLowerCase();
  let list = state.notes.filter((n) => {
    if (state.view === "trash") return n.isDeleted;
    if (n.isDeleted) return false;
    if (state.view === "archived") return n.isArchived && !n.isHidden;
    if (state.view === "hidden") return n.isHidden;
    // "all" view: not archived, not hidden
    return !n.isArchived && !n.isHidden;
  });
  if (q) {
    list = list.filter((n) => {
      if (n.isHidden && !state.unlockedNoteIds.has(n.id)) return n.passwordHint?.toLowerCase().includes(q);
      return (n.title || "").toLowerCase().includes(q) || (n.content || "").toLowerCase().includes(q);
    });
  }
  return list;
}

function sortNotes(list) {
  return [...list].sort((a, b) => {
    if (state.view === "trash") return (b.deletedAt?.seconds || 0) - (a.deletedAt?.seconds || 0);
    return (a.order ?? 0) - (b.order ?? 0);
  });
}

function render() {
  const grid = $("#notesGrid");
  const pinnedWrap = $("#pinnedWrap");
  const pinnedGrid = $("#pinnedGrid");
  grid.innerHTML = "";
  pinnedGrid.innerHTML = "";

  const layoutClass = state.layout === "list" ? "is-list" : "";
  grid.className = `notes-grid ${layoutClass}`;
  pinnedGrid.className = `notes-grid ${layoutClass}`;

  const all = sortNotes(currentNotes());
  const isAllView = state.view === "all";
  $("#composer").hidden = !isAllView;

  let pinned = [];
  let rest = all;
  if (isAllView) {
    pinned = all.filter((n) => n.isPinned);
    rest = all.filter((n) => !n.isPinned);
  }

  pinnedWrap.hidden = !(isAllView && pinned.length);
  pinned.forEach((n) => pinnedGrid.appendChild(buildNoteCard(n)));
  rest.forEach((n) => grid.appendChild(buildNoteCard(n)));

  renderEmptyState(all.length === 0);
  updateViewTitle();
  wireDragAndDrop();
}

function updateViewTitle() {
  const titles = { all: "All Notes", archived: "Archived", hidden: "Hidden Notes", trash: "Trash" };
  $("#viewTitle").textContent = titles[state.view];
}

function renderEmptyState(isEmpty) {
  const el = $("#emptyState");
  el.hidden = !isEmpty;
  if (!isEmpty) return;
  const icon = $("#emptyStateIcon");
  const title = $("#emptyStateTitle");
  const text = $("#emptyStateText");
  const copy = {
    all: ["notes", "No notes yet", "Start typing above to capture your first note."],
    archived: ["archive", "Archive is empty", "Notes you archive will be tucked away here."],
    hidden: ["lock", "No hidden notes", "Lock a note with a password to keep it private."],
    trash: ["trash", "Trash is empty", "Deleted notes stay here for 30 days before they're gone for good."]
  };
  const [iconName, t, d] = copy[state.view];
  if (state.search.trim()) {
    icon.innerHTML = iconSvg("search");
    title.textContent = "No matches";
    text.textContent = `Nothing found for "${state.search.trim()}".`;
    return;
  }
  icon.innerHTML = iconSvg(iconName);
  title.textContent = t;
  text.textContent = d;
}

async function addDemoNote(uid) {
  try {
    const DEMO_NOTE_TITLE = "Welcome to Notes Keeper 👋";
    const DEMO_NOTE_CONTENT = `Glad you're here! This note is a quick tour of what you can do — feel free to edit or delete it once you're comfortable.

Tap the pencil icon on any note to edit it, or hit **Preview** to see it rendered like this.

### Formatting text
You can write in **bold**, *italic*, or \`inline code\`. Just use the same Markdown you'd use anywhere else — no special toolbar needed.

### Getting started checklist
- [ ] Create your first real note
- [x] Open this welcome note
- [ ] Try pinning a note
- [ ] Try archiving a note
- [ ] Lock a note with a password
- [ ] Export a note as PDF

### What you can do with any note
- Pin it to the top of your list
- Archive it for later
- Lock it behind a password
- Export it as Markdown, plain text, or PDF
- Move it to trash and restore it later if you change your mind

### Getting set up, step by step
1. Pick a color for your note using the swatches in the editor
2. Switch between grid and list view from the toolbar
3. Use the search bar to find any note instantly
4. Toggle dark or light mode from the top bar
5. Head to Account settings to update your name or password

---

### A closer look at organizing notes
- Views
  - Grid view — best for scanning many notes at once
  - List view — best for reading longer notes
- Note states
  - [x] Active — shows up on the home page
  - [ ] Archived — tucked away, still searchable
  - [ ] Trashed — recoverable for a limited time before it's gone for good

### A note on privacy
Locked notes need a password to open, edit, or export — so keep that password somewhere safe. There's no way to recover a locked note's content without it because its highly encrypted.

That's the tour! Go ahead and make this app yours.`;

    await createNote(uid, {
      title: DEMO_NOTE_TITLE,
      content: DEMO_NOTE_CONTENT,
      color: "default",
      order: Date.now()
    });
  } catch (e) {
    console.error("Couldn't create the welcome note", e);
  }
}

/* ------------------------------- Note card ------------------------------- */
function buildNoteCard(note) {
  const card = document.createElement("article");
  card.className = "note-card";
  card.dataset.color = note.color || "default";
  card.dataset.id = note.id;
  card.draggable = state.view === "all" && !state.search.trim();

  const locked = note.isHidden && !state.unlockedNoteIds.has(note.id);

  const daysLeft = note.isDeleted && note.deletedAt?.seconds
    ? Math.max(0, TRASH_RETENTION_DAYS - Math.floor((Date.now() / 1000 - note.deletedAt.seconds) / 86400))
    : null;

  card.innerHTML = `
      ${note.isPinned ? `<span class="note-card__pin" data-icon="pin"></span>` : ""}
      <div class="note-card__body">
        ${locked
      ? `<div class="note-card__locked"><span data-icon="lock"></span><p>Locked note</p>${note.passwordHint ? `<small>Hint: ${escapeHtml(note.passwordHint)}</small>` : ""}</div>`
      : `
            ${note.title ? `<h4 class="note-card__title">${escapeHtml(note.title)}</h4>` : ""}
            <div class="note-card__content markdown-body">${renderMarkdownSync(truncate(note.content || "", cardContentLimit()))}</div>
          `
    }
      </div>
      ${daysLeft !== null ? `<div class="note-card__expiry">${daysLeft} day${daysLeft === 1 ? "" : "s"} left in trash</div>` : ""}
      <div class="note-card__footer">
        <button class="icon-btn sm" data-action="pin" title="${note.isPinned ? "Unpin" : "Pin"}" data-icon="pin"></button>
        <button class="icon-btn sm" data-action="archive" title="${note.isArchived ? "Unarchive" : "Archive"}" data-icon="archive"></button>
        <button class="icon-btn sm" data-action="lock" title="${note.isHidden ? "Unlock" : "Lock"}" data-icon="${note.isHidden ? "unlock" : "lock"}"></button>
        <button class="icon-btn sm" data-action="export" title="Export" data-icon="download"></button>
        ${note.isDeleted
      ? `<button class="icon-btn sm" data-action="restore" title="Restore" data-icon="restore"></button>
             <button class="icon-btn sm icon-btn--danger" data-action="delete-forever" title="Delete forever" data-icon="trash"></button>`
      : `<button class="icon-btn sm icon-btn--danger" data-action="delete" title="Move to trash" data-icon="trash"></button>`
    }
      </div>
    `;

  hydrateIcons(card);

  card.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      handleCardAction(note, btn.dataset.action, btn);
    });
  });

  card.addEventListener("click", () => openNoteFromCard(note));
  return card;
}

function cardContentLimit() {
  return window.innerWidth <= 640 ? 100 : 300;
}
function truncate(str, n) { return str.length > n ? str.slice(0, n) + "…" : str; }
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function renderMarkdownSync(text) {
  const lines = escapeHtml(text).split("\n");
  const out = [];
  let listType = null; // "ul" | "ol" | "checklist"

  const closeList = () => {
    if (listType) { out.push(listType === "ol" ? "</ol>" : "</ul>"); listType = null; }
  };
  const inline = (line) => line
    .replace(/```([\s\S]*?)```/g, (_, c) => `<pre><code>${c}</code></pre>`)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/^#{1,6}\s?(.*)$/, "<strong>$1</strong>");

  for (const line of lines) {
    const checkbox = line.match(/^[-*]\s+\[( |x|X)\]\s+(.*)$/);
    const bullet = !checkbox && line.match(/^[-*]\s+(.*)$/);
    const numbered = !checkbox && !bullet && line.match(/^\d+\.\s+(.*)$/);

    if (checkbox) {
      if (listType !== "checklist") { closeList(); out.push('<ul class="checklist">'); listType = "checklist"; }
      const checked = checkbox[1].toLowerCase() === "x";
      out.push(`<li><input type="checkbox" disabled ${checked ? "checked" : ""}/><span>${inline(checkbox[2])}</span></li>`);
    } else if (bullet) {
      if (listType !== "ul") { closeList(); out.push("<ul>"); listType = "ul"; }
      out.push(`<li>${inline(bullet[1])}</li>`);
    } else if (numbered) {
      if (listType !== "ol") { closeList(); out.push("<ol>"); listType = "ol"; }
      out.push(`<li>${inline(numbered[1])}</li>`);
    } else {
      closeList();
      out.push(inline(line) + "<br>");
    }
  }
  closeList();
  return out.join("\n");
}

/* ============================== Card actions ============================== */
async function handleCardAction(note, action, anchorEl) {
  switch (action) {
    case "pin":
      await updateNote(note.id, { isPinned: !note.isPinned });
      toast(note.isPinned ? "Unpinned" : "Pinned");
      break;
    case "archive":
      await updateNote(note.id, { isArchived: !note.isArchived, isPinned: false });
      toast(note.isArchived ? "Unarchived" : "Archived");
      break;
    case "lock":
      if (note.isHidden) openUnlockToRemove(note);
      else openLockModal(note);
      break;
    case "export":
      if (note.isHidden && !state.unlockedNoteIds.has(note.id)) {
        openUnlockPrompt(note, () => exportNote(note, anchorEl));
      } else {
        exportNote(note, anchorEl);
      }
      break;
    case "delete":
      if (await confirmDialog("Move to trash?", "You can restore this note within 30 days.")) {
        await updateNote(note.id, { isDeleted: true, deletedAt: new Date(), isPinned: false });
        toast("Moved to trash");
      }
      break;
    case "restore":
      await updateNote(note.id, { isDeleted: false, deletedAt: null });
      toast("Note restored");
      break;
    case "delete-forever":
      if (await confirmDialog("Delete forever?", "This note will be permanently removed. This can't be undone.")) {
        await deleteNoteForever(note.id);
        toast("Deleted forever");
      }
      break;
  }
}

function openNoteFromCard(note) {
  if (note.isHidden && !state.unlockedNoteIds.has(note.id)) {
    openUnlockPrompt(note, () => openNoteModal(note));
  } else {
    openNoteModal(note);
  }
}

async function setModalMode(mode) {
  markdownPreviewOn = mode === "preview";
  const toggleBtn = $("#modalMarkdownToggle");
  const titleInput = $("#modalTitle");
  if (markdownPreviewOn) {
    flushModalFields();
    $("#modalPreview").innerHTML = await renderMarkdownAsync($("#modalContent").value);
    $("#modalPreview").hidden = false;
    $("#modalContent").hidden = true;
    // $("#modalColors").hidden = true;
    $("#modalColors").classList.add("is-invisible");     // preview branch
    titleInput.readOnly = true;
    toggleBtn.title = "Edit note";
    toggleBtn.classList.add("is-glowing");
    toggleBtn.querySelector("[data-icon]").innerHTML = iconSvg("edit");
  } else {
    $("#modalPreview").hidden = true;
    $("#modalContent").hidden = false;
    // $("#modalColors").hidden = false;
    $("#modalColors").classList.remove("is-invisible");  // edit branch
    titleInput.readOnly = false;
    toggleBtn.title = "Preview note";
    toggleBtn.classList.remove("is-glowing");
    toggleBtn.querySelector("[data-icon]").innerHTML = iconSvg("markdown");
    titleInput.focus();
  }
}

/* ============================== Composer (new note) ============================== */
const composerState = { color: "default" };

function wireComposer() {
  const collapsed = $("#composerCollapsed");
  const expanded = $("#composerExpanded");
  const title = $("#composerTitle");
  const content = $("#composerContent");

  collapsed.addEventListener("click", () => {
    collapsed.hidden = true;
    expanded.hidden = false;
    highlightColorSwatches($("#composerColors"), composerState.color);
    content.focus();
  });

  document.addEventListener("click", (e) => {
    if (!expanded.hidden && !$("#composer").contains(e.target)) {
      submitComposer();
    }
  });

  $("#composerCancel").addEventListener("click", () => resetComposer());
  $("#composerExpanded").addEventListener("submit", (e) => { e.preventDefault(); submitComposer(); });
}

async function submitComposer() {
  const title = $("#composerTitle").value.trim();
  const content = $("#composerContent").value.trim();
  if (!title && !content) { resetComposer(); return; }
  setSaveIndicator($("#composerSaveIndicator"), "saving");
  try {
    await createNote(state.user.uid, { title, content, color: composerState.color, order: Date.now() });
    setSaveIndicator($("#composerSaveIndicator"), "saved");
    toast("Note saved");
  } catch (e) {
    //console.error(e);
    toast("Couldn't save note", "error");
  }
  resetComposer();
}

function resetComposer() {
  $("#composerTitle").value = "";
  $("#composerContent").value = "";
  composerState.color = "default";
  $("#composerCollapsed").hidden = false;
  $("#composerExpanded").hidden = true;
  $("#composerSaveIndicator").textContent = "";
}

/* Flush the composer synchronously on unload so in-progress notes aren't lost. */
function flushComposerOnUnload() {
  if ($("#composerExpanded").hidden) return;
  const title = $("#composerTitle").value.trim();
  const content = $("#composerContent").value.trim();
  if (!title && !content) return;
  createNote(state.user.uid, { title, content, color: composerState.color, order: Date.now() }).catch(() => { });
}

/* ============================== Note modal (edit) ============================== */
let modalDirty = null; // debounced-save timer holder
let markdownPreviewOn = false;

function openNoteModal(note) {
  state.activeNoteId = note.id;
  $("#modalTitle").value = note.title || "";
  $("#modalContent").value = note.content || "";
  highlightColorSwatches($("#modalColors"), note.color || "default");
  $("#modalSaveIndicator").textContent = "";
  updateModalMeta(note);
  updateModalActionStates(note);
  $("#noteModalOverlay").hidden = false;
  setModalMode("preview");
}

function closeNoteModal() {
  flushModalFields();
  $("#noteModalOverlay").hidden = true;
  state.activeNoteId = null;
}

function activeNote() { return state.notes.find((n) => n.id === state.activeNoteId); }

function updateModalMeta(note) {
  const updated = note.updatedAt?.seconds ? new Date(note.updatedAt.seconds * 1000).toLocaleString() : "just now";
  $("#modalMeta").textContent = `Edited ${updated}`;
}

function updateModalActionStates(note) {
  $("#modalPin").classList.toggle("is-active", !!note.isPinned);
  $("#modalArchive").classList.toggle("is-active", !!note.isArchived);
  $("#modalLock").classList.toggle("is-active", !!note.isHidden);
  $("#modalLock").querySelector("[data-icon]").innerHTML = iconSvg(note.isHidden ? "unlock" : "lock");
  $("#modalRestore").hidden = !note.isDeleted;
  $("#modalDeleteForever").hidden = !note.isDeleted;
  $("#modalDelete").hidden = !!note.isDeleted;
}

async function saveModalField(patch) {
  const note = activeNote();
  if (!note) return;
  setSaveIndicator($("#modalSaveIndicator"), "saving");
  try {
    await updateNote(note.id, patch);
    setSaveIndicator($("#modalSaveIndicator"), "saved");
  } catch (e) {
    //console.error(e);
    setSaveIndicator($("#modalSaveIndicator"), "error");
  }
}

function flushModalFields() {
  const note = activeNote();
  if (!note) return;
  const title = $("#modalTitle").value.trim();
  const content = $("#modalContent").value;
  if (title !== (note.title || "") || content !== (note.content || "")) {
    saveModalField({ title, content });
  }
}

function wireModal() {
  $("#noteModalClose").addEventListener("click", closeNoteModal);
  $("#noteModalOverlay").addEventListener("click", (e) => { if (e.target.id === "noteModalOverlay") closeNoteModal(); });

  // Autosave on blur (focus change) for both fields.
  $("#modalTitle").addEventListener("blur", flushModalFields);
  $("#modalContent").addEventListener("blur", flushModalFields);

  // $("#modalMarkdownToggle").addEventListener("click", async () => {
  //   markdownPreviewOn = !markdownPreviewOn;
  //   if (markdownPreviewOn) {
  //     flushModalFields();
  //     $("#modalPreview").innerHTML = await renderMarkdownAsync($("#modalContent").value);
  //     $("#modalPreview").hidden = false;
  //     $("#modalContent").hidden = true;
  //   } else {
  //     $("#modalPreview").hidden = true;
  //     $("#modalContent").hidden = false;
  //   }
  // });

  $("#modalMarkdownToggle").addEventListener("click", () => {
    setModalMode(markdownPreviewOn ? "edit" : "preview");
  });

  $("#modalPin").addEventListener("click", () => {
    const note = activeNote();
    updateNote(note.id, { isPinned: !note.isPinned });
    toast(note.isPinned ? "Unpinned" : "Pinned");
  });
  $("#modalArchive").addEventListener("click", () => {
    const note = activeNote();
    updateNote(note.id, { isArchived: !note.isArchived, isPinned: false });
    toast(note.isArchived ? "Unarchived" : "Archived");
    closeNoteModal();
  });
  $("#modalLock").addEventListener("click", () => {
    const note = activeNote();
    if (note.isHidden) openUnlockToRemove(note);
    else openLockModal(note);
  });
  $("#modalExport").addEventListener("click", () => exportNote(activeNote(), $("#modalExport")));
  $("#modalDelete").addEventListener("click", async () => {
    const note = activeNote();
    if (await confirmDialog("Move to trash?", "You can restore this note within 30 days.")) {
      await updateNote(note.id, { isDeleted: true, deletedAt: new Date(), isPinned: false });
      toast("Moved to trash");
      closeNoteModal();
    }
  });
  $("#modalRestore").addEventListener("click", async () => {
    const note = activeNote();
    await updateNote(note.id, { isDeleted: false, deletedAt: null });
    toast("Note restored");
    closeNoteModal();
  });
  $("#modalDeleteForever").addEventListener("click", async () => {
    const note = activeNote();
    if (await confirmDialog("Delete forever?", "This note will be permanently removed. This can't be undone.")) {
      await deleteNoteForever(note.id);
      toast("Deleted forever");
      closeNoteModal();
    }
  });
}

/* Live-updates the open modal's chrome when the underlying note changes
   (e.g. after a pin/lock toggle round-trips through Firestore). */
function refreshOpenModalIfNeeded() {
  if (!state.activeNoteId || $("#noteModalOverlay").hidden) return;
  const note = activeNote();
  if (note) { updateModalActionStates(note); updateModalMeta(note); }
}

/* ============================== Markdown (async, full) ============================== */
let markedPromise = null;
async function renderMarkdownAsync(text) {
  try {
    if (!markedPromise) {
      markedPromise = Promise.all([
        import("https://esm.sh/marked@9"),
        import("https://esm.sh/dompurify@3")
      ]);
    }
    const [{ marked }, DOMPurifyMod] = await markedPromise;
    const DOMPurify = DOMPurifyMod.default;
    return DOMPurify.sanitize(marked.parse(text || ""));
  } catch (e) {
    return renderMarkdownSync(text);
  }
}

/* ============================== Password lock ============================== */
async function sha256Hex(str) {
  if (!window.isSecureContext || !crypto.subtle) {
    // crypto.subtle only exists in secure contexts (HTTPS, or http://localhost).
    // On a phone hitting your dev machine's LAN IP over plain http, this is
    // undefined and note locking will silently fail — serve over HTTPS (or a
    // tunnel like ngrok) to fix it on mobile.
    throw new Error("Locking notes requires a secure connection (HTTPS). This page isn't loaded securely.");
  }
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function openLockModal(note) {
  $("#lockPasswordInput").value = "";
  $("#lockHintInput").value = "";
  $("#lockError").hidden = true;
  $("#passwordSetOverlay").hidden = false;
  $("#passwordSetOverlay").dataset.noteId = note.id;
  $("#lockPasswordInput").focus();
}

function openUnlockPrompt(note, onSuccess) {
  $("#unlockPasswordInput").value = "";
  $("#unlockError").hidden = true;
  $("#unlockHintText").textContent = note.passwordHint ? `Hint: ${note.passwordHint}` : "This note is protected.";
  $("#passwordPromptOverlay").hidden = false;
  $("#passwordPromptOverlay").dataset.noteId = note.id;
  $("#passwordPromptOverlay").dataset.mode = "view";
  $("#passwordPromptOverlay")._onSuccess = onSuccess;
  $("#unlockPasswordInput").focus();
}

function openUnlockToRemove(note) {
  openUnlockPrompt(note, async () => {
    await updateNote(note.id, { isHidden: false, password: null, passwordHint: "" });
    toast("Note unlocked");
    refreshOpenModalIfNeeded();
  });
}

function wirePasswordModals() {
  $("#lockCancelBtn").addEventListener("click", () => { $("#passwordSetOverlay").hidden = true; });
  $("#lockConfirmBtn").addEventListener("click", async () => {
    const pw = $("#lockPasswordInput").value;
    if (pw.length < 4) { $("#lockError").textContent = "Use at least 4 characters."; $("#lockError").hidden = false; return; }
    const hint = $("#lockHintInput").value.trim();
    const noteId = $("#passwordSetOverlay").dataset.noteId;
    try {
      const hash = await sha256Hex(pw);
      await updateNote(noteId, { isHidden: true, password: hash, passwordHint: hint, isPinned: false });
      $("#passwordSetOverlay").hidden = true;
      toast("Note locked");
      refreshOpenModalIfNeeded();
    } catch (err) {
      //console.error(err);
      $("#lockError").textContent = err.message || "Couldn't lock this note. Please try again.";
      $("#lockError").hidden = false;
    }
  });

  $("#unlockCancelBtn").addEventListener("click", () => { $("#passwordPromptOverlay").hidden = true; });
  $("#unlockConfirmBtn").addEventListener("click", async () => {
    const overlay = $("#passwordPromptOverlay");
    const noteId = overlay.dataset.noteId;
    const note = state.notes.find((n) => n.id === noteId);
    const pw = $("#unlockPasswordInput").value;
    try {
      const hash = await sha256Hex(pw);
      if (hash !== note.password) {
        $("#unlockError").textContent = "Incorrect password.";
        $("#unlockError").hidden = false;
        return;
      }
      state.unlockedNoteIds.add(noteId);
      overlay.hidden = true;
      const cb = overlay._onSuccess;
      overlay._onSuccess = null;
      if (cb) cb();
      render();
    } catch (err) {
      //console.error(err);
      $("#unlockError").textContent = err.message || "Couldn't unlock this note. Please try again.";
      $("#unlockError").hidden = false;
    }
  });
}

/* ============================== Drag & drop reorder ============================== */
function wireDragAndDrop() {
  const containers = [$("#pinnedGrid"), $("#notesGrid")];
  containers.forEach((container) => {
    $all(".note-card[draggable='true']", container).forEach((card) => {
      card.addEventListener("dragstart", () => {
        state.dragId = card.dataset.id;
        card.classList.add("is-dragging");
      });
      card.addEventListener("dragend", () => card.classList.remove("is-dragging"));
      card.addEventListener("dragover", (e) => {
        e.preventDefault();
        const dragging = container.querySelector(".is-dragging");
        if (!dragging || dragging === card) return;
        const rect = card.getBoundingClientRect();
        const after = e.clientY > rect.top + rect.height / 2;
        container.insertBefore(dragging, after ? card.nextSibling : card);
      });
      card.addEventListener("drop", async (e) => {
        e.preventDefault();
        const ids = $all(".note-card", container).map((c) => c.dataset.id);
        const pairs = ids.map((id, i) => ({ id, order: i * 1000 }));
        try {
          await batchUpdateOrder(pairs);
        } catch (err) {
          //console.error(err);
        }
      });
    });
  });
}

/* ============================== Export ============================== */
// function exportNote(note) {
//   showFloatingMenu($("#exportAllBtn"), [
//     { label: "Export as .md", onClick: () => downloadText(`${slug(note.title)}.md`, `# ${note.title}\n\n${note.content}`) },
//     { label: "Export as .txt", onClick: () => downloadText(`${slug(note.title)}.txt`, `${note.title}\n\n${note.content}`) },
//     { label: "Export as PDF", onClick: () => exportAsPDF(note.title, note.content) }
//   ]);
// }
function exportNote(note, anchorEl) {
  showFloatingMenu(anchorEl || $("#exportAllBtn"), [
    { label: "Export as .md", onClick: () => downloadText(`${slug(note.title)}.md`, `# ${note.title}\n\n${note.content}`) },
    { label: "Export as .txt", onClick: () => downloadText(`${slug(note.title)}.txt`, `${note.title}\n\n${note.content}`) },
    { label: "Export as PDF", onClick: () => exportAsPDF(note.title, note.content) }
  ]);
}

function exportAllNotes() {
  showFloatingMenu($("#exportAllBtn"), [
    { label: "Export all as .md", onClick: () => downloadText("all-notes.md", bundleNotes("md")) },
    { label: "Export all as .txt", onClick: () => downloadText("all-notes.txt", bundleNotes("txt")) },
    { label: "Export all as PDF", onClick: () => exportAllNotesAsPDF() }
  ]);
}

// async function exportAsPDF(title, content) {
//   const printWindow = window.open("", "_blank");
//   if (!printWindow) {
//     toast("Please allow pop-ups for this site to export as PDF");
//     return;
//   }
//   const safeTitle = escapeHtml(title || "Untitled");
//   const bodyHtml = await renderMarkdownAsync(content || "");
//   printWindow.document.write(`<!doctype html>
// <html>
// <head>
// <meta charset="utf-8" />
// <title>${safeTitle}</title>
// <style>
//   body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #1a1a1a; max-width: 720px; margin: 0 auto; padding: 2.2rem 1.6rem; line-height: 1.65; }
//   h1 { font-size: 1.5rem; margin: 0 0 0.3rem; }
//   .meta { color: #777; font-size: 0.8rem; margin-bottom: 1.6rem; }
//   .content { font-size: 0.95rem; word-wrap: break-word; }
//   .content ul, .content ol { padding-left: 1.4em; }
//   .content li:has(input[type="checkbox"]) { list-style: none; margin-left: -1.4em; display: flex; align-items: flex-start; gap: 0.4em; }
//   .content li:has(input[type="checkbox"]) input { margin-top: 0.3em; }
//   .content hr { border: none; border-top: 1px solid #ccc; margin: 1.8rem 0; }
//   pre { background: #f2f2f2; padding: 0.6rem 0.8rem; border-radius: 6px; overflow-x: auto; white-space: pre-wrap; }
//   code { background: #f2f2f2; padding: 0.1rem 0.3rem; border-radius: 4px; }
//   @media print { body { padding: 0; } }
// </style>
// </head>
// <body>
//   <h1>${safeTitle}</h1>
//   <div class="meta">Exported ${new Date().toLocaleDateString()}</div>
//   <div class="content">${bodyHtml}</div>
// </body>
// </html>`);
//     printWindow.document.close();
//     setTimeout(() => {
//       printWindow.focus();
//       printWindow.print();
//     }, 300);
//   }

function printHtmlDocument(title, bodyHtml) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    toast("Please allow pop-ups for this site to export as PDF");
    return;
  }
  const safeTitle = escapeHtml(title || "Untitled");
  printWindow.document.write(`<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${safeTitle}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #1a1a1a; max-width: 720px; margin: 0 auto; padding: 2.2rem 1.6rem; line-height: 1.65; }
  h1 { font-size: 1.5rem; margin: 0 0 0.3rem; }
  .meta { color: #777; font-size: 0.8rem; margin-bottom: 1.6rem; }
  .content { font-size: 0.95rem; word-wrap: break-word; }
  .content ul, .content ol { padding-left: 1.4em; }
  .content li:has(input[type="checkbox"]) { list-style: none; margin-left: -1.4em; display: flex; align-items: flex-start; gap: 0.4em; }
  .content li:has(input[type="checkbox"]) input { margin-top: 0.3em; }
  .content hr { border: none; border-top: 1px solid #ccc; margin: 1.8rem 0; }
  .note-block + .note-block { margin-top: 2rem; padding-top: 2rem; border-top: 3px solid #ddd; page-break-before: always; }
  .note-block__title { font-size: 1.25rem; margin: 0 0 1rem; }
  pre { background: #f2f2f2; padding: 0.6rem 0.8rem; border-radius: 6px; overflow-x: auto; white-space: pre-wrap; }
  code { background: #f2f2f2; padding: 0.1rem 0.3rem; border-radius: 4px; }
  @media print { body { padding: 0; } }
</style>
</head>
<body>
  <h1>${safeTitle}</h1>
  <div class="meta">Exported ${new Date().toLocaleDateString()}</div>
  <div class="content">${bodyHtml}</div>
</body>
</html>`);
  printWindow.document.close();
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 300);
}

async function exportAsPDF(title, content) {
  const bodyHtml = await renderMarkdownAsync(content || "");
  printHtmlDocument(title, bodyHtml);
}
async function exportAllNotesAsPDF() {
  const visible = state.notes.filter((n) => !n.isDeleted && !n.isHidden);
  const blocks = await Promise.all(visible.map(async (n) => {
    const rendered = await renderMarkdownAsync(n.content || "");
    return `<div class="note-block"><h2 class="note-block__title">${escapeHtml(n.title || "Untitled")}</h2>${rendered}</div>`;
  }));
  printHtmlDocument("All notes", blocks.join(""));
}

function bundleNotes(format) {
  const visible = state.notes.filter((n) => !n.isDeleted && !n.isHidden);
  return visible
    .map((n) => (format === "md" ? `# ${n.title || "Untitled"}\n\n${n.content || ""}` : `${n.title || "Untitled"}\n\n${n.content || ""}`))
    .join(format === "md" ? "\n\n---\n\n" : "\n\n----------\n\n");
}
function slug(str) { return (str || "note").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40) || "note"; }
function downloadText(filename, text) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
  toast("Exported");
}

/* ============================== Floating menu ============================== */
function showFloatingMenu(anchor, items) {
  $all(".floating-menu").forEach((m) => m.remove());
  const menu = document.createElement("div");
  menu.className = "floating-menu";
  items.forEach((item) => {
    const btn = document.createElement("button");
    btn.textContent = item.label;
    btn.addEventListener("click", () => { item.onClick(); menu.remove(); });
    menu.appendChild(btn);
  });
  document.body.appendChild(menu);
  const rect = anchor.getBoundingClientRect();
  const menuWidth = menu.offsetWidth;
  const menuHeight = menu.offsetHeight;

  let left = rect.left + window.scrollX + rect.width / 2 - menuWidth / 2;
  left = Math.max(8, Math.min(left, window.innerWidth - menuWidth - 8));

  const spaceBelow = window.innerHeight - rect.bottom;
  const openUpward = spaceBelow < menuHeight + 12 && rect.top > menuHeight + 12;
  const top = openUpward
    ? rect.top + window.scrollY - menuHeight - 6
    : rect.bottom + window.scrollY + 6;

  menu.style.left = `${left}px`;
  menu.style.top = `${top}px`;
  setTimeout(() => {
    document.addEventListener("click", function handler(e) {
      if (!menu.contains(e.target)) { menu.remove(); document.removeEventListener("click", handler); }
    });
  }, 0);
}

/* ============================== Toasts ============================== */
function toast(message, type = "success") {
  const container = $("#toastContainer");
  const el = document.createElement("div");
  el.className = `toast toast--${type}`;
  el.textContent = message;
  container.appendChild(el);
  requestAnimationFrame(() => el.classList.add("is-visible"));
  setTimeout(() => {
    el.classList.remove("is-visible");
    setTimeout(() => el.remove(), 300);
  }, 2600);
}

/* ============================== Confirm dialog ============================== */
function confirmDialog(title, text) {
  return new Promise((resolve) => {
    $("#confirmTitle").textContent = title;
    $("#confirmText").textContent = text;
    $("#confirmOverlay").hidden = false;
    const ok = $("#confirmOkBtn");
    const cancel = $("#confirmCancelBtn");
    function cleanup(result) {
      $("#confirmOverlay").hidden = true;
      ok.removeEventListener("click", onOk);
      cancel.removeEventListener("click", onCancel);
      resolve(result);
    }
    function onOk() { cleanup(true); }
    function onCancel() { cleanup(false); }
    ok.addEventListener("click", onOk);
    cancel.addEventListener("click", onCancel);
  });
}

/* ============================== Save indicator ============================== */
function setSaveIndicator(el, status) {
  if (status === "saving") el.textContent = "Saving…";
  else if (status === "saved") { el.textContent = "Saved"; setTimeout(() => { if (el.textContent === "Saved") el.textContent = ""; }, 1800); }
  else if (status === "error") el.textContent = "Couldn't save";
}

/* ============================== Color swatches ============================== */
function buildColorSwatches(container, selected, onSelect) {
  container.innerHTML = "";
  COLORS.forEach((c) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "color-dot";
    dot.dataset.color = c.key;
    dot.title = c.label;
    dot.addEventListener("click", (e) => {
      e.stopPropagation();
      onSelect(c.key);
      highlightColorSwatches(container, c.key);
    });
    container.appendChild(dot);
  });
  highlightColorSwatches(container, selected || "default");
}
function highlightColorSwatches(container, key) {
  $all(".color-dot", container).forEach((d) => d.classList.toggle("is-selected", d.dataset.color === key));
}

/* ============================== Theme / layout ============================== */
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  $("#themeToggle span[data-icon]").innerHTML = iconSvg(theme === "dark" ? "moon" : "sun");
  localStorage.setItem("nk_theme", theme);
}
function applyLayoutIcon() {
  $("#layoutToggle span[data-icon]").innerHTML = iconSvg(state.layout === "grid" ? "grid" : "list");
}

/* ============================== Trash auto-sweep ============================== */
function sweepExpiredTrash() {
  const now = Date.now() / 1000;
  state.notes.forEach((n) => {
    if (n.isDeleted && n.deletedAt?.seconds) {
      const ageDays = (now - n.deletedAt.seconds) / 86400;
      if (ageDays > TRASH_RETENTION_DAYS) {
        deleteNoteForever(n.id).catch(() => { });
      }
    }
  });
}

/* ============================== Auth modal ============================== */
function openAuthModal(tab = "login") {
  $("#authModalOverlay").hidden = false;
  switchAuthTab(tab);
}
function switchAuthTab(tab) {
  $all(".auth-modal__tab").forEach((t) => t.classList.toggle("is-active", t.dataset.tab === tab));
  $("#loginForm").hidden = tab !== "login";
  $("#signupForm").hidden = tab !== "signup";
  $("#forgotForm").hidden = tab !== "forgot";
  // The tab strip, divider, and Google button don't apply to the
  // "forgot password" flow — hide them while it's active.
  $(".auth-modal__tabs").hidden = tab === "forgot";
  $("#authDivider").hidden = tab === "forgot";
  $("#googleSignInBtn").hidden = tab === "forgot";
  if (tab !== "forgot") {
    $("#forgotError").hidden = true;
    $("#forgotSuccess").hidden = true;
    $("#forgotForm").reset();
  }
}
function wireAuthModal() {
  $("#authModalClose").addEventListener("click", () => { $("#authModalOverlay").hidden = true; });
  $("#authModalOverlay").addEventListener("click", (e) => { if (e.target.id === "authModalOverlay") $("#authModalOverlay").hidden = true; });
  $all(".auth-modal__tab").forEach((t) => t.addEventListener("click", () => switchAuthTab(t.dataset.tab)));

  $("#loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    $("#loginError").hidden = true;
    try {
      await loginWithEmail($("#loginEmail").value.trim(), $("#loginPassword").value);
      $("#authModalOverlay").hidden = true;
      toast("Welcome back!");
    } catch (err) {
      $("#loginError").textContent = friendlyAuthError(err);
      $("#loginError").hidden = false;
    }
  });

  $("#signupForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    $("#signupError").hidden = true;
    try {
      const cred = await signUpWithEmail($("#signupEmail").value.trim(), $("#signupPassword").value, $("#signupName").value.trim());
      await addDemoNote(cred.user.uid);
      try { await sendVerificationEmail(); } catch (e) { console.error(e); }
      $("#authModalOverlay").hidden = true;
      toast("Account created — check your inbox to verify your email");
    } catch (err) {
      $("#signupError").textContent = friendlyAuthError(err);
      $("#signupError").hidden = false;
    }
  });

  $("#googleSignInBtn").addEventListener("click", async () => {
    try {
      const cred = await loginWithGoogle();
      await addDemoNote(cred.user.uid);
      $("#authModalOverlay").hidden = true;
      toast("Signed in with Google");
    } catch (err) {
      toast(friendlyAuthError(err), "error");
    }
  });

  // Forgot password
  $("#forgotPasswordLink").addEventListener("click", () => {
    $("#forgotEmail").value = $("#loginEmail").value;
    switchAuthTab("forgot");
  });
  $("#backToLoginLink").addEventListener("click", () => switchAuthTab("login"));
  $("#forgotForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    $("#forgotError").hidden = true;
    $("#forgotSuccess").hidden = true;
    try {
      await requestPasswordReset($("#forgotEmail").value.trim());
      $("#forgotSuccess").textContent = "Reset link sent — check your inbox.";
      $("#forgotSuccess").hidden = false;
    } catch (err) {
      $("#forgotError").textContent = friendlyAuthError(err);
      $("#forgotError").hidden = false;
    }
  });
}

/* ============================== Account settings modal ============================== */
function openAccountSettings() {
  const user = auth.currentUser;
  $("#settingsEmailInput").value = user.email || "No email on this account";
  $("#settingsNameInput").value = user.displayName || "";
  $("#settingsNameError").hidden = true;
  $("#settingsPasswordError").hidden = true;
  $("#settingsCurrentPassword").value = "";
  $("#settingsNewPassword").value = "";

  const hasPasswordProvider = user.providerData.some((p) => p.providerId === "password");
  $("#settingsPasswordSection").hidden = !hasPasswordProvider;
  $("#settingsGoogleNote").hidden = hasPasswordProvider;

  $("#accountSettingsOverlay").hidden = false;
}

function wireAccountSettingsModal() {
  $("#settingsCloseBtn").addEventListener("click", () => { $("#accountSettingsOverlay").hidden = true; });
  $("#accountSettingsOverlay").addEventListener("click", (e) => { if (e.target.id === "accountSettingsOverlay") $("#accountSettingsOverlay").hidden = true; });

  $("#settingsNameSaveBtn").addEventListener("click", async () => {
    const name = $("#settingsNameInput").value.trim();
    $("#settingsNameError").hidden = true;
    try {
      await changeDisplayName(name);
      updateAccountUI(auth.currentUser);
      toast("Name updated");
    } catch (err) {
      $("#settingsNameError").textContent = friendlyAuthError(err);
      $("#settingsNameError").hidden = false;
    }
  });

  $("#settingsPasswordSaveBtn").addEventListener("click", async () => {
    const current = $("#settingsCurrentPassword").value;
    const next = $("#settingsNewPassword").value;
    $("#settingsPasswordError").hidden = true;
    if (next.length < 6) {
      $("#settingsPasswordError").textContent = "New password should be at least 6 characters.";
      $("#settingsPasswordError").hidden = false;
      return;
    }
    try {
      await changePassword(current, next);
      $("#settingsCurrentPassword").value = "";
      $("#settingsNewPassword").value = "";
      toast("Password updated");
    } catch (err) {
      $("#settingsPasswordError").textContent = friendlyAuthError(err);
      $("#settingsPasswordError").hidden = false;
    }
  });
}
function friendlyAuthError(err) {
  const map = {
    "auth/email-already-in-use": "That email is already registered.",
    "auth/invalid-email": "That email doesn't look right.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/user-not-found": "No account found with that email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/requires-recent-login": "Please sign out and back in, then try again.",
    "auth/too-many-requests": "Too many attempts — please wait a moment and try again."
  };
  return map[err.code] || "Something went wrong. Please try again.";
}

/* ============================== Mobile sidebar ============================== */
function openSidebar() {
  $("#sidebar").classList.add("is-open");
  $("#sidebarBackdrop").classList.add("is-visible");
}
function closeSidebar() {
  $("#sidebar").classList.remove("is-open");
  $("#sidebarBackdrop").classList.remove("is-visible");
}
function toggleSidebar() {
  $("#sidebar").classList.contains("is-open") ? closeSidebar() : openSidebar();
}

/* ============================== Static wiring ============================== */
function wireStaticEvents() {
  wireComposer();
  wireModal();
  wirePasswordModals();
  wireAuthModal();
  wireAccountSettingsModal();

  // Sidebar nav
  $all(".nav__item").forEach((btn) => {
    btn.addEventListener("click", () => {
      $all(".nav__item").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      state.view = btn.dataset.view;
      $("#searchInput").value = "";
      state.search = "";
      $("#searchClear").hidden = true;
      render();
      if (window.innerWidth <= 900) closeSidebar();
    });
  });

  // Search
  $("#searchInput").addEventListener("input", (e) => {
    state.search = e.target.value;
    $("#searchClear").hidden = !state.search;
    render();
  });
  $("#searchClear").addEventListener("click", () => {
    $("#searchInput").value = "";
    state.search = "";
    $("#searchClear").hidden = true;
    render();
  });

  // Theme + layout toggles
  $("#themeToggle").addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    applyTheme(state.theme);
  });
  $("#layoutToggle").addEventListener("click", () => {
    state.layout = state.layout === "grid" ? "list" : "grid";
    localStorage.setItem("nk_layout", state.layout);
    applyLayoutIcon();
    render();
  });

  // Sidebar toggle (mobile)
  $("#sidebarToggle").addEventListener("click", (e) => { e.stopPropagation(); toggleSidebar(); });
  $("#sidebarBackdrop").addEventListener("click", () => closeSidebar());
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeSidebar(); });

  // Guest banner
  $("#guestBannerCta").addEventListener("click", () => openAuthModal("signup"));
  $("#guestBannerDismiss").addEventListener("click", () => {
    $("#guestBanner").hidden = true;
    // localStorage.setItem("nk_banner_dismissed", "1");
  });

  // Account menu
  $("#accountMenuBtn").addEventListener("click", (e) => {
    e.stopPropagation();
    $("#accountMenu").hidden = !$("#accountMenu").hidden;
  });
  document.addEventListener("click", () => { $("#accountMenu").hidden = true; });
  $("#accountSignInBtn").addEventListener("click", () => openAuthModal("login"));
  $("#accountSettingsBtn").addEventListener("click", () => openAccountSettings());
  $("#accountSignOutBtn").addEventListener("click", async () => {
    const ok = await confirmDialog("Sign out?", "You'll be signed out of your account on this device.");
    if (!ok) return;
    await logout();
    toast("Signed out");
  });

  // Export all
  $("#exportAllBtn").addEventListener("click", (e) => { e.stopPropagation(); exportAllNotes(); });

  // Persist in-flight edits when the tab closes / is hidden.
  window.addEventListener("beforeunload", () => { flushModalFields(); flushComposerOnUnload(); });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") { flushModalFields(); flushComposerOnUnload(); }
  });
}