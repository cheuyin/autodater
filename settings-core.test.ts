import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
	DEFAULT_SETTINGS,
	MAX_CUSTOM_FORMAT_LENGTH,
	parseStoredSettings,
	validateCustomFormat,
	validatePropertyName,
} from "./settings-core.ts";

describe("DEFAULT_SETTINGS", () => {
	it("keeps the historical defaults and adds a custom pattern", () => {
		assert.deepEqual({ ...DEFAULT_SETTINGS }, {
			createdProperty: "Created",
			updatedProperty: "Updated",
			dateFormat: "date",
			customDateFormat: "YYYY-MM-DD HH:mm",
			excludedFolders: [],
		});
	});
});

describe("parseStoredSettings", () => {
	it("returns empty for non-object data", () => {
		assert.deepEqual(parseStoredSettings(null), {});
		assert.deepEqual(parseStoredSettings(undefined), {});
		assert.deepEqual(parseStoredSettings(42), {});
		assert.deepEqual(parseStoredSettings("date"), {});
	});

	it("returns empty for an empty object", () => {
		assert.deepEqual(parseStoredSettings({}), {});
	});

	it("accepts a fully valid payload including custom format", () => {
		assert.deepEqual(
			parseStoredSettings({
				createdProperty: "Created",
				updatedProperty: "Updated",
				dateFormat: "custom",
				customDateFormat: "DD/MM/YYYY HH:mm:ss",
				excludedFolders: ["Templates"],
			}),
			{
				createdProperty: "Created",
				updatedProperty: "Updated",
				dateFormat: "custom",
				customDateFormat: "DD/MM/YYYY HH:mm:ss",
				excludedFolders: ["Templates"],
			},
		);
	});

	it("drops unknown date formats but keeps the rest", () => {
		assert.deepEqual(
			parseStoredSettings({
				dateFormat: "fancy",
				customDateFormat: "DD/MM/YYYY",
			}),
			{ customDateFormat: "DD/MM/YYYY" },
		);
	});

	it("drops empty custom formats", () => {
		assert.deepEqual(parseStoredSettings({ customDateFormat: "" }), {});
		assert.deepEqual(parseStoredSettings({ customDateFormat: "   " }), {});
	});

	it("drops custom formats without a date token", () => {
		assert.deepEqual(
			parseStoredSettings({ customDateFormat: "hello" }),
			{},
		);
		assert.deepEqual(
			parseStoredSettings({ customDateFormat: "HH:mm" }),
			{},
		);
	});

	it("drops overlong custom formats", () => {
		assert.deepEqual(
			parseStoredSettings({
				customDateFormat: `YYYY${"x".repeat(MAX_CUSTOM_FORMAT_LENGTH)}`,
			}),
			{},
		);
	});

	it("drops non-string custom formats", () => {
		assert.deepEqual(
			parseStoredSettings({ customDateFormat: 42 }),
			{},
		);
	});

	it("trims accepted custom formats", () => {
		assert.deepEqual(
			parseStoredSettings({ customDateFormat: "  DD/MM/YYYY  " }),
			{ customDateFormat: "DD/MM/YYYY" },
		);
	});

	it("drops non-string property names", () => {
		assert.deepEqual(
			parseStoredSettings({ createdProperty: 42, updatedProperty: null }),
			{},
		);
	});

	it("filters excluded folders to trimmed non-empty strings", () => {
		assert.deepEqual(
			parseStoredSettings({
				excludedFolders: ["Templates", 42, "   ", " Journal "],
			}),
			{ excludedFolders: ["Templates", "Journal"] },
		);
	});

	it("accepts the custom date format selector", () => {
		assert.deepEqual(
			parseStoredSettings({
				dateFormat: "custom",
				customDateFormat: "DD/MM/YYYY HH:mm:ss",
			}),
			{
				dateFormat: "custom",
				customDateFormat: "DD/MM/YYYY HH:mm:ss",
			},
		);
	});

	it("ignores unknown keys for forward compatibility", () => {
		assert.deepEqual(
			parseStoredSettings({ futureOption: true, dateFormat: "date" }),
			{ dateFormat: "date" },
		);
	});

	it("drops non-array excluded folders", () => {
		assert.deepEqual(
			parseStoredSettings({ excludedFolders: "Templates" }),
			{},
		);
	});
});

describe("validateCustomFormat", () => {
	it("rejects empty values", () => {
		assert.match(validateCustomFormat("") ?? "", /empty/);
		assert.match(validateCustomFormat("   ") ?? "", /empty/);
	});

	it("rejects values without a date token", () => {
		assert.match(validateCustomFormat("hello") ?? "", /date token/);
		assert.match(validateCustomFormat("HH:mm") ?? "", /date token/);
	});

	it("rejects values over the length limit", () => {
		const fits = `YYYY${"x".repeat(MAX_CUSTOM_FORMAT_LENGTH - 4)}`;
		const tooLong = `${fits}x`;
		assert.equal(validateCustomFormat(fits), undefined);
		assert.match(validateCustomFormat(tooLong) ?? "", /characters or fewer/);
	});

	it("accepts usable patterns", () => {
		assert.equal(validateCustomFormat("YYYY"), undefined);
		assert.equal(validateCustomFormat("YYYY-MM-DD"), undefined);
		assert.equal(
			validateCustomFormat("DD/MM/YYYY HH:mm:ss"),
			undefined,
		);
	});

	it("accepts the boundary length exactly at the limit", () => {
		const pattern = `YYYY${"x".repeat(MAX_CUSTOM_FORMAT_LENGTH - 4)}`;
		assert.equal(pattern.length, MAX_CUSTOM_FORMAT_LENGTH);
		assert.equal(validateCustomFormat(pattern), undefined);
	});

	it("accepts bracket-wrapped literals because the raw text still contains a token", () => {
		assert.equal(validateCustomFormat("[YYYY]"), undefined);
	});
});

describe("validatePropertyName", () => {
	it("rejects empty values", () => {
		assert.match(validatePropertyName("") ?? "", /empty/);
		assert.match(validatePropertyName("   ") ?? "", /empty/);
	});

	it("accepts non-empty values", () => {
		assert.equal(validatePropertyName("Created"), undefined);
	});
});
