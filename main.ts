import { Plugin, TFile, TFolder } from "obsidian";
export default class AutoDater extends Plugin {
	async onload() {
		// Without the onLayoutReady callback, this event is triggered for every existing file when the vault first loads, which is undesired
		this.app.workspace.onLayoutReady(() =>
			this.registerEvent(
				this.app.vault.on("create", async (file) => {
					if (file == null || file instanceof TFolder) return;
					const tfile = file as TFile;
					const createdField = `Created: ${this.getCurrentLocalDate()}`;
					this.app.vault.modify(tfile, `---\n${createdField}\n---`);
				})
			)
		);
	}

	getCurrentLocalDate(): string {
		let currentDate = new Date();
		const offset = currentDate.getTimezoneOffset();
		currentDate = new Date(currentDate.getTime() - (offset * 60 * 1000));
		return currentDate.toISOString().split("T")[0];
	}
}
