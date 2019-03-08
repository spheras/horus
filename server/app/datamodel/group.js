const Search = require('./search');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

/**
 * Entity Group
 */
class Group {

    constructor(sid, name, description, uid, contactPhone, hpassword, active, fk_search) {
        this.sid = sid;
        this.name = name;
        this.description = description;
        this.uid = uid;
        this.contactPhone = contactPhone;
        this.hpassword = hpassword;
        this.active = active;
        this.fk_search = fk_search;
    }

    toString() {
        return `Group -
        sid          : ${this.sid}
        name         : ${this.name}
        description  : ${this.description}
        uid          : ${this.uid}
        contactPhone : ${this.contactPhone}
        hpassword    : ${this.hpassword}
        active       : ${this.active}
        fk_search    : ${this.fk_search}`;
    }

}
Group.TABLE_NAME = 'GROUPS';
Group.TN = Group.TABLE_NAME;
Group.fields = {
    sid: "sid",
    name: "name",
    description: "description",
    uid: "uid",
    contactPhone: "contactPhone",
    hpassword: "hpassword",
    active: "active",
    fk_search: "fk_search"
}

/**
 * @name createTable
 * @description create the table for the entity from scratch
 * @param {*} knex the knex connection
 * @param {string} schema the schema name
 */
Group.createTable = async function (knex, schema) {
    await knex.schema.withSchema(schema).createTable(Group.TABLE_NAME, function (table) {
        table.increments(Group.fields.sid).primary();
        table.string(Group.fields.name, 255);
        table.string(Group.fields.description, 255);
        table.string(Group.fields.uid, 255);
        table.string(Group.fields.contactPhone, 255);
        table.string(Group.fields.hpassword);
        table.boolean(Group.fields.active);
        table.integer(Group.fields.fk_search).references(Search.fields.sid).inTable(Search.TN).notNull().onDelete('cascade');
    });
}

/**
 * @name create
 * @description create a group
 * @param {*} knex  the knex connection
 * @param {string} schema  the schema name
 * @param {Search} group the group data
 */
Group.create = async function (knex, schema, group) {
    if (group.sid) {
        group = Object.assign({}, group, { sid: undefined });
    }
    group.uid = crypto.randomBytes(16).toString("hex");
    group.hpassword = bcrypt.hashSync(group.uid, 8);
    let dbgroup = await knex.withSchema(schema).table(Group.TABLE_NAME).insert(group).returning('*').then();
    return dbgroup;
}

/**
 * @name update
 * @description update a group
 * @param {*} knex  the knex connection
 * @param {string} schema  the schema name
 * @param {Group} group the group modifications
 */
Group.update = async function (knex, schema, group) {
    let modification = Object.assign({}, group, { sid: undefined });
    let dbgroup = await knex(Group.TN).withSchema(schema)
        .where('sid', '=', group.sid)
        .update(modification).returning('*').then();
    return dbgroup;
}

module.exports = Group;