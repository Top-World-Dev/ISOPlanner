export default class UserDTO {

    userId: string;
    name: string;
    email: string;
    created?: Date;
    lastLogin?: Date;
    hasLicense: boolean;
    userLanguageCode?: string;

    constructor() {
        this.userId = "";
        this.name = "";
        this.email = "";
        this.hasLicense = false;
    }
}