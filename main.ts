import { Plugin, TFile, debounce } from "obsidian";

export default class AutoDater extends Plugin {
	onload() {
		this.app.workspace.onLayoutReady(() => {
			this.registerEvent(
				this.app.vault.on("create", (file) => {
					void this.handleFileChange(file, "Created");
				}),
			);
		});

		// Debounce the modify event to prevent rapid-fire writes (2 second delay)
		const debouncedUpdate = debounce(
			(file: TFile) => {
				void this.handleFileChange(file, "Updated");
			},
			2000,
			true,
		);

		this.registerEvent(
			this.app.vault.on("modify", (file) => {
				if (file instanceof TFile) debouncedUpdate(file);
			}),
		);
	}

	async handleFileChange(file: unknown, key: "Created" | "Updated") {
		if (!(file instanceof TFile)) return;

		const today = this.getCurrentLocalDate();

		try {
			await this.app.fileManager.processFrontMatter(
				file,
				(frontmatter: Record<string, unknown>) => {
					// 1. For "Created", don't overwrite if it already exists
					if (key === "Created" && frontmatter[key] !== undefined)
						return;

					// 2. For both, don't write if the date is already today (prevents infinite loops)
					if (frontmatter[key] === today) return;

					frontmatter[key] = today;
				},
			);
		} catch (error) {
			console.error(
				`AutoDater: Error updating ${key} for ${file.path}`,
				error,
			);
		}
	}

	getCurrentLocalDate(): string {
		const currentDate = new Date();
		const offset = currentDate.getTimezoneOffset();
		const localDate = new Date(currentDate.getTime() - offset * 60 * 1000);
		return localDate.toISOString().split("T")[0];
	}
}
