# Development Guide

## Prerequisites
- Node.js v22+
- Dart SDK 3.7+
- PostgreSQL server running

## Setup

```bash
# Clone repo
git clone https://github.com/Justindwinata/TRANSUMIN.git
cd TRANSUMIN

# Backend
cd apps/backend
npm install
cp .env.example .env
npx prisma generate
npm run seed

# Mobile
cd apps/mobile
dart pub get

# Run backend
cd apps/backend
npm run dev

# Run mobile
cd apps/mobile
flutter run
```

## Useful Commands

- Backend lint: `npm run lint` (in `apps/backend`)
- Backend test: `npm test` (in `apps/backend`)
- Mobile test: `flutter test` (in `apps/mobile`)
