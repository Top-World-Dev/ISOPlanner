import { i18nBase } from "../services/Localization/i18n";

export function getLocaleString(date?: Date, options?: Intl.DateTimeFormatOptions) {
  return date ? new Date(date).toLocaleTimeString(i18nBase.language, options) : "";
}

export function toLocaleDate(date?: Date): string {
  const options: Intl.DateTimeFormatOptions = { year: "2-digit", month: "2-digit", day: "2-digit" };
  return getLocaleString(date, options);
}

export function toLocaleDateTime(date?: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };
  return getLocaleString(date, options);
}

export function toLocaleTime(date?: Date): string {
  const options: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit", second: "2-digit" };
  return getLocaleString(date, options);
}

export function toLocaleDateTimeNoSeconds(date?: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    };
    return getLocaleString(date, options);
  }