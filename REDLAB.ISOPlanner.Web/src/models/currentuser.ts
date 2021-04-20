import Tenant from './tenant';
import Presence from './presence';
import UserLanguage from './userLanguage';
import User from './user';
import Login from './login';

export default class CurrentUser extends User {

    timeZone: string;   //timeZone of the mailbox
    timeFormat: string; //timeFormat of the mailbox
    language: UserLanguage; //the current language of the user in the application
    presence: Presence;
    tenant: Tenant;
    login: Login;
    accountLanguageCode: string; // the original language of the Microsoft account

    constructor (id: string, tenant: Tenant, displayName: string, email: string, language: string) {
        super(id, email, displayName);

        this.tenant = tenant;
        this.name = displayName;
        this.email = email;
        this.presence = new Presence("");
        this.language = new UserLanguage(language);

        this.timeZone = 'UTC';
        this.timeFormat = 'HH:mm';
        this.jobTitle = '';
        this.accountLanguageCode = '';
        
        this.login = new Login();
    }

    static getEmptyUser() {
        return new CurrentUser('', new Tenant('',''), '', '', '');
    }

    getAvatarURL(email: string = this.email) {

        if (email) {
            return `https://outlook.office.com/owa/service.svc/s/GetPersonaPhoto?email=${email}&UA=0&size=HR96x96`;
        } else {
            return '';
        }
    }

    getMyAccountURL() {

        return `https://myaccount.microsoft.com/`;

    }

    getMyAccountLanguageURL() {

        return `https://myaccount.microsoft.com/settingsandprivacy/language/`;

    }
}