# Thomas Theissier — Portfolio

A static personal site in the [Vellum](https://github.com/noahgsolomon/beautiful-html-templates/tree/main/templates/vellum) aesthetic: deep navy field, warm yellow italic serifs, dusty teal accents.

## Pages

| Page | File |
|------|------|
| Home | `index.html` |
| Projects | `projects.html` |
| Writing | `writing/index.html` |
| Experience | `experience.html` |
| Resume (view / print) | `resume.html` |

## Local preview

From this directory:

```bash
python3 -m http.server 4173
```

Open [http://localhost:4173](http://localhost:4173).

## GitHub + Deploy on Vercel

```bash
cd ~/Documents/portfolio
git init   # if needed
git add .
git commit -m "Initial Vellum portfolio"
gh repo create portfolio --public --source=. --remote=origin --push
```

Then in Vercel: **Add New Project** → import the repo. Framework preset: **Other** (static). No build command; root is the output directory.

If `gh` auth is stale, run `gh auth login` first.

Optional: set a custom domain in the Vercel project settings.

## Add a project

1. Drop a screenshot into `assets/projects/` (e.g. `my-project.png`). Prefer a real capture of the live site when you have one — the birthday menu preview is a stand-in until you replace `assets/projects/menu-60bday.png`.
2. In `projects.html`, copy a `.project-item` block and point the `<a href>` at the live URL and the `<img src>` at your screenshot.

## Add writing

**External article** — add a list item in `writing/index.html`:

```html
<li>
  <a href="https://example.com/post" target="_blank" rel="noopener noreferrer">
    Title of the piece
  </a>
  <span class="writing-meta">Mon Year · Source</span>
</li>
```

**Local essay** — copy `writing/_template.html` to something like `writing/my-essay.html`, write in the article body, then link that file from `writing/index.html`.

## Resume / CV

- **View resume:** `resume.html` (browser + print).
- **Download CV:** `assets/thomas-theissier-cv.pdf` — replace this file with your real PDF (same name) when ready.

## Customize home

Edit the quote and bio in `index.html` inside `.cover-stack`.
