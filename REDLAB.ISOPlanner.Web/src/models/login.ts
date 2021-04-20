import { useTranslation  } from "react-i18next";
import { appRoles } from "../services/Auth/appRoles";

export function GetRoleTranslation(role: string) : string {

    const { t } = useTranslation();
    return t(`Roles.${role}`);
}

export function getRolesDisplayString(roles?: Array<string>) : string {

    var rolestring = "";
    
    if (roles) {
        for (var role of roles) {
            if (rolestring.length > 0) { rolestring += ", "}
            rolestring += GetRoleTranslation(role);
        }
    }

    if (rolestring.length === 0) { rolestring = GetRoleTranslation("Empty")}

    return rolestring;
}

export default class Login {

    tenantId?: string;
    userId?: string;
    lastLogin?: Date;
    tenantLicensed: boolean;
    userLicensed: boolean;
    roles?: Array<string>;
    userLanguageCode?: string;
    defLanguageCode: string;

    constructor() {
        this.tenantLicensed = false;
        this.userLicensed = false;
        this.defLanguageCode = '';
    }

    hasRole(role: appRoles) : boolean {

        if (this.roles && this.roles.indexOf(role.toString()) >= 0) {
            return true;
        }
        return false;
    }
}