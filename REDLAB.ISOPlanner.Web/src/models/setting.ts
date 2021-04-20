import { toBool } from "../utils/string";

export const AutoUserLicense = "AutoUserLicense";
export const AutoCleanLicense = "AutoCleanLicense";
export const DefLanguageCode = "DefLanguageCode";

export const Names = {
       AutoUserLicense,
       AutoCleanLicense,
       DefLanguageCode
    };

export default class Setting {
  settingName: string;
  settingValue: string | null;

  constructor() {
    this.settingName = "";
    this.settingValue = null;
  }

  GetValue(): any {
    switch (this.settingName) {
      case AutoCleanLicense:
        return toBool(this.settingValue);
      case AutoUserLicense:
        return toBool(this.settingValue);
      case DefLanguageCode:
        return this.settingValue;
      default:
        throw new Error("Setting not found: " + this.settingName);
    }
  }

  SetValue(setting: string, value: any) {
    switch (setting) {
      case AutoCleanLicense:
        this.settingValue = value.toString();
        break;
      case AutoUserLicense:
        this.settingValue = value.toString();
        break;
      case DefLanguageCode:
        this.settingValue = value.toString();
        break;
      default:
        throw new Error("Setting not found: " + setting);
    }
    this.settingName = setting;
  }
}
