# Chronis — AI Memory Companion

Chronis captures your life's signals into a private, end-to-end encrypted memory vault. You hold the key, and you choose the mode.

## Features

- **Private Memory Infrastructure**: AES-256-GCM encryption keys are generated on your hardware and never leave it in readable form.
- **You Hold the Key**: A 12-word recovery phrase you own. Chronis cannot read, reset, or recover your vault.
- **Transparent AI**: Every signal Chronis learns from is listed, toggleable, and revocable at any moment.
- **Ambient Hero Landing**: Visual assembly walkthrough of the Chronis pendant with smooth scroll scrubbing.

## Development

To run the project locally, ensure you have Node.js and npm installed.

```sh
npm install
npm run dev
```

### Poster Frame Extraction

If you update the hero video `chronis-assembly-scrub.mp4` under `public/videos/`, you can re-extract the poster frames using:

```sh
npm run extract-posters
```

## Built With

- TanStack Start (routing & server runner)
- React / Next.js architecture
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide Icons
