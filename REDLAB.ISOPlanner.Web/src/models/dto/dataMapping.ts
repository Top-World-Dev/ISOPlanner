import LoginDTO from "../../models/dto/loginDTO";
import Login from "../../models/login";
import UserDTO from "../../models/dto/userDTO";
import User from "../../models/user";
import TenantDTO from "../../models/dto/tenantDTO";
import Tenant from "./../tenant";
import LicenseDTO from './licenseDTO';
import SettingDTO from './settingDTO';
import Setting from "../../models/setting";
import UserRoleDTO from './userRoleDTO';
import CurrentUser from './../currentuser';
import LanguageDTO from "./languageDTO";
import Language from "../language";
import NormDTO from "./normDTO";
import Norm from "../../models/norm";
import Norm_TranslationDTO from "./norm_TranslationDTO";
import Norm_Translation from './../norm_Translation';

//
// Login
//

export function mapFromLogin(loginDTO: LoginDTO): Login {
  const newLogin = new Login();

  newLogin.tenantId = loginDTO.tenantId;
  newLogin.userId = loginDTO.userId;
  newLogin.roles = loginDTO.roles;
  newLogin.lastLogin = loginDTO.lastLogin;
  newLogin.tenantLicensed = loginDTO.tenantLicensed;
  newLogin.userLicensed = loginDTO.userLicensed;
  newLogin.userLanguageCode = loginDTO.userLanguageCode;
  newLogin.defLanguageCode = loginDTO.defLanguageCode;

  return newLogin;
}

//
// User
//
export function mapFromUsers(userDTOs: UserDTO[]): User[] {
  var userList = new Array<User>();

  for (var userDTO of userDTOs) {
    const newUser = new User(userDTO.userId, userDTO.email, userDTO.name);
    newUser.created = userDTO.created;
    newUser.hasLicense = userDTO.hasLicense;
    newUser.lastLogin = userDTO.lastLogin;
 
    userList.push(newUser);
  }

  return userList;
}

export function mapToUser(user: User): UserDTO {
  var userDTO = new UserDTO();

  userDTO.userId = user.id;
  userDTO.name = user.name;
  userDTO.email = user.email;

  if (user instanceof CurrentUser) {
    userDTO.userLanguageCode = (user as CurrentUser).login.userLanguageCode;
  }

  return userDTO;
}

export function mapFromUserRoles(userRoleDTOs: UserRoleDTO[]): User[] {
  var userList = new Array<User>();

  for (var userRoleDTO of userRoleDTOs) {
    const newUser = new User(userRoleDTO.userId, userRoleDTO.email, userRoleDTO.name);
    userList.push(newUser);
  }

  return userList;
}

//
// Tenant
//
export function mapFromTenant(tenantDTO: TenantDTO): Tenant {
  const tenant = new Tenant(tenantDTO.Id, tenantDTO.name);
  tenant.created = tenantDTO.created;

  return tenant;
}

export function mapFromTenantLicenses(tenant: Tenant, licenseDTO: LicenseDTO): Tenant {
  const newTenant = new Tenant(tenant.id, tenant.name);
  newTenant.numberOfUsers = licenseDTO.numberOfUsers;
  newTenant.totalLicenses = licenseDTO.totalLicenses;
  newTenant.usedLicenses = licenseDTO.usedLicenses;

  return newTenant;
}

//
// Setting
//

export function mapFromSettings(settingDTOs: SettingDTO[]) : Setting[] {

  var settingList = new Array<Setting>();

  for (var settingDTO of settingDTOs) {
    const newSetting = new Setting();
    newSetting.SetValue(settingDTO.settingName, settingDTO.settingValue);
    settingList.push(newSetting);
  }

  return settingList;
}

export function mapToSetting(setting: Setting): SettingDTO {
  var settingDTO = new SettingDTO();

  settingDTO.settingName = setting.settingName;
  settingDTO.settingValue = setting.settingValue;

  return settingDTO; 
}

export function mapFromSetting(settingDTO: SettingDTO) {
  const newSetting = new Setting();
  newSetting.SetValue(settingDTO.settingName, settingDTO.settingValue);
  return newSetting;
}

//
// Norms
//

export function mapFromNorms(normDTOs: NormDTO[], langCode: string, defLangCode: string): Norm[] {

  var normList = new Array<Norm>();

  for (var normDTO of normDTOs) {
    const newNorm = new Norm(); 
    var trans_idx: number = -1;

    newNorm.normId = normDTO.normId;
    newNorm.active = normDTO.active;
    newNorm.isoNormId = normDTO.isoNormId;
    newNorm.logo = normDTO.logo;
    newNorm.trans = mapFromNorm_Translation(normDTO.trans);

    if (newNorm.trans) {
      if (newNorm.trans.length === 1) {
        trans_idx = 0;
      } else if (newNorm.trans.length > 1) {
        trans_idx = newNorm.getTransIdx(langCode, defLangCode);
      }

      if (trans_idx >=0 ) {
        newNorm.transIdx = trans_idx;
        newNorm.name = newNorm.trans[trans_idx].name;
        newNorm.description = newNorm.trans[trans_idx].description;
      }
    }

    normList.push(newNorm);
  }

  return normList;
}

export function mapFromNorm_Translation(norm_TranslationDTOs: Norm_TranslationDTO[] | undefined): Norm_Translation[] | undefined {

  if (!norm_TranslationDTOs) {return undefined;}

  var norm_TranslationList = new Array<Norm_Translation>();

  for (var norm_TranslationDTO of norm_TranslationDTOs) {
    const newNorm_Translation = new Norm_Translation(); 
    newNorm_Translation.name = norm_TranslationDTO.name;
    newNorm_Translation.description = norm_TranslationDTO.description;
    newNorm_Translation.lang = mapFromLanguage(norm_TranslationDTO.lang);
    norm_TranslationList.push(newNorm_Translation);
  }

  return norm_TranslationList;
}

export function mapToNorm(norm: Norm): NormDTO {

  const newNormDTO = new NormDTO(); 

  newNormDTO.normId = norm.normId;
  newNormDTO.active = norm.active;
  newNormDTO.isoNormId = norm.isoNormId;
  newNormDTO.logo = norm.logo;
  newNormDTO.trans = mapToNorm_Translation(norm.trans);

  if (newNormDTO.trans && norm.transIdx >= 0) {
    newNormDTO.trans[norm.transIdx].name = norm.name;
    newNormDTO.trans[norm.transIdx].description = norm.description;
  }

  return newNormDTO;
}

export function mapToNorm_Translation(norm_Translations: Norm_Translation[] | undefined): Norm_TranslationDTO[] | undefined {

  if (!norm_Translations) {return undefined;}

  var norm_TranslationList = new Array<Norm_TranslationDTO>();

  for (var norm_Translation of norm_Translations) {
    const newNorm_TranslationDTO = new Norm_TranslationDTO(); 
    newNorm_TranslationDTO.name = norm_Translation.name;
    newNorm_TranslationDTO.description = norm_Translation.description;
    newNorm_TranslationDTO.lang = mapToLanguage(norm_Translation.lang);
    norm_TranslationList.push(newNorm_TranslationDTO);
  }

  return norm_TranslationList;
}

//
// Language
//

export function mapFromLanguage(languageDTO: LanguageDTO | undefined): Language | undefined {

  if (!languageDTO) {return undefined;}

  const language = new Language();
  language.languageId = languageDTO.languageId;
  language.code = languageDTO.code;
  language.name = languageDTO.name;

  return language;

}

export function mapToLanguage(language: Language | undefined): LanguageDTO | undefined {

  if (!language) {return undefined;}

  const languageDTO = new LanguageDTO();
  languageDTO.languageId = language.languageId;
  languageDTO.code = language.code;
  languageDTO.name = language.name;

  return languageDTO;

}