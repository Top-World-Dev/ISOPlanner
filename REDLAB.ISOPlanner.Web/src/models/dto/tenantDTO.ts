export default class TenantDTO {
    Id: string;
    name: string;
    created?: Date;

    constructor() {
        this.Id = "";
        this.name = "";
    }
}
