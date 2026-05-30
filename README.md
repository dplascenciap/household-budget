# Household Budget — Frisbee-Plascencia

A real-time household expense tracker built with Vite + React + Firebase.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Deploy to Vercel

1. Push this repo to GitHub (private repo)
2. Import the repo in vercel.com
3. Add these environment variables in Vercel project settings:

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

4. After deploy, copy the Vercel URL and add it to:
   Firebase Console → Authentication → Settings → Authorized domains

## Firestore security rules

Paste `firestore.rules` content into:
Firebase Console → Firestore Database → Rules → Publish
