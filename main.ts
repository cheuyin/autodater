import { Plugin, TFile, debounce } from "obsidian";
import { formatDate } from "./date-utils";
import { AutoDaterSettingTab, DEFAULT_SETTINGS } from "./settings";
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
		const savedData = (await this.loadData()) as
			| Partial<AutoDaterSettings>
			| null;

		this.settings = { ...DEFAULT_SETTINGS, ...(savedData ?? {}) };
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

		const property =
			eventType === "created"
				? this.settings.createdProperty
				: this.settings.updatedProperty;
		const dateValue = formatDate(new Date(), this.settings.dateFormat);

		try {
			await this.app.fileManager.processFrontMatter(
				file,
				(frontmatter: Record<string, unknown>) => {
					// Preserve an existing creation date.
					if (
						eventType === "created" &&
						frontmatter[property] !== undefined
					)
						return;

					// Avoid unnecessary writes when the configured value is current.
					if (frontmatter[property] === dateValue) return;

					frontmatter[property] = dateValue;
				},
			);
		} catch (error) {
			console.error(
				`AutoDater: Error updating ${property} for ${file.path}`,
				error,
			);
		}
	}
}
