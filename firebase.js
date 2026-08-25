/* =========================================================================
   firebase.js — Firebase initialization + service layer for Notes Keeper
   =========================================================================
   SETUP INSTRUCTIONS
   -------------------------------------------------------------------------
   1. Go to https://console.firebase.google.com and create a project.
   2. Project settings > General > "Your apps" > Add a Web app.
      Copy the config object it gives you into `firebaseConfig` below.
   3. Build > Authentication > Sign-in method: enable
        - Anonymous
        - Email/Password
        - Google
   4. Build > Firestore Database: create a database (production mode).
      Paste the rules below into Firestore > Rules.

   ---- firestore.rules (copy into the Firebase console) ----
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /notes/{noteId} {
         allow read, update, delete: if request.auth != null
                          && request.auth.uid == resource.data.userId;
         allow create: if request.auth != null
                          && request.auth.uid == request.resource.data.userId;
       }
     }
   }
   -----------------------------------------------------------
   5. This is a static site — host it as-is on GitHub Pages.
   ========================================================================= */

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  linkWithPopup,
  linkWithCredential,
  EmailAuthProvider,
  sendPasswordResetEmail,
  updatePassword,
  reauthenticateWithCredential,
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  writeBatch,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

// -------------------------------------------------------------------------
// REPLACE WITH YOUR OWN FIREBASE PROJECT CONFIG
// -------------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyBksqjaD1x6s_ayVmz86q3iCgFktxKFUwI",
  authDomain: "notes-keeper-37217.firebaseapp.com",
  projectId: "notes-keeper-37217",
  storageBucket: "notes-keeper-37217.firebasestorage.app",
  messagingSenderId: "933044379839",
  appId: "1:933044379839:web:735429c104ca5721eb260a",
  measurementId: "G-HC7N2V1W0L"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
const NOTES_COLLECTION = "notes";

/* ---------------------------- Auth helpers ---------------------------- */

/** Fires `callback(user)` whenever auth state changes. */
function watchAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}

/** Signs the visitor in anonymously (used automatically on first load). */
async function signInGuest() {
  //console.log("Signing in as guest...");
  const cred = await signInAnonymously(auth);
  return cred.user;
}

export function sendVerificationEmail() {
  if (!auth.currentUser) return Promise.reject(new Error("Not signed in"));
  return sendEmailVerification(auth.currentUser);
}

/**
 * Creates a permanent account. If the current session is anonymous, the
 * anonymous account is *upgraded* in place (linkWithCredential) so all of
 * the guest's existing notes are preserved under the new account.
 */
async function signUpWithEmail(email, password, displayName) {
  //console.log("Signing up with email...");
  const current = auth.currentUser;
  if (current && current.isAnonymous) {
    const credential = EmailAuthProvider.credential(email, password);
    const result = await linkWithCredential(current, credential);
    if (displayName) await updateProfile(result.user, { displayName });
    return result.user;
  }
  const result = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) await updateProfile(result.user, { displayName });
  return result.user;
}

/** Logs into an existing email/password account (switches uid). */
async function loginWithEmail(email, password) {
  //console.log("Logging in with email...");
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

/** Google sign-in. Upgrades an anonymous session in place when possible. */
async function loginWithGoogle() {
  //console.log("Logging in with Google...");
  const current = auth.currentUser;
  try {
    if (current && current.isAnonymous) {
      const result = await linkWithPopup(current, googleProvider);
      return result.user;
    }
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err) {
    // Account already exists with this Google identity under a different
    // uid — fall back to a normal sign-in (guest notes will not merge).
    if (err.code === "auth/credential-already-in-use") {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    }
    throw err;
  }
}

/** Signs the user out and immediately starts a fresh guest session. */
async function logout() {
  //console.log("Logging out...");
  await signOut(auth);
  return signInGuest();
}

/** Sends a "reset your password" email for the given address. */
async function requestPasswordReset(email) {
  //console.log("Requesting password reset...");
  await sendPasswordResetEmail(auth, email);
}

/**
 * Changes the signed-in user's password. Firebase requires a "recent"
 * login for this, so we re-authenticate with their current password first
 * (this also doubles as verifying they actually know the old password).
 */
async function changePassword(currentPassword, newPassword) {
  //console.log("Changing password...");
  const user = auth.currentUser;
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
}

/** Updates the signed-in user's display name. */
async function changeDisplayName(name) {
  //console.log("Changing display name...");
  await updateProfile(auth.currentUser, { displayName: name });
}

/* -------------------------- Firestore helpers -------------------------- */

/** Subscribes to every note owned by `userId`. Returns an unsubscribe fn. */
function subscribeToNotes(userId, onChange, onError) {
  //console.log("Subscribing to notes...");
  const q = query(collection(db, NOTES_COLLECTION), where("userId", "==", userId));
  return onSnapshot(
    q,
    (snapshot) => {
      const notes = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      onChange(notes);
    },
    onError
  );
}

/** Creates a new note document, returns the new document id. */
async function createNote(userId, data) {
  //console.log("Creating note...");
  const ref = await addDoc(collection(db, NOTES_COLLECTION), {
    title: "",
    content: "",
    color: "default",
    isPinned: false,
    isArchived: false,
    isHidden: false,
    isDeleted: false,
    deletedAt: null,
    password: null,
    passwordHint: "",
    order: Date.now(),
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...data
  });
  return ref.id;
}

/** Patches an existing note document with new fields + updatedAt bump. */
async function updateNote(noteId, patch) {
  //console.log("Updating note...");
  await updateDoc(doc(db, NOTES_COLLECTION, noteId), {
    ...patch,
    updatedAt: serverTimestamp()
  });
}

/** Permanently removes a note document (used by Trash > Delete forever). */
async function deleteNoteForever(noteId) {
  //console.log("Deleting note forever...");
  await deleteDoc(doc(db, NOTES_COLLECTION, noteId));
}

/** Persists a batch of {id, order} pairs after a drag & drop reorder. */
async function batchUpdateOrder(pairs) {
  //console.log("Updating note order...");
  const batch = writeBatch(db);
  pairs.forEach(({ id, order }) => {
    batch.update(doc(db, NOTES_COLLECTION, id), { order });
  });
  await batch.commit();
}

/** One-off fetch used by the 30-day trash sweep. */
async function fetchAllNotesOnce(userId) {
  //console.log("Fetching all notes...");
  const q = query(collection(db, NOTES_COLLECTION), where("userId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export {
  auth,
  db,
  watchAuthState,
  signInGuest,
  signUpWithEmail,
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
  batchUpdateOrder,
  fetchAllNotesOnce
};
