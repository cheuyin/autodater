import { Plugin } from "obsidian";
export default class AutoDater extends Plugin {
	async onload() {
		// Without onLayoutReady callback, this even is triggered for every file when the vault first loads, which is undesired
		this.app.workspace.onLayoutReady(() =>
			this.registerEvent(
				this.app.vault.on("create", () => {
					console.log("a new file has entered the arena");
				})
			)
		);
	}
}
