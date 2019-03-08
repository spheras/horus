const Group = require('./group');
var Operation=require('../datamodel/operation');
var Technique=require('../datamodel/technique');
var Profile=require('../datamodel/profile');

/**
 * Entity Track
 */
class Track {

    constructor(sid, name, description, uid, main, fk_group, fk_profile, fk_operation , fk_technique) {
        this.sid = sid;
        this.name = name;
        this.description=description;
        this.uid = uid;
        this.main = main;
        this.fk_group = fk_group;
        this.fk_profile=fk_profile;
        this.fk_operation=fk_operation;
        this.fk_technique=fk_technique;
    }

    toString() {
        return `Track -
        sid         : ${this.sid}
        name        : ${this.name}
        description : ${this.description}
        uid         : ${this.uid}
        main        : ${this.main}
        fk_group    : ${this.fk_group}
        fk_profile  : ${this.fk_profile}
        fk_operation: ${this.fk_operation}
        fk_technique: ${this.fk_technique}`;
    }

}
Track.TABLE_NAME = 'TRACKS';
Track.TN = Track.TABLE_NAME;
Track.fields = {
    sid: "sid",
    name: "name",
    description:"description",
    uid: "uid",
    main: "main",
    fk_group: "fk_group",
    fk_profile:"fk_profile",
    fk_operation:"fk_operation",
    fk_technique:"fk_technique"
}

/**
 * @name createTable
 * @description create the table for the entity from scratch
 * @param {*} knex the knex connection
 * @param {string} schema the schema name
 */
Track.createTable = async function (knex, schema) {
    await knex.schema.withSchema(schema).createTable(Track.TABLE_NAME, function (table) {
        table.increments(Track.fields.sid).primary();
        table.string(Track.fields.name, 255);
        table.string(Track.fields.uid, 255);
        table.text(Track.fields.description);
        table.boolean(Track.fields.main);
        table.integer(Track.fields.fk_group).references(Group.fields.sid).inTable(Group.TN).notNull().onDelete('cascade');
        table.integer(Track.fields.fk_profile).references(Profile.fields.sid).inTable(Profile.TN);
        table.integer(Track.fields.fk_operation).references(Operation.fields.sid).inTable(Operation.TN);
        table.integer(Track.fields.fk_technique).references(Technique.fields.sid).inTable(Technique.TN);
    });
}



/**
 * @name update
 * @description update a track
 * @param {*} knex  the knex connection
 * @param {string} schema  the schema name
 * @param {Track} track the track modifications
 */
Track.update = async function (knex, schema, track) {
    let modification = Object.assign({}, track, { sid: undefined });
    let dbtrack = await knex(Track.TN).withSchema(schema)
        .where('sid', '=', track.sid)
        .update(modification).returning('*').then();
    return dbtrack;
}


module.exports = Track;