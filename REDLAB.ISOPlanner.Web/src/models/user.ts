
export default class User {

    id: string;
    name: string;
    email: string;
    jobTitle?: string;
    created?: Date;
    lastLogin?: Date;
    hasLicense: boolean = false;

    constructor (id: string, email: string, name: string) {
        this.id = id;
        this.name = name;
        this.email = email;
    }

    getAvatarURL(email: string = this.email) {

        if (email) {
            return `https://outlook.office.com/owa/service.svc/s/GetPersonaPhoto?email=${email}&UA=0&size=HR96x96`;
        } else {
            return '';
        }
    }
}