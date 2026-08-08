import { Plugin, TFile, debounce } from "obsidian";
import { formatDate } from "./date-utils";
import { AutoDaterSettingTab, DEFAULT_SETTINGS, parseStoredSettings } from "./settings";
import type { AutoDaterSettings } from "./settings";

export default class AutoDater extends Plugin {
	settings: AutoDaterSettings = { ...DEFAULT_SETTINGS };

	async onload(): Promise<void> {
		await this.loadSettings();
		this.addSettingTab(new AutoDaterSettingTab(this.app, this));

		this.app.workspace.onLayoutReady(() => {
			this.registerEvent(
				this.app.vault.on("create", (file) => {
					void this.handleFileChange(file, "created");
				}),
			);
		});

		// Debounce the modify event to prevent rapid-fire writes (6 second delay)
		const debouncedUpdate = debounce(
			(file: TFile) => {
				void this.handleFileChange(file, "updated");
			},
			6000,
			true,
		);

		this.registerEvent(
			this.app.vault.on("modify", (file) => {
				if (file instanceof TFile) debouncedUpdate(file);
			}),
		);
	}

	async loadSettings(): Promise<void> {
		const loadedData: unknown = await this.loadData();
		this.settings = {
			...DEFAULT_SETTINGS,
			...parseStoredSettings(loadedData),
		};
		this.settings.createdProperty = this.settings.createdProperty.trim();
		this.settings.updatedProperty = this.settings.updatedProperty.trim();
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}

	async handleFileChange(
		file: unknown,
		eventType: "created" | "updated",
	): Promise<void> {
		if (!(file instanceof TFile)) return;
		if (file.extension !== "md") return;
		if (isPathExcluded(file.path, this.settings.excludedFolders)) return;

		const configuredProperty = (
			eventType === "created"
				? this.settings.createdProperty
				: this.settings.updatedProperty
		).trim();
		if (!configuredProperty) return;
		const dateValue = formatDate(new Date(), this.settings.dateFormat);

		try {
			await this.app.fileManager.processFrontMatter(
				file,
				(frontmatter: Record<string, unknown>) => {
					const propertyName = findExistingPropertyName(
						frontmatter,
						configuredProperty,
					);

					// Preserve an existing creation date.
					if (
						eventType === "created" &&
						frontmatter[propertyName] !== undefined
					)
						return;

					// Avoid unnecessary writes when the configured value is current.
					if (frontmatter[propertyName] === dateValue) return;

					frontmatter[propertyName] = dateValue;
				},
			);
		} catch (error) {
			console.error(
				`AutoDater: Error updating ${configuredProperty} for ${file.path}`,
				error,
			);
		}
	}
}

function findExistingPropertyName(
	frontmatter: Record<string, unknown>,
	configuredProperty: string,
): string {
	if (
		Object.prototype.hasOwnProperty.call(
			frontmatter,
			configuredProperty,
		)
	)
		return configuredProperty;

	const normalizedProperty = configuredProperty.toLowerCase();
	return (
		Object.keys(frontmatter).find(
			frontmatterProperty =>
				frontmatterProperty.toLowerCase() === normalizedProperty,
		) ?? configuredProperty
	);
}

/**
 * Returns true when the given file path is inside any of the excluded
 * folders. Matching is done against the ancestor chain (not just the
 * immediate parent), so a file in a subfolder of an excluded folder is
 * also excluded. Stored folder paths are normalized by trimming and
 * stripping a trailing slash before comparison.
 */
function isPathExcluded(
	filePath: string,
	excludedFolders: readonly string[],
): boolean {
	for (const folder of excludedFolders) {
		const normalized = folder.trim().replace(/\/+$/, "");
		if (!normalized) continue;
		if (
			filePath === normalized ||
			filePath.startsWith(normalized + "/")
		)
			return true;
	}
	return false;
}
