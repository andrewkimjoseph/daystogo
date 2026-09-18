# Days To Go — marketing site

Official marketing page for Days To Go. Live: [daystogo.xyz](https://daystogo.xyz). The product itself is [`../web_app/`](../web_app/) at [app.daystogo.xyz](https://app.daystogo.xyz).

Playful Brutalist styling (cream `#EFEADD`, thick ink borders, Archivo Black / Space Grotesk, `brut` utilities) is copied from `web_app`. Keep visual changes in lockstep with [`../web_app/src/styles.css`](../web_app/src/styles.css).

## Development

```sh
cd website
npm i
npm run dev
```

The Vite dev server defaults to port 3000.

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the dev server                 |
| `npm run build`   | Production build                     |
| `npm run preview` | Preview the production build locally |

## Deploy

TanStack Start on Vercel (`vercel.json` sets `framework: tanstack-start`). Point the production domain at **daystogo.xyz**. Primary CTAs open **https://app.daystogo.xyz**.
