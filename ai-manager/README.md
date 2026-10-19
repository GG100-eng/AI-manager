# AI Manager: local setup

The main application for the [AI Manager prototype](../README.md).

## Run

From the repository root:

```bash
cd ai-manager
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000).

```bash
npm run build
npm run start
```

The prototype uses predefined scenario data and needs no model API key. Demo media is loaded from external URLs.

## Main files

- `src/app/page.tsx`: scenarios, sample feedback, playback state and the main interface.
- `src/components/BucketScoreCard.tsx`: category scores and expandable rationales.
- `src/components/RadarChart.tsx`: interactive category chart.
- `src/app/globals.css`: application styles.

The nested `prototype-copy/` directory contains another copy of the prototype. The commands above run the app in this directory.

See the [project overview](../README.md) for the product scope and validation questions.
