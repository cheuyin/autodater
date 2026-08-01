import type { DateFormat } from "./settings";

export function formatDate(currentDate: Date, dateFormat: DateFormat): string {
	switch (dateFormat) {
		case "datetime":
			return formatLocalDateTime(currentDate);
		case "iso":
			return formatIsoDate(currentDate);
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

function formatLocalDateTime(currentDate: Date): string {
	return `${formatLocalDate(currentDate)} ${[
		pad(currentDate.getHours()),
		pad(currentDate.getMinutes()),
	].join(":")}`;
}

function formatIsoDate(currentDate: Date): string {
	return currentDate.toISOString();
}

function pad(value: number): string {
	return value < 10 ? `0${value}` : value.toString();
}
