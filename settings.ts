import { PluginSettingTab } from "obsidian";
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
		];
	}
}

function validatePropertyName(value: string): string | undefined {
	return value.trim() ? undefined : "Property name cannot be empty.";
}
