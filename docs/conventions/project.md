# Project Conventions

## Monorepo Layout
- `android-app/` Android app (Kotlin + Firebase)
- `web-frontend/` Web frontend (Vite + React + Firebase)
- `web-backend/` Web backend (Spring Boot Java 21 + Firebase Admin)
- `docs/` Project documentation

## Android (Kotlin)
- Gradle Kotlin DSL (`build.gradle.kts`)
- Firebase dependencies via BoM
- Place `google-services.json` in `android-app/app/`

## Web Frontend (React)
- TypeScript + TSX
- Firebase config via `VITE_` env vars
- Local env file: `web-frontend/.env.local`

## Web Backend (Spring Boot)
- Java 21
- Firebase Admin SDK initialized via ADC
- Set `GOOGLE_APPLICATION_CREDENTIALS` locally

## Config & Secrets
- Never commit credentials
- Use `.env.local` for frontend secrets
- Use local environment variables for backend credentials
