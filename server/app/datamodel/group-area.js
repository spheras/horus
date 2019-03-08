const Group = require('./group');
const Area = require('./area');

/**
 * Entity Group-Area
 */
class GroupArea {

    constructor(fk_group, fk_area) {
        this.fk_group = fk_group;
        this.fk_area = fk_area;
    }

    toString() {
        return `GroupArea -
        fk_group : ${this.fk_group}
        fk_area  : ${this.fk_area}`;
    }

}
GroupArea.TABLE_NAME = 'GROUPS_AREAS';
GroupArea.TN = GroupArea.TABLE_NAME;
GroupArea.fields = {
    fk_group: "fk_group",
    fk_area: "fk_area"
}

/**
 * @name createTable
 * @description create the table for the entity from scratch
 * @param {*} knex the knex connection
 * @param {string} schema the schema name
 */
GroupArea.createTable = async function (knex, schema) {
    await knex.schema.withSchema(schema).createTable(GroupArea.TABLE_NAME, function (table) {
        table.integer(GroupArea.fields.fk_group).references(Group.fields.sid).inTable(Group.TN).notNull().onDelete('cascade');
        table.integer(GroupArea.fields.fk_area).references(Area.fields.sid).inTable(Area.TN).notNull().onDelete('cascade');
    });
}


/**
 * @name create
 * @description create a GroupArea link
 * @param {*} knex  the knex connection
 * @param {string} schema  the schema name
 * @param {GroupArea} link the link of the group and area
 */
GroupArea.create = async function (knex, schema, link) {
    let dbgrouparea = await knex.withSchema(schema).table(GroupArea.TABLE_NAME).insert(link).returning('*').then();
    return dbgrouparea;
}

module.exports = GroupArea;