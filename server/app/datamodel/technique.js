/**
 * Entity Technique
 */
class Technique {

    constructor(sid, name) {
        this.sid = sid;
        this.name = name;
    }

    toString() {
        return `Technique -
        sid          : ${this.sid}
        name         : ${this.name}`;
    }

}
Technique.TABLE_NAME = 'TECHNIQUES';
Technique.TN = Technique.TABLE_NAME;
Technique.fields = {
    sid: "sid",
    name: "name"
}

/**
 * @name createTable
 * @description create the table for the entity from scratch
 * @param {*} knex the knex connection
 * @param {string} schema the schema name
 */
Technique.createTable = async function (knex, schema) {
    await knex.schema.withSchema(schema).createTable(Technique.TABLE_NAME, function (table) {
        table.increments(Technique.fields.sid).primary();
        table.string(Technique.fields.name, 255);
    });
}

/**
 * @name create
 * @description create a Technique
 * @param {*} knex  the knex connection
 * @param {string} schema  the schema name
 * @param {Technique} technique the technique data
 */
Technique.create = async function (knex, schema, technique) {
    if (technique.sid || technique.sid==null) {
        technique = Object.assign({}, technique, { sid: undefined });
    }
    let dbtechnique = await knex.withSchema(schema).table(Technique.TABLE_NAME).insert(technique).returning('*').then();
    return dbtechnique;
}

/**
 * @name update
 * @description update a technique
 * @param {*} knex  the knex connection
 * @param {string} schema  the schema name
 * @param {Technique} technique the technique modifications
 */
Technique.update = async function (knex, schema, technique) {
    let modification = Object.assign({}, technique, { sid: undefined });
    let dbtechnique = await knex(Technique.TN).withSchema(schema)
        .where('sid', '=', technique.sid)
        .update(modification).returning('*').then();
    return dbtechnique;
}

module.exports = Technique;