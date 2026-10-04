export type DateFormat =
	| "date"
	| "datetime"
	| "iso"
	| "date-dmy"
	| "date-mdy"
	| "custom";

export interface AutoDaterSettings {
	createdProperty: string;
	updatedProperty: string;
	dateFormat: DateFormat;
	customDateFormat: string;
	excludedFolders: string[];
}

export const DEFAULT_SETTINGS: AutoDaterSettings = {
	createdProperty: "Created",
	updatedProperty: "Updated",
	dateFormat: "date",
	customDateFormat: "YYYY-MM-DD HH:mm",
	excludedFolders: [],
};

export const MAX_CUSTOM_FORMAT_LENGTH = 64;

const DATE_FORMATS: readonly DateFormat[] = [
	"date",
	"datetime",
	"iso",
	"date-dmy",
	"date-mdy",
	"custom",
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

	const customDateFormat = record.customDateFormat;
	if (
		typeof customDateFormat === "string" &&
		validateCustomFormat(customDateFormat) === undefined
	) {
		settings.customDateFormat = customDateFormat.trim();
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

export function validatePropertyName(value: string): string | undefined {
	return value.trim() ? undefined : "Property name cannot be empty.";
}

export function validateCustomFormat(value: string): string | undefined {
	const trimmed = value.trim();
	if (!trimmed) {
		return "Custom format cannot be empty.";
	}
	if (trimmed.length > MAX_CUSTOM_FORMAT_LENGTH) {
		return `Custom format must be ${MAX_CUSTOM_FORMAT_LENGTH} characters or fewer.`;
	}
	if (!/Y{2,4}|M{1,2}|D{1,2}/.test(trimmed)) {
		return "Custom format must include at least one date token (for example YYYY, MM, or DD).";
	}
	return undefined;
}
