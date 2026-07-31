# Exposure Study Prototype

This folder contains a small React prototype for the proposed exposure-
transformation study. When published with the main site, it is available at:

`/diymod/exposure-study/`

The prototype does only one study loop:

1. Asks participants which available imagery categories they find distressing.
2. Builds a session using only transformations from the selected categories.
3. Randomizes transformations within each selected case.
4. Collects 0-10 distress, willingness, and stimulus-fidelity ratings.
5. Supports skipping or ending early and downloads the session as JSON.

It does not generate transformations, use prior participants' preference labels,
implement continuous intensity, or provide a clinical exposure protocol.

## Source and build

The React/Vite source is in `source/`. The built static site is written into this
folder so GitHub Pages can serve it without changing the existing site setup.

```bash
cd exposure-study/source
npm install
npm run build
```

The seed manifest is `source/public/seed-dataset.json`. Seven images are copies
of the transformation examples already published on the DIY-MOD project
website. Four additional images come from two de-identified transformation
pairs in the provided `human_preferences` snapshot. Each side is treated as an
independent trial; prior participant preference labels are excluded.

The existing `filters.db` was reviewed as a possible source. The current
snapshot contains 21 preference rows, including 13 image pairs. Only two pairs
were added here because both sides were accessible transformed outputs, their
filter cases could be resolved, and a visual review did not reveal failed edits.
No participant identifiers, post text, emails, or old preference outcomes are
included. The project owner confirmed that the selected legacy pair images are
cleared for public redistribution.
