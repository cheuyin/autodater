import {
	Modal,
	Notice,
	PluginSettingTab,
	Setting,
	TextComponent,
	TFolder,
} from "obsidian";
import type { App, Plugin, SettingDefinitionItem } from "obsidian";
import { formatDate } from "./date-utils";
import {
	DEFAULT_SETTINGS,
	validateCustomFormat,
	validatePropertyName,
} from "./settings-core";
import type { AutoDaterSettings } from "./settings-core";

export type { AutoDaterSettings, DateFormat } from "./settings-core";
export { DEFAULT_SETTINGS, parseStoredSettings } from "./settings-core";

interface AutoDaterSettingsOwner extends Plugin {
	settings: AutoDaterSettings;
	saveSettings(): Promise<void>;
}

type AutoDaterSettingsKey = keyof AutoDaterSettings;

const customFormatPlaceholder = "DD/MM/YYYY HH:mm:ss";

export class AutoDaterSettingTab extends PluginSettingTab {
	plugin: AutoDaterSettingsOwner;

	constructor(app: App, plugin: AutoDaterSettingsOwner) {
		super(app, plugin);
		this.plugin = plugin;
	}

	getSettingDefinitions(): SettingDefinitionItem<AutoDaterSettingsKey>[] {
		return [
			{
				name: "Created property",
				desc: "Property written when a note is created.",
				control: {
					type: "text",
					key: "createdProperty",
					validate: validatePropertyName,
				},
			},
			{
				name: "Updated property",
				desc: "Property updated when a note is modified.",
				control: {
					type: "text",
					key: "updatedProperty",
					validate: validatePropertyName,
				},
			},
			{
				name: "Date format",
				desc: "Format used for Created and Updated values.",
				control: {
					type: "dropdown",
					key: "dateFormat",
					defaultValue: DEFAULT_SETTINGS.dateFormat,
					options: {
						date: "Date only (YYYY-MM-DD)",
						"date-dmy": "Date only (DD-MM-YYYY)",
						"date-mdy": "Date only (MM-DD-YYYY)",
						datetime: "Local date and time",
						iso: "ISO 8601 date and time",
						custom: "Custom format",
					},
				},
			},
			{
				name: "Custom format",
				desc: "Used when Date format is Custom. Tokens: YYYY YY MM M DD D HH H hh h mm m ss s A a. Wrap text in [brackets] to keep it literal.",
				render: (setting) => {
					const previewEl = setting.descEl.createDiv({
						cls: "autodater-format-preview",
					});
					const refreshPreview = (value: string): void => {
						const error = validateCustomFormat(value);
						previewEl.toggleClass("is-invalid", error !== undefined);
						previewEl.setText(
							error ??
								`Preview: ${formatDate(new Date(), "custom", value)}`,
						);
					};
					setting.addText((text) => {
						text
							.setPlaceholder(customFormatPlaceholder)
							.setValue(this.plugin.settings.customDateFormat)
							.onChange((value) => {
								refreshPreview(value);
								if (validateCustomFormat(value) !== undefined)
									return;
								this.plugin.settings.customDateFormat = value;
								void this.plugin.saveSettings();
							});
					});
					refreshPreview(this.plugin.settings.customDateFormat);
				},
				visible: () => this.plugin.settings.dateFormat === "custom",
			},
			{
				type: "list",
				heading: "Excluded folders",
				desc: "Folders AutoDater will not add or update dates in. Subfolders are included.",
				emptyState: "No excluded folders.",
				addItem: {
					name: "Add folder",
					action: () => this.openAddFolderModal(),
				},
				onDelete: (index) => {
					this.plugin.settings.excludedFolders.splice(index, 1);
					void this.plugin.saveSettings();
					this.update();
				},
				items: this.plugin.settings.excludedFolders.map((folder) => ({
					name: folder,
					searchable: false,
				})),
			},
		];
	}

	private openAddFolderModal(): void {
		new AddFolderModal(this.app, (folder) => {
			const normalized = folder.trim().replace(/\/+$/, "");
			if (!normalized) return;
			if (this.plugin.settings.excludedFolders.includes(normalized))
				return;
			this.plugin.settings.excludedFolders.push(normalized);
			void this.plugin.saveSettings();
			this.update();
		}).open();
	}
}

class AddFolderModal extends Modal {
	private result: (folder: string) => void;

	constructor(app: App, result: (folder: string) => void) {
		super(app);
		this.result = result;
	}

	onOpen(): void {
		this.setTitle("Add excluded folder");

		let input: TextComponent;
		new Setting(this.contentEl)
			.setName("Folder path")
			.setDesc("Path to a folder in this vault, for example templates.")
			.addText((text) => {
				input = text;
				text.setPlaceholder("Templates");
			});

		new Setting(this.contentEl).addButton((button) =>
			button
				.setButtonText("Add")
				.setCta()
				.onClick(() => {
					const folder = this.resolveFolder(input.getValue());
					if (!folder) {
						new Notice("Enter a valid folder path.");
						return;
					}
					this.result(folder.path);
					this.close();
				}),
		);
	}

	private resolveFolder(value: string): TFolder | null {
		const path = value.trim().replace(/\/+$/, "");
		if (!path) return null;
		const file = this.app.vault.getAbstractFileByPath(path);
		return file instanceof TFolder ? file : null;
	}

	onClose(): void {
		this.contentEl.empty();
	}
}
