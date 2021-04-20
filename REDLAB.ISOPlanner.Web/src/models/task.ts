export default class Task {
    id: string;
    name: string;
    planId: string;

    constructor (id: string, planId: string , name: string) {
        this.id = id;
        this.name = name;
        this.planId = planId;
    }
}