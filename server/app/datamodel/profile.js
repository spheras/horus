/**
 * Entity Profile
 */
class Profile {

    constructor(sid, name) {
        this.sid = sid;
        this.name = name;
    }

    toString() {
        return `Profile -
        sid          : ${this.sid}
        name         : ${this.name}`;
    }

}
Profile.TABLE_NAME = 'PROFILES';
Profile.TN = Profile.TABLE_NAME;
Profile.fields = {
    sid: "sid",
    name: "name"
}

/**
 * @name createTable
 * @description create the table for the entity from scratch
 * @param {*} knex the knex connection
 * @param {string} schema the schema name
 */
Profile.createTable = async function (knex, schema) {
    await knex.schema.withSchema(schema).createTable(Profile.TABLE_NAME, function (table) {
        table.increments(Profile.fields.sid).primary();
        table.string(Profile.fields.name, 255);
    });
}

/**
 * @name create
 * @description create a Profile
 * @param {*} knex  the knex connection
 * @param {string} schema  the schema name
 * @param {Profile} profile the profile data
 */
Profile.create = async function (knex, schema, profile) {
    if (profile.sid || profile.sid==null) {
        profile = Object.assign({}, profile, { sid: undefined });
    }
    let dbprofile = await knex.withSchema(schema).table(Profile.TABLE_NAME).insert(profile).returning('*').then();
    return dbprofile;
}

/**
 * @name update
 * @description update a profile
 * @param {*} knex  the knex connection
 * @param {string} schema  the schema name
 * @param {Profile} profile the profile modifications
 */
Profile.update = async function (knex, schema, profile) {
    let modification = Object.assign({}, profile, { sid: undefined });
    let dbprofile = await knex(Profile.TN).withSchema(schema)
        .where('sid', '=', profile.sid)
        .update(modification).returning('*').then();
    return dbprofile;
}

module.exports = Profile;