export default class Tenant {
    id: string;
    name: string;
    created?: Date;
    totalLicenses: number;
    usedLicenses: number;
    numberOfUsers: number;
    
    constructor (id: string, name: string) {
        this.id = id;
        this.name = name;
        this.totalLicenses = 0;
        this.usedLicenses = 0;
        this.numberOfUsers = 0;
    }

    getFreeLicenses() : number {
        return this.totalLicenses - this.usedLicenses;
    }
}
