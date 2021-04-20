export default class UserRoleDTO {

    userId: string;
    roleId: string;
    name: string;
    email: string;
    
    constructor() {
        this.userId = "";
        this.roleId = "";
        this.email = "";
        this.name = "";
    }
}
