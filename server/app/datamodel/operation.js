/**
 * Entity Operation
 */
class Operation {

    constructor(sid, name) {
        this.sid = sid;
        this.name = name;
    }

    toString() {
        return `Operation -
        sid          : ${this.sid}
        name         : ${this.name}`;
    }

}
Operation.TABLE_NAME = 'OPERATIONS';
Operation.TN = Operation.TABLE_NAME;
Operation.fields = {
    sid: "sid",
    name: "name"
}

/**
 * @name createTable
 * @description create the table for the entity from scratch
 * @param {*} knex the knex connection
 * @param {string} schema the schema name
 */
Operation.createTable = async function (knex, schema) {
    await knex.schema.withSchema(schema).createTable(Operation.TABLE_NAME, function (table) {
        table.increments(Operation.fields.sid).primary();
        table.string(Operation.fields.name, 255);
    });
}

/**
 * @name create
 * @description create a Operation
 * @param {*} knex  the knex connection
 * @param {string} schema  the schema name
 * @param {Operation} operation the operation data
 */
Operation.create = async function (knex, schema, operation) {
    if (operation.sid || operation.sid==null) {
        operation = Object.assign({}, operation, { sid: undefined });
    }
    let dboperation = await knex.withSchema(schema).table(Operation.TABLE_NAME).insert(operation).returning('*').then();
    return dboperation;
}

/**
 * @name update
 * @description update a operation
 * @param {*} knex  the knex connection
 * @param {string} schema  the schema name
 * @param {Operation} operation the operation modifications
 */
Operation.update = async function (knex, schema, operation) {
    let modification = Object.assign({}, operation, { sid: undefined });
    let dboperation = await knex(Operation.TN).withSchema(schema)
        .where('sid', '=', operation.sid)
        .update(modification).returning('*').then();
    return dboperation;
}

module.exports = Operation;