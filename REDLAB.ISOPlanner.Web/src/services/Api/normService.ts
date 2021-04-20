import NormDTO from "../../models/dto/normDTO";
import Norm from "../../models/norm";
import http from "./httpService";
import { mapFromNorms, mapToNorm } from "../../models/dto/dataMapping";
import AppError from "../../utils/appError";

export async function apiGetNorms(iso: boolean, languageCode: string, defLanguageCode: string, accessToken: string): Promise<Norm[]> {
  try {
    const ar = await http.get<NormDTO[]>(`/norms/?iso=${iso}`, http.getRequestConfig(accessToken));
    return mapFromNorms(ar.data, languageCode, defLanguageCode);
  } catch (err) {
    throw AppError.fromApiError(err);
  }
}

export async function apiUpdateNorm(norm: Norm, accessToken: string): Promise<void> {
  try {
    const normDTO = mapToNorm(norm);
    await http.put<NormDTO[]>(`/norms`, normDTO, http.getRequestConfig(accessToken));
  } catch (err) {
    throw AppError.fromApiError(err);
  }
}


