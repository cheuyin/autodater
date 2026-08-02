import { PluginSettingTab, Setting } from "obsidian";
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

	async setControlValue(key: string, value: unknown): Promise<void> {
		if (key === "createdProperty" || key === "updatedProperty") {
			if (typeof value !== "string") return;

			this.plugin.settings[key] = value.trim();
		} else if (key === "dateFormat") {
			const format = String(value);
			if (!isDateFormat(format)) return;

			this.plugin.settings.dateFormat = format;
		} else {
			return;
		}

		await this.plugin.saveSettings();
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		this.addPropertySetting(
			containerEl,
			"Created property",
			"Property written when a note is created.",
			() => this.plugin.settings.createdProperty,
			(value) => {
				this.plugin.settings.createdProperty = value;
			},
		);

		this.addPropertySetting(
			containerEl,
			"Updated property",
			"Property updated when a note is modified.",
			() => this.plugin.settings.updatedProperty,
			(value) => {
				this.plugin.settings.updatedProperty = value;
			},
		);

		new Setting(containerEl)
			.setName("Date format")
			.setDesc("Format used for Created and Updated values.")
			.addDropdown((dropdown) =>
				dropdown
					.addOption("date", "Date only (YYYY-MM-DD)")
					.addOption("datetime", "Local date and time")
					.addOption("iso", "ISO 8601 date and time")
					.setValue(this.plugin.settings.dateFormat)
					.onChange(async (value) => {
						if (!isDateFormat(value)) return;

						this.plugin.settings.dateFormat = value;
						await this.plugin.saveSettings();
					}),
			);
	}

	private addPropertySetting(
		containerEl: HTMLElement,
		name: string,
		description: string,
		getValue: () => string,
		setValue: (value: string) => void,
	): void {
		new Setting(containerEl)
			.setName(name)
			.setDesc(description)
			.addText((text) =>
				text.setValue(getValue()).onChange(async (value) => {
					const propertyName = value.trim();
					if (!propertyName) {
						text.setValue(getValue());
						return;
					}

					setValue(propertyName);
					await this.plugin.saveSettings();
				}),
			);
	}
}

function isDateFormat(value: string): value is DateFormat {
	return value === "date" || value === "datetime" || value === "iso";
}

function validatePropertyName(value: string): string | undefined {
	return value.trim() ? undefined : "Property name cannot be empty.";
}
