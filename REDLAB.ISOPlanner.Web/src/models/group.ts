export default class Group {
    id: string;
    displayName: string;
    email: string;

    constructor (id: string, displayName: string, email: string) {
        this.id = id;
        this.displayName = displayName;
        this.email = email;
    }
}