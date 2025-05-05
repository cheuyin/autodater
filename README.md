# AutoDater for Obsidian

Automatically adds and maintains `Created` and `Updated` dates in the YAML frontmatter of your Obsidian notes.

## Why this plugin? 🤔

Have you ever lost valuable metadata like creation or modification dates when exporting notes, migrating between tools, or recovering from a backup? Standard file system metadata can be fragile.

This plugin solves that by embedding `Created` and `Updated` timestamps directly into the content of your notes within the YAML frontmatter. This ensures this important contextual information stays **with the note itself**, wherever it goes.

## How it Works / Features ✨

* **Automatic `Created` Date:** When you create a **new note**, the plugin automatically adds:
    ```yaml
    ---
    Created: YYYY-MM-DD
    Updated: YYYY-MM-DD
    ---
    ```
    (Where `YYYY-MM-DD` is the current date). It **will not** modify existing files that lack these fields upon initial activation.
* **Automatic `Updated` Date:** Whenever you **modify an existing note**, the plugin:
    * Updates the `Updated:` field to the current date (`YYYY-MM-DD`).
    * If the `Updated:` field doesn't exist, it adds it.
    * If no YAML frontmatter exists at all, it creates the frontmatter block and adds the `Updated:` field.
* **Safe Updates:** The plugin carefully adds or updates fields without overwriting other existing YAML data. It's designed to be non-destructive.
* **Lightweight:** Designed to update efficiently without noticeable slowdowns during normal note-taking.

## Installation ⚙️

**Recommended Method (Once Published):**

1.  Search for "[Plugin Name]" in Obsidian's Community Plugins browser.
2.  Install it.
3.  Enable the plugin in your Obsidian settings under "Community Plugins".

**Manual Installation (For now or for testing):**

1.  Download the `main.js`, `styles.css` (if any), and `manifest.json` files from the latest release.
2.  Navigate to your Obsidian vault's configuration folder: `<YourVault>/.obsidian/plugins/`.
3.  Create a new folder named `[your-plugin-id]` (this should match the `id` in your `manifest.json`).
4.  Place the downloaded files into this new folder.
5.  Go to Obsidian settings > Community Plugins.
6.  Refresh the list and enable "[Plugin Name]".

## Changelog 📜

**Version 1.0.0 (Initial Release)**

* Plugin Created!
* Adds `Created` and `Updated` fields (YYYY-MM-DD) to new notes.
* Updates/adds `Updated` field on note modification.
* Uses `obsidian` package's `processFrontMatter` for safe YAML handling.