
export class TrackDetail {

    constructor(sid: number, fk_track: number, creation: string, trackinfo: string, fk_type: number, binaryref: string) {
        this.sid = sid;
        this.fk_track = fk_track;
        this.creation = creation;
        this.trackinfo = trackinfo;
        this.fk_type = fk_type;
        this.binaryref = binaryref;
    }

    public sid: number;
    public fk_track: number;
    public creation: string;
    public trackinfo: string;
    public fk_type: number;
    public binaryref: string;
}