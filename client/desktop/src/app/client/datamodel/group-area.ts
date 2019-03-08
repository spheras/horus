export class GroupArea {

    constructor(fk_group: number, fk_area: number) {
        this.fk_group = fk_group;
        this.fk_area = fk_area;
    }

    public fk_group: number;
    public fk_area: number;
}