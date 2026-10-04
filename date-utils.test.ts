import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatDate } from "./date-utils.ts";

// Fixed local dates avoid timezone-sensitive expectations for every
// preset except ISO (which is UTC by definition).
const morning = new Date(2026, 0, 5, 9, 4, 7);
const afternoon = new Date(2026, 0, 5, 15, 4, 7);
const midnight = new Date(2026, 0, 5, 0, 30, 0);
const noon = new Date(2026, 0, 5, 12, 0, 0);

describe("formatDate presets", () => {
	it("formats date as YYYY-MM-DD", () => {
		assert.equal(formatDate(morning, "date"), "2026-01-05");
	});

	it("formats date-dmy as DD-MM-YYYY", () => {
		assert.equal(formatDate(morning, "date-dmy"), "05-01-2026");
	});

	it("formats date-mdy as MM-DD-YYYY", () => {
		assert.equal(formatDate(morning, "date-mdy"), "01-05-2026");
	});

	it("formats datetime without seconds", () => {
		assert.equal(formatDate(morning, "datetime"), "2026-01-05 09:04");
	});

	it("formats iso as UTC string", () => {
		assert.equal(formatDate(morning, "iso"), morning.toISOString());
	});

	it("falls back to date for unknown formats", () => {
		assert.equal(
			formatDate(morning, "fancy" as never),
			"2026-01-05",
		);
	});
});

describe("formatDate custom", () => {
	it("supports the requested DD/MM/YYYY HH:mm:ss format", () => {
		assert.equal(
			formatDate(morning, "custom", "DD/MM/YYYY HH:mm:ss"),
			"05/01/2026 09:04:07",
		);
	});

	it("supports ISO-like custom format with seconds", () => {
		assert.equal(
			formatDate(morning, "custom", "YYYY-MM-DD HH:mm:ss"),
			"2026-01-05 09:04:07",
		);
	});

	it("renders unpadded single tokens", () => {
		assert.equal(
			formatDate(morning, "custom", "M/D/YYYY H:m:s"),
			"1/5/2026 9:4:7",
		);
	});

	it("renders two-digit year", () => {
		assert.equal(formatDate(morning, "custom", "DD-MM-YY"), "05-01-26");
	});

	it("renders 12-hour clock with meridiem", () => {
		assert.equal(formatDate(morning, "custom", "hh:h A a"), "09:9 AM am");
		assert.equal(
			formatDate(afternoon, "custom", "hh:h A a"),
			"03:3 PM pm",
		);
	});

	it("renders midnight and noon as 12", () => {
		assert.equal(formatDate(midnight, "custom", "hh A"), "12 AM");
		assert.equal(formatDate(noon, "custom", "hh A"), "12 PM");
	});

	it("keeps separators and punctuation literal", () => {
		assert.equal(
			formatDate(morning, "custom", "DD.MM.YYYY"),
			"05.01.2026",
		);
	});

	it("keeps non-token letters literal", () => {
		assert.equal(
			formatDate(morning, "custom", "Note: YYYY"),
			"Note: 2026",
		);
	});

	it("interprets token letters inside bare words unless escaped", () => {
		assert.equal(
			formatDate(morning, "custom", "[Year]: YYYY"),
			"Year: 2026",
		);
	});

	it("supports bracket escapes for literal text", () => {
		assert.equal(
			formatDate(morning, "custom", "YYYY [year] MM"),
			"2026 year 01",
		);
		assert.equal(
			formatDate(morning, "custom", "DD [at] HH:mm"),
			"05 at 09:04",
		);
	});

	it("treats an unclosed bracket as literal", () => {
		assert.equal(formatDate(morning, "custom", "MM [oops"), "01 oops");
	});

	it("distinguishes month (MM) from minute (mm) case-sensitively", () => {
		const d = new Date(2026, 11, 25, 13, 5, 9);
		assert.equal(formatDate(d, "custom", "MM:mm M:m"), "12:05 12:5");
	});

	it("distinguishes 24-hour (HH) from 12-hour (hh)", () => {
		const d = new Date(2026, 0, 5, 13, 0, 0);
		assert.equal(formatDate(d, "custom", "HH|H|hh|h"), "13|13|01|1");
	});

	it("handles leap day and year boundaries", () => {
		assert.equal(
			formatDate(new Date(2024, 1, 29, 12, 0, 0), "custom", "YYYY-MM-DD"),
			"2024-02-29",
		);
		assert.equal(
			formatDate(new Date(2000, 0, 1, 0, 0, 0), "custom", "DD/MM/YY HH:mm:ss"),
			"01/01/00 00:00:00",
		);
		assert.equal(
			formatDate(new Date(1999, 11, 31, 23, 59, 59), "custom", "YY-MM-DD hh:mm:ss A"),
			"99-12-31 11:59:59 PM",
		);
	});

	it("renders concatenated tokens without separators", () => {
		assert.equal(
			formatDate(morning, "custom", "YYYYMMDDHHmmss"),
			"20260105090407",
		);
	});

	it("keeps token names literal when bracketed", () => {
		assert.equal(
			formatDate(morning, "custom", "[YYYY] on YYYY"),
			"YYYY on 2026",
		);
	});

	it("still interprets token letters inside unbracketed words", () => {
		assert.equal(formatDate(morning, "custom", "is"), "i7");
	});

	it("matches a golden matrix of Moment-style outputs", () => {
		const d = new Date(2026, 6, 4, 15, 8, 3);
		assert.equal(
			formatDate(d, "custom", "DD/MM/YYYY HH:mm:ss"),
			"04/07/2026 15:08:03",
		);
		assert.equal(
			formatDate(d, "custom", "MM/DD/YYYY hh:mm A"),
			"07/04/2026 03:08 PM",
		);
		assert.equal(
			formatDate(d, "custom", "YY/MM/DD H:m:s"),
			"26/07/04 15:8:3",
		);
		assert.equal(
			formatDate(d, "custom", "[at] HH:mm [on] DD/MM/YYYY"),
			"at 15:08 on 04/07/2026",
		);
	});

	it("falls back to date when the pattern is empty", () => {
		assert.equal(formatDate(morning, "custom", ""), "2026-01-05");
		assert.equal(formatDate(morning, "custom", "   "), "2026-01-05");
		assert.equal(formatDate(morning, "custom"), "2026-01-05");
	});
});
