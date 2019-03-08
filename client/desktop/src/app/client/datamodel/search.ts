export class Search {

    constructor(sid: number, tags: string, name: string, report: string, description: string, contactPhone: string, creation: string,
        lastPointSighting: string, lastPointSightingDate: string, forwardCommandPost: string, location: string,
        locationPointMissingPerson: string, lastKnownPosition: string, initialPlanningPoint: string) {

        this.sid = sid;
        this.tags = tags;
        this.name = name;
        this.report = report;
        this.description = description;
        this.contactPhone = contactPhone;
        this.creation = creation;
        this.lastPointSighting = lastPointSighting;
        this.lastPointSightingDate = lastPointSightingDate;
        this.forwardCommandPost = forwardCommandPost;
        this.location = location;

        this.locationPointMissingPerson=locationPointMissingPerson;
        this.lastKnownPosition=lastKnownPosition;
        this.initialPlanningPoint=initialPlanningPoint;
    }

    public sid: number;
    public tags: string;
    public name: string;
    public report: string;
    public description: string;
    public contactPhone: string;
    public creation: string;
    public lastPointSighting: string;
    public lastPointSightingDate: string;
    public forwardCommandPost: string;
    public location: string;
    public locationPointMissingPerson:string;
    public lastKnownPosition:string;
    public initialPlanningPoint:string;
}