export class Track {

    constructor(sid: number, name: string, description: string, uid: string, main: boolean,
        fk_group: number, fk_profile: number, fk_operation: number, fk_technique: number,
        profile_name: string, operation_name: string, technique_name: string) {
        this.sid = sid;
        this.name = name;
        this.description = description;
        this.uid = uid;
        this.main = main;
        this.fk_group = fk_group;
        this.fk_profile = fk_profile;
        this.fk_operation = fk_operation;
        this.fk_technique = fk_technique;
        this.profile_name = profile_name;
        this.operation_name = operation_name;
        this.technique_name = technique_name;
    }

    public sid: number;
    public name: string;
    public description: string;
    public uid: string;
    public main: boolean;
    public fk_group: number;
    public fk_profile: number;
    public fk_operation: number;
    public fk_technique: number;
    public profile_name: string;
    public operation_name: string;
    public technique_name: string;
}