# aexonjp.github.io

Website for **Aexon**, a DevOps & software studio founded by Muhamad Abdullah:
Docker & CI/CD pipelines, web design, website maintenance and custom software.

Live at <https://aexonjp.github.io/> (GitHub Pages, served from `main`).

## Structure

| Path | What it is |
| --- | --- |
| `index.html` | The whole one-page site |
| `assets/css/style.css` | Styles (paper / ink / orange theme, responsive, reduced-motion) |
| `assets/js/main.js` | Motion: split-flap board, scroll band, reveals, process tracker, FAQ |
| `assets/js/profile.js` | **Founder profile data — fill this in from LinkedIn** |
| `assets/img/` | Logo, founder photo, social preview image (`og.png`) |
| `404.html` | Not-found page |

No build step and no dependencies: plain HTML, CSS and JavaScript.

## Adding your LinkedIn details

Open `assets/js/profile.js` and fill in `headline`, `about`, `experience`,
`certifications`, `education` and `skills`. Empty lists stay hidden; anything
you add appears automatically in the Founder section.

To change the photo, replace `assets/img/founder.jpg` (square, at least 800×800 looks best).

## Preview locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Previous site

The earlier PDF plagiarism checker (Rabin–Karp, PDF.js) lives on the
[`plagiarism-checker`](https://github.com/AexonJP/aexonjp.github.io/tree/plagiarism-checker) branch.
