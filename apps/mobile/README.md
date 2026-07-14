# Aria — Mobile App

Expo Router · React Native · TypeScript · NativeWind

## Quickstart

```bash
npm install
cp .env.example .env          # set EXPO_PUBLIC_API_URL
npx expo start                # scan QR with Expo Go
```

## Structure

```
app/
  _layout.tsx          root layout — auth gate, providers, fonts
  (auth)/
    login.tsx
    register.tsx
  (tabs)/
    chat.tsx            streaming AI chat with TTS output
    tasks.tsx           task list with haptic complete
    notes.tsx           notes grid with modal editor
    settings.tsx        theme picker, voice toggle, sign out
lib/
  auth.tsx             AuthContext using expo-secure-store (not AsyncStorage)
  theme.tsx            ThemeContext — reads tokens, drives StyleSheet colors
packages/
  api-client/          typed fetch + SSE client (shared with web)
  tokens/              design tokens — all 4 themes
  ui/                  shared utilities (formatRelative, initials…)
```

## Build for stores (EAS)

```bash
npm install -g eas-cli
eas login
eas build --platform all --profile production
eas submit --platform ios
eas submit --platform android
```

Fill in your Apple ID and Play Store service account in `eas.json` before submitting.
