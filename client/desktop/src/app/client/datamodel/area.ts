export class Area {

    constructor(sid: number, name: string, description: string, fk_search: number, zone:string) {
        this.sid = sid;
        this.name = name;
        this.description = description;
        this.fk_search = fk_search;
        this.zone=zone;
    }

    public sid: number;
    public name: string;
    public description: string;
    public fk_search: number;
    public zone:string;
}