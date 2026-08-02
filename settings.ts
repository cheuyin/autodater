import { PluginSettingTab } from "obsidian";
import type { App, Plugin, SettingDefinitionItem } from "obsidian";

export type DateFormat = "date" | "datetime" | "iso";

export interface AutoDaterSettings {
	createdProperty: string;
	updatedProperty: string;
	dateFormat: DateFormat;
}

export const DEFAULT_SETTINGS: AutoDaterSettings = {
	createdProperty: "Created",
	updatedProperty: "Updated",
	dateFormat: "date",
};

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
						datetime: "Local date and time",
						iso: "ISO 8601 date and time",
					},
				},
			},
		];
	}
}

function validatePropertyName(value: string): string | undefined {
	return value.trim() ? undefined : "Property name cannot be empty.";
}
