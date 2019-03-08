const TrackDetail = require('./trackdetail');

/**
 * Entity Track Data
 */
class TrackData {

    constructor(sid, fk_trackdetail, ref, comments) {
        this.sid = sid;
        this.fk_trackdetail = fk_trackdetail;
        this.ref = ref;
        this.comments = comments;
    }

    toString() {
        return `TrackData -
        sid            : ${this.sid}
        fk_trackdetail : ${this.fk_trackdetail}
        ref            : ${this.ref}
        comments       : ${this.comments}`;
    }
}
TrackData.TABLE_NAME = 'TRACKS_DATA';
TrackData.TN = TrackData.TABLE_NAME;
TrackData.fields = {
    sid: "sid",
    fk_trackdetail: "fk_trackdetail",
    ref: "ref",
    comments: "comments"
}

/**
 * @name createTable
 * @description create the table for the entity from scratch
 * @param {*} knex the knex connection
 * @param {string} schema the schema name
 */
TrackData.createTable = async function (knex, schema) {
    await knex.schema.withSchema(schema).createTable(TrackData.TABLE_NAME, function (table) {
        table.increments(TrackData.fields.sid).primary();
        table.integer(TrackData.fields.fk_trackdetail).references(TrackDetail.fields.sid).inTable(TrackDetail.TN).notNull().onDelete('cascade');
        table.string(TrackData.fields.ref);
        table.string(TrackData.fields.comments);
    });
}


module.exports = TrackData;