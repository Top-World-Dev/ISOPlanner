import SettingDTO from "../../models/dto/settingDTO";
import Setting from "../../models/setting";
import http from "./httpService";
import { mapFromSettings, mapToSetting, mapFromSetting } from "../../models/dto/dataMapping";
import AppError from "../../utils/appError";

export async function apiGetSettings(accessToken: string): Promise<Setting[]> {
  try {
    const ar = await http.get<SettingDTO[]>("/settings", http.getRequestConfig(accessToken));
    return mapFromSettings(ar.data);
  } catch (err) {
    throw AppError.fromApiError(err);
  }
}

export async function apiGetSetting(setting: string, accessToken: string): Promise<Setting> {
  try {
    const ar = await http.get<SettingDTO>(
      `/settings/?name=${setting}`,
      http.getRequestConfig(accessToken)
    );
    return mapFromSetting(ar.data);
  } catch (err) {
    throw AppError.fromApiError(err);
  }
}

export async function apiSetSetting(setting: string, value: any, accessToken: string): Promise<void> {
  try {
    const newSetting = new Setting();
    newSetting.SetValue(setting, value);
    const settingDTO = mapToSetting(newSetting);
    await http.put<SettingDTO>("/settings", settingDTO, http.getRequestConfig(accessToken));
  } catch (err) {
    throw AppError.fromApiError(err);
  }
}
