import {
	Modal,
	Notice,
	PluginSettingTab,
	Setting,
	TextComponent,
	TFolder,
} from "obsidian";
import type { App, Plugin, SettingDefinitionItem } from "obsidian";

export type DateFormat = "date" | "datetime" | "iso" | "date-dmy" | "date-mdy";

export interface AutoDaterSettings {
	createdProperty: string;
	updatedProperty: string;
	dateFormat: DateFormat;
	excludedFolders: string[];
}

export const DEFAULT_SETTINGS: AutoDaterSettings = {
	createdProperty: "Created",
	updatedProperty: "Updated",
	dateFormat: "date",
	excludedFolders: [],
};

const DATE_FORMATS: readonly DateFormat[] = [
	"date",
	"datetime",
	"iso",
	"date-dmy",
	"date-mdy",
];

export function parseStoredSettings(data: unknown): Partial<AutoDaterSettings> {
	if (typeof data !== "object" || data === null) {
		return {};
	}

	const record = data as Record<string, unknown>;
	const settings: Partial<AutoDaterSettings> = {};

	const createdProperty = record.createdProperty;
	if (typeof createdProperty === "string") {
		settings.createdProperty = createdProperty;
	}

	const updatedProperty = record.updatedProperty;
	if (typeof updatedProperty === "string") {
		settings.updatedProperty = updatedProperty;
	}

	const dateFormat = record.dateFormat;
	if (isDateFormat(dateFormat)) {
		settings.dateFormat = dateFormat;
	}

	const excludedFolders = record.excludedFolders;
	if (Array.isArray(excludedFolders)) {
		const folders = excludedFolders
			.filter((value): value is string => typeof value === "string")
			.map((value) => value.trim())
			.filter((value) => value.length > 0);
		settings.excludedFolders = folders;
	}

	return settings;
}

function isDateFormat(value: unknown): value is DateFormat {
	return (
		typeof value === "string" &&
		(DATE_FORMATS as readonly string[]).includes(value)
	);
}

interface AutoDaterSettingsOwner extends Plugin {
	settings: AutoDaterSettings;
	saveSettings(): Promise<void>;
}

type AutoDaterSettingsKey = keyof AutoDaterSettings;

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
					},
				},
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
			.setDesc("Path to a folder in this vault, for example Templates.")
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

function validatePropertyName(value: string): string | undefined {
	return value.trim() ? undefined : "Property name cannot be empty.";
}
