# Kernel

A minimal, ambient multi-model LLM chat workspace and landing page.

## Features

- **Multi-Model Support**: Switch between open-weight and frontier models mid-thread.
- **Ambient & Neutral UI**: Minimal, aesthetic interface with dark mode and smooth animations.
- **Supabase Authentication & Persistence**: Keep your chat history, models, and context in sync.
- **TanStack Start & React 19**: Modern full-stack architecture with server functions and streaming AI responses.

## Development

```sh
git clone https://github.com/viditpvttttt/kernel.git
cd kernel
npm install
npm run dev
```

## Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase and AI provider credentials:

```sh
cp .env.example .env
```

## Build

```sh
npm run build
npm run preview
```
