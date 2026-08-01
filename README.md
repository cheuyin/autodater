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
* **Safe Updates:** The plugin uses Obsidian's `processFrontMatter` API to carefully add or update fields without overwriting other existing YAML data. It also includes built-in protection to prevent infinite update loops.
* **Lightweight & Robust:** Designed to update efficiently. It uses a debounced update mechanism (6-second delay) to ensure it only writes to your file once you've finished typing, preventing unnecessary disk I/O and performance lag.

## Settings

AutoDater works without configuration using `Created`, `Updated`, and `YYYY-MM-DD` date values. You can optionally customize the property names and choose date-only, local date-time, or ISO 8601 date-time formats.

Changing a property name affects future writes only. AutoDater does not rename or migrate existing frontmatter fields automatically.

## Installation ⚙️

**From Obsidian (recommended):**

1.  Open **Settings → Community Plugins** and turn off **Restricted mode** if needed.
2.  Click **Browse**, search for **AutoDater**, and install it.
3.  Enable the plugin under **Community Plugins**.

**Manual installation (for testing):**

1.  Download the `main.js`, `styles.css` (if any), and `manifest.json` files from the latest release.
2.  Navigate to your Obsidian vault's configuration folder: `<YourVault>/.obsidian/plugins/`.
3.  Create a new folder named `autodater` (this should match the `id` in your `manifest.json`).
4.  Place the downloaded files into this new folder.
5.  Go to Obsidian settings > Community Plugins.
6.  Refresh the list and enable "AutoDater".

## Local Development 🛠️

If you want to build the plugin yourself or contribute:

1.  Clone this repository.
2.  Install dependencies: `npm install`.
3.  Build the plugin:
    *   `npm run dev`: Starts a watch mode that rebuilds the plugin on changes.
    *   `npm run build`: Creates a production build in the root directory.

## Changelog 📜

**Version 1.1.0**

* **Robust File Handling:** Implemented debouncing (2s) and loop protection to ensure safe and efficient file updates.
* **Tooling Upgrade:** Migrated to ESLint Flat Config, upgraded TypeScript to 6.0, and updated dependencies to the latest versions.
* **Type Safety:** Improved internal type definitions for safer frontmatter manipulation.

**Version 1.0.0 (Initial Release)**

* Plugin Created!
* Adds `Created` and `Updated` fields (YYYY-MM-DD) to new notes.
* Updates/adds `Updated` field on note modification.
* Uses `obsidian` package's `processFrontMatter` for safe YAML handling.