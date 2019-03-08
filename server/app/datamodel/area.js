const Search = require('./search');

/**
 * Entity Area
 */
class Area {

    constructor(sid, name, description, fk_search) {
        this.sid = sid;
        this.description = description;
        this.name = name;
        this.fk_search = fk_search;
    }

    toString() {
        return `Area -
        sid          : ${this.sid}
        name          : ${this.name}
        description  : ${this.description}
        fk_search    : ${this.fk_search}`;
    }

}
Area.TABLE_NAME = 'AREAS';
Area.TN = Area.TABLE_NAME;
Area.fields = {
    sid: "sid",
    name: "name",
    description: "description",
    fk_search: "fk_search",
    zone:"zone"
}

/**
 * @name createTable
 * @description create the table for the entity from scratch
 * @param {*} knex the knex connection
 * @param {string} schema the schema name
 */
Area.createTable = async function (knex, schema) {
    await knex.schema.withSchema(schema).createTable(Area.TABLE_NAME, function (table) {
        table.increments(Area.fields.sid).primary();
        table.string(Area.fields.name, 255);
        table.string(Area.fields.description, 255);
        table.integer(Area.fields.fk_search).references(Search.fields.sid).inTable(Search.TN).notNull().onDelete('cascade');
        table.specificType(Area.fields.zone, 'GEOMETRY(Multipolygon, 4326)');
    });
}

/**
 * @name create
 * @description create an area
 * @param {*} knex  the knex connection
 * @param {string} schema  the schema name
 * @param {Search} group the area data
 */
Area.create = async function (knex, schema, area) {
    if (area.sid) {
        area = Object.assign({}, area, { sid: undefined });
    }
    let dbarea = await knex.withSchema(schema).table(Area.TABLE_NAME).insert(area).returning('*').then();
    return dbarea;
}

/**
 * @name update
 * @description update an area
 * @param {*} knex  the knex connection
 * @param {string} schema  the schema name
 * @param {Area} area the area modifications
 */
Area.update = async function (knex, schema, area) {
    let modification = Object.assign({}, area, { sid: undefined });
    let dbarea = await knex(Area.TN).withSchema(schema)
        .where('sid', '=', area.sid)
        .update(modification).returning('*').then();
    return dbarea;
}


module.exports = Area;