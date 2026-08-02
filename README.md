# AutoDater for Obsidian

Automatically add `Created` and `Updated` dates to new and edited Markdown notes. Zero setup, no manual date tracking.

Requires Obsidian 1.13.0 or later.

![Obsidian Properties showing automatic Created and Updated dates](./assets/properties-preview.png)

## What it does

After you create and edit a note, its YAML frontmatter looks like this:

```yaml
---
Created: 2026-08-01
Updated: 2026-08-01
---
```

When you edit a note, AutoDater adds or updates its `Updated` date.

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

AutoDater uses `Created`, `Updated`, and `YYYY-MM-DD` by default. You can customize the property names and choose date-only (`YYYY-MM-DD`, `DD-MM-YYYY`, or `MM-DD-YYYY`), local date-time, or ISO 8601 date-time formats. On Obsidian 1.13.0 and later, these settings also appear in the global settings search.

Changing a property name affects future writes only. Existing frontmatter properties are not renamed automatically.

Property names are matched case-insensitively when updating existing fields. For example, `Updated` and `updated` are treated as the same property, while a different name such as `modified` creates a separate property.

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
