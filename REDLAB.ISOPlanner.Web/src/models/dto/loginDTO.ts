export default class LoginDTO {

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
}