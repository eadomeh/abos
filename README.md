# ABOS Auth Fix V1

Replaces:
- src/App.tsx
- src/components/auth/AuthScreen.tsx

Fixes:
- Keeps the auth screen mounted during Supabase PASSWORD_RECOVERY.
- Returns the user to the real app after a successful password reset.
- Surfaces Google/Apple OAuth configuration errors in the UI.
- Adds provider loading states.

Apply from the ABOS project root:
unzip -o /sdcard/Download/ABOS_AUTH_FIX_V1.zip
Then run:
npm run build
npm run lint
npm run typecheck
