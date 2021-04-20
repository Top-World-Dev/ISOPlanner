import { IPivotItemProps } from "../components/SceneBar/ScenePivot";

export function navigateToExternalUrl(
  url: string,
  shouldOpenNewTab: boolean = true
) {
  shouldOpenNewTab ? window.open(url, "_blank") : (window.location.href = url);
}

export function GetCurrentURL(onlyLastPart: boolean) {

  const path = window.location.pathname;

  if (onlyLastPart) {
    return path.substring(path.lastIndexOf('/'));
  } else {
    return path;
  }
}

export function getCurrentPivotKeyFromURL(pivotItems: IPivotItemProps[]): string {

  const url = GetCurrentURL(true);

  const pi = pivotItems.find( (i) => i.url === url );
  if (pi) {
    return pi.key;
  } else {
    return "";
  }
}
