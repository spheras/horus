export class Group {

    constructor(sid: number, name: string, description: string, uid: string, contactPhone: string, hpassword: string, active: boolean, fk_search: number) {
        this.sid = sid;
        this.name = name;
        this.description = description;
        this.uid = uid;
        this.contactPhone = contactPhone;
        this.hpassword = hpassword;
        this.active = active;
        this.fk_search = fk_search;
    }

    public sid: number;
    public name: string;
    public description: string;
    public uid: string;
    public contactPhone: string;
    public hpassword: string;
    public active: boolean;
    public fk_search: number;
}