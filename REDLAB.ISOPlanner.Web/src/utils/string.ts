export function truncate(str: string | undefined, maxlen: number) {
  if (str) {
    return str.length > maxlen ? str.substr(0, maxlen - 1) : str;
  } else {
    return "";
  }
}

export function toBool(str: string | undefined | null): boolean {
  if (!str) {return false;}
  return str.toLowerCase() === "true" ? true : false;
}