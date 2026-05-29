# Gesture Heart Field

A Vite + React + Three.js web app that renders a gesture-controlled heart particle field.

The current UI shows a large colorful heart made of small heart particles, plus a rotating half-orbit particle trail. MediaPipe Gesture Recognizer is loaded on demand when the user starts camera tracking.

## Local Development

```powershell
npm install
npm run dev
```

Open `http://127.0.0.1:5173/`.

## Build

```powershell
npm run build
```

The static site is generated into `dist/`.

## Important Camera Note

Real camera access requires a secure browser context:

- Works on `localhost` / `127.0.0.1`
- Works on public `https://` domains
- Does not work on public `http://IP` addresses

Until HTTPS is configured, the deployed HTTP page can show the particle effect and simulated gestures, but real camera gesture tracking will not start.
