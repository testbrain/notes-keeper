# Notes Keeper

A premium, Google Keep–inspired notes app built with vanilla HTML/CSS/JS and
Firebase (Auth + Firestore realtime sync).

## Files

- `index.html` — page structure and all modals
- `style.css` — dark (default) + light theme, responsive layout, animations
- `firebase.js` — Firebase init, auth, and Firestore service functions
- `app.js` — application logic (state, rendering, events)

## 1. Create a Firebase project

1. Go to the [Firebase console](https://console.firebase.google.com) and create a project.
2. **Build → Authentication → Sign-in method**: enable **Anonymous**,
   **Email/Password**, and **Google**.
3. **Build → Firestore Database**: create a database in production mode.
4. **Project settings → General → Your apps**: add a Web app and copy the
   config object.

## 2. Configure the app

Open `firebase.js` and replace the placeholder `firebaseConfig` object near
the top with the config from step 1.

## 3. Firestore security rules

In **Firestore → Rules**, paste:

```
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
```

This keeps every note private to the user that created it.

## 4. Run locally

Any static server works, e.g.:

```
npx serve .
```

(Opening `index.html` directly via `file://` will not work because the app
uses ES modules — it needs to be served over http.)

## 5. Deploy to GitHub Pages

1. Push this folder to a GitHub repo.
2. Repo **Settings → Pages** → set source to the branch/root containing
   these files.
3. Add your Pages domain to **Firebase → Authentication → Settings →
   Authorized domains** so Google sign-in works.

## Notes on the password-lock feature

## Guest (anonymous) accounts

New visitors are signed in anonymously right away so they can start taking
notes immediately. A banner reminds them their notes only live on this
device/browser until they create a real account. Signing up or signing in
with Google **upgrades the anonymous session in place**, so any notes taken
as a guest carry over to the new account automatically.
