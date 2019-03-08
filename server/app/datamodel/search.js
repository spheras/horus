/**
 * Entity Search
 */
class Search {

    constructor(sid, name, description, tags, report, contactPhone, creation, lastPointSighting, 
        lastPointSightingDate, forwardCommandPost, location, locationPointMissingPerson, lastKnownPosition, initialPlanningPoint ) {
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
        this.locationPointMissingPerson=locationPointMissingPerson;
        this.lastKnownPosition=lastKnownPosition;
        this.initialPlanningPoint=initialPlanningPoint;
        this.location = location;
    }

    toString() {
        return `Search -
        sid          : ${this.sid}
        name         : ${this.name}
        description  : ${this.description}
        tags         : ${this.tags}
        contactPhone : ${this.contactPhone}
        creation     : ${this.creation}
        lastPointSighting : ${this.lastPointSighting}
        lastPointSightingDate : ${this.lastPointSightingDate}
        forwardCommandPost : ${this.forwardCommandPost}
        locationPointMissingPerson : ${this.locationPointMissingPerson}
        lastKnownPosition : ${this.lastKnownPosition}
        initialPlanningPoint : ${this.initialPlanningPoint}
        location: ${this.location}`;
    }

}
Search.TABLE_NAME = 'SEARCHES';
Search.TN = Search.TABLE_NAME;
Search.fields = {
    sid: "sid",
    name: "name",
    description: "description",
    tags: "tags",
    report: "report",
    contactPhone: "contactPhone",
    creation: "creation",
    lastPointSighting: "lastPointSighting",
    lastPointSightingDate: "lastPointSightingDate",
    forwardCommandPost: "forwardCommandPost",
    locationPointMissingPerson:"locationPointMissingPerson",
    lastKnownPosition:"lastKnownPosition",
    initialPlanningPoint:"initialPlanningPoint",
    location: "location"
}

/**
 * @name createTable
 * @description create the table for the entity from scratch
 * @param {*} knex the knex connection
 * @param {string} schema the schema name
 */
Search.createTable = async function (knex, schema) {
    await knex.schema.withSchema(schema).createTable(Search.TABLE_NAME, function (table) {
        table.increments(Search.fields.sid).primary();
        table.string(Search.fields.name, 255);
        table.string(Search.fields.description, 255);
        table.text(Search.fields.tags);
        table.text(Search.fields.report);
        table.string(Search.fields.contactPhone, 255);
        table.datetime(Search.fields.creation).defaultTo(knex.fn.now())
        table.specificType(Search.fields.forwardCommandPost, 'GEOGRAPHY(POINTZ, 4326)');
        table.specificType(Search.fields.lastPointSighting, 'GEOGRAPHY(POINTZ, 4326)');
        table.datetime(Search.fields.lastPointSightingDate).defaultTo(knex.fn.now());
        table.specificType(Search.fields.locationPointMissingPerson, 'GEOGRAPHY(POINTZ, 4326)');
        table.specificType(Search.fields.lastKnownPosition, 'GEOGRAPHY(POINTZ, 4326)');
        table.specificType(Search.fields.initialPlanningPoint, 'GEOGRAPHY(POINTZ, 4326)');
        table.string(Search.fields.location, 255);
    });
}

/**
 * @name update
 * @description update a search
 * @param {*} knex  the knex connection
 * @param {string} schema  the schema name
 * @param {Search} search the search modifications
 */
Search.update = async function (knex, schema, search) {
    let modification = Object.assign({}, search, { sid: undefined });
    let dbsearch = await knex(Search.TN).withSchema(schema)
        .where('sid', '=', search.sid)
        .update(modification).returning('*').then();
    return dbsearch;
}

/**
 * @name create
 * @description create a search
 * @param {*} knex  the knex connection
 * @param {string} schema  the schema name
 * @param {Search} user the search data
 */
Search.create = async function (knex, schema, search) {
    if (search.sid) {
        search = Object.assign({}, search, { sid: undefined });
    }
    let created = await knex.withSchema(schema).table(Search.TABLE_NAME).insert(search).returning('*').then();
    return created;
}

module.exports = Search;