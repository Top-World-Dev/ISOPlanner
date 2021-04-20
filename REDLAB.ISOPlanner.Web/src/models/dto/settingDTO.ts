export default class SettingDTO {
    settingName: string;
    settingValue: string | null;

    constructor() {
        this.settingName = "";
        this.settingValue = null;
    }
}
