# AutoDater for Obsidian

Automatically add `Created` and `Updated` dates to new and edited Markdown notes. Zero setup, no manual date tracking.

Requires Obsidian 1.13.0 or later.

![Obsidian Properties showing automatic Created and Updated dates](./assets/properties-preview.png)

## What it does

AutoDater writes dates into YAML frontmatter when you create or edit a note:

```yaml
---
Created: 2026-08-01
Updated: 2026-08-01
---
```

- Adds `Created` when a new note has no existing value for that property
- Updates `Updated` when you edit a note
- Preserves existing `Created` values
- Processes Markdown notes only
- Stores dates inside the note, so they travel with the file when frontmatter is preserved
- Waits six seconds after editing before updating frontmatter
- Works without templates or configuration

## Install

1. Open **Settings → Community Plugins**.
2. Click **Browse** and search for **AutoDater**.
3. Install and enable it.

## Settings

Defaults:

- **Created property:** `Created`
- **Updated property:** `Updated`
- **Date format:** `YYYY-MM-DD`

You can customize property names and date format in **Settings → AutoDater**. On Obsidian 1.13.0 and later, these settings also appear in the global settings search.

**Date formats:**

- `YYYY-MM-DD` — date only (default)
- `DD-MM-YYYY` — date only
- `MM-DD-YYYY` — date only
- Local date and time — `YYYY-MM-DD HH:MM`
- ISO 8601 — full ISO date-time string

**Property names:**

- Changing a property name affects future writes only. Existing frontmatter properties are not renamed automatically.
- Names are matched case-insensitively when updating existing fields. For example, `Updated` and `updated` are treated as the same property; `modified` is a separate property.

**Obsidian property types:**

- If you use `DD-MM-YYYY` or `MM-DD-YYYY`, set the property type to **Text** in Obsidian. The **Date** property type expects `YYYY-MM-DD` and may misread other formats (for example, `02-08-2026` as `2002-08-20`).

## Important behavior

- Existing notes are not backfilled when you enable AutoDater.
- Editing an existing note adds or updates `Updated`, but does not add a missing `Created` value.
- `Created` records the date AutoDater first sees a new note without an existing `Created` property.

## Development

```bash
npm install
npm run build
```

See [GitHub Releases](https://github.com/cheuyin/autodater/releases) for version history.
