import Cookies from "universal-cookie";
import Config from "../services/Config/configService";

const cookies = new Cookies();

export enum cookieNames {
  UserName = "REDLAB-Preferred-Username",
  DarkMode = "REDLAB-DarkMode",
}

export function setCookie(name: cookieNames, value: any) {
  try {
    cookies.set(name, value, {
      path: "/",
      //httpOnly: Config.isProd(),
      //secure: Config.isProd(),
      maxAge: 86400 * Config.get("Cookies.MaxAgeDays"),
    });
  } catch (err) {
    // no-op
  }
}

export function getCookie(name: cookieNames, defaultvalue: any): any {
  try {
    var val = cookies.get(name);
    if (!val) {
      return defaultvalue;
    }
    return val;
  } catch (err) {
    return defaultvalue;
  }
}

export function removeCookie(name: cookieNames): any {
  try {
    cookies.remove(name);
  } catch (err) {
    // no-op
  }
}

export function removeAllCookies(): any {
  Object.values(cookieNames).forEach((value) => {
    try {
      cookies.remove(value);
    } catch (err) {
      // no-op
    }
  });
}
