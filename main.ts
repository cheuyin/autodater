import { Plugin, TFile } from "obsidian";
export default class AutoDater extends Plugin {
	onload() {
		// Without the onLayoutReady callback, this event is triggered for every existing file when the vault first loads, which is undesired
		this.app.workspace.onLayoutReady(() =>
			this.registerEvent(
				this.app.vault.on("create", async (file) => {
					if (file instanceof TFile) {
						try {
							await this.app.fileManager.processFrontMatter(
								file,
								(frontmatter: Record<string, unknown>) => {
									frontmatter["Created"] =
										this.getCurrentLocalDate();
								},
							);
						} catch (error) {
							console.log(error);
						}
					}
				}),
			),
		);

		this.registerEvent(
			this.app.vault.on("modify", async (file) => {
				if (file instanceof TFile) {
					try {
						await this.app.fileManager.processFrontMatter(
							file,
							(frontmatter: Record<string, unknown>) => {
								frontmatter["Updated"] =
									this.getCurrentLocalDate();
							},
						);
					} catch (error) {
						console.log(error);
					}
				}
			}),
		);
	}

	getCurrentLocalDate(): string {
		let currentDate = new Date();
		const offset = currentDate.getTimezoneOffset();
		currentDate = new Date(currentDate.getTime() - offset * 60 * 1000);
		return currentDate.toISOString().split("T")[0];
	}
}
