import type { DateFormat } from "./settings-core";

export function formatDate(
	currentDate: Date,
	dateFormat: DateFormat,
	customFormat?: string,
): string {
	switch (dateFormat) {
		case "datetime":
			return formatLocalDateTime(currentDate);
		case "iso":
			return formatIsoDate(currentDate);
		case "date-dmy":
			return formatDmyDate(currentDate);
		case "date-mdy":
			return formatMdyDate(currentDate);
		case "custom":
			return formatCustomDate(currentDate, customFormat ?? "");
		case "date":
		default:
			return formatLocalDate(currentDate);
	}
}

function formatLocalDate(currentDate: Date): string {
	return [
		currentDate.getFullYear(),
		pad(currentDate.getMonth() + 1),
		pad(currentDate.getDate()),
	].join("-");
}

function formatDmyDate(currentDate: Date): string {
	return [
		pad(currentDate.getDate()),
		pad(currentDate.getMonth() + 1),
		currentDate.getFullYear(),
	].join("-");
}

function formatMdyDate(currentDate: Date): string {
	return [
		pad(currentDate.getMonth() + 1),
		pad(currentDate.getDate()),
		currentDate.getFullYear(),
	].join("-");
}

function formatLocalDateTime(currentDate: Date): string {
	return `${formatLocalDate(currentDate)} ${[
		pad(currentDate.getHours()),
		pad(currentDate.getMinutes()),
	].join(":")}`;
}

function formatIsoDate(currentDate: Date): string {
	return currentDate.toISOString();
}

const CUSTOM_TOKENS: readonly string[] = [
	"YYYY",
	"YY",
	"MM",
	"M",
	"DD",
	"D",
	"HH",
	"H",
	"hh",
	"h",
	"mm",
	"m",
	"ss",
	"s",
	"A",
	"a",
];

function formatCustomDate(currentDate: Date, pattern: string): string {
	if (!pattern.trim()) {
		return formatLocalDate(currentDate);
	}

	let result = "";
	let index = 0;
	while (index < pattern.length) {
		if (pattern[index] === "[") {
			const closing = pattern.indexOf("]", index + 1);
			if (closing === -1) {
				result += pattern.slice(index + 1);
				break;
			}
			result += pattern.slice(index + 1, closing);
			index = closing + 1;
			continue;
		}
		const token = CUSTOM_TOKENS.find((candidate) =>
			pattern.startsWith(candidate, index),
		);
		if (token !== undefined) {
			result += renderCustomToken(currentDate, token);
			index += token.length;
		} else {
			result += pattern[index];
			index += 1;
		}
	}
	return result;
}

function renderCustomToken(currentDate: Date, token: string): string {
	const hours = currentDate.getHours();
	const twelveHour = hours % 12 || 12;
	switch (token) {
		case "YYYY":
			return currentDate.getFullYear().toString();
		case "YY":
			return pad(currentDate.getFullYear() % 100);
		case "MM":
			return pad(currentDate.getMonth() + 1);
		case "M":
			return (currentDate.getMonth() + 1).toString();
		case "DD":
			return pad(currentDate.getDate());
		case "D":
			return currentDate.getDate().toString();
		case "HH":
			return pad(hours);
		case "H":
			return hours.toString();
		case "hh":
			return pad(twelveHour);
		case "h":
			return twelveHour.toString();
		case "mm":
			return pad(currentDate.getMinutes());
		case "m":
			return currentDate.getMinutes().toString();
		case "ss":
			return pad(currentDate.getSeconds());
		case "s":
			return currentDate.getSeconds().toString();
		case "A":
			return hours < 12 ? "AM" : "PM";
		case "a":
			return hours < 12 ? "am" : "pm";
		default:
			return token;
	}
}

function pad(value: number): string {
	return value < 10 ? `0${value}` : value.toString();
}
