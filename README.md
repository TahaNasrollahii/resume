# Taha Nasrollahi — Resume Site

A bilingual (English / Persian) single-page resume site. Plain HTML/CSS/JS —
no build step, no framework, so it deploys to Vercel as-is.

## Structure

```
index.html    – all page content (English + Persian versions live side by side,
                shown/hidden with the EN/FA toggle in the nav)
styles.css    – design system: colors, type, layout, animations
script.js     – language toggle (persists choice), live Tehran clock,
                one-time count-up animation for the stats
assets/
  Taha-Nasrollahi-Resume.pdf  – linked from the "Résumé" download buttons
  favicon.svg
```

## Before you deploy

- The LinkedIn and GitHub cards in the Contact section currently link to `#`.
  Open `index.html`, search for `Add your profile URL`, and replace the two
  `href="#"` values with your real profile links.
- Everything else (email, phone, projects, experience, education) is pulled
  straight from your resume — edit the text directly in `index.html` if
  anything changes.

## Preview locally

Any static file server works, e.g.:

```
npx serve .
```

then open the printed local URL in your browser.
