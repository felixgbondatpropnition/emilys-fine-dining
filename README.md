# Emily's Fine Dining

Private chef website for Emily Stabb, based in the South of England.

## Stack

- **Vite** + vanilla JavaScript
- **GSAP** (scroll animations)
- **Cormorant Garamond** + **DM Sans** (Google Fonts)

## Local development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs to ./dist
npm run preview  # preview production build
```

## Deploying to Netlify

This is a standard Vite static site — Netlify's defaults will work.

**Option 1 — Connect the GitHub repo:**

1. In Netlify, click **Add new site → Import an existing project**
2. Choose **GitHub** and pick `emilys-fine-dining`
3. Build settings (usually auto-detected):
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Node version:** 18 or later
4. Click **Deploy**

**Option 2 — Drag and drop:**

1. Run `npm run build` locally
2. Drag the `dist/` folder into Netlify's deploy area

No environment variables or secrets are required.

## Contact

Emily's Fine Dining — [emilystabb@gmail.com](mailto:emilystabb@gmail.com)
