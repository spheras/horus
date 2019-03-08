const Track = require('./track');

/**
 * Entity Track Detail
 */
class TrackDetail {

    constructor(sid, fk_track, creation, trackinfo) {
        this.sid = sid;
        this.fk_track = fk_track;
        this.creation = creation;
        this.trackinfo = trackinfo;
    }

    toString() {
        return `TrackDetail -
        sid       : ${this.sid}
        fk_track  : ${this.fk_track}
        creation  : ${this.creation}
        trackinfo : ${this.trackinfo}`;
    }
}
TrackDetail.TABLE_NAME = 'TRACKS_DETAIL';
TrackDetail.TN = TrackDetail.TABLE_NAME;
TrackDetail.fields = {
    sid: "sid",
    fk_track: "fk_track",
    creation: "creation",
    trackinfo: "trackinfo"
}

/**
 * @name createTable
 * @description create the table for the entity from scratch
 * @param {*} knex the knex connection
 * @param {string} schema the schema name
 */
TrackDetail.createTable = async function (knex, schema) {
    await knex.schema.withSchema(schema).createTable(TrackDetail.TABLE_NAME, function (table) {
        table.increments(TrackDetail.fields.sid).primary();
        table.integer(TrackDetail.fields.fk_track).references(Track.fields.sid).inTable(Track.TN).notNull().onDelete('cascade');
        table.datetime(TrackDetail.fields.creation).defaultTo(knex.fn.now()).notNull();
        table.specificType(TrackDetail.fields.trackinfo, 'GEOGRAPHY(POINTZ, 4326)');
    });
}

/**
 * @name update
 * @description update a track detail
 * @param {*} knex  the knex connection
 * @param {string} schema  the schema name
 * @param {TrackDetail} trackdetail the trackdetail modifications
 */
TrackDetail.update = async function (knex, schema, trackdetail) {
    let modification = Object.assign({}, trackdetail, { sid: undefined });
    let dbtrackdetail = await knex(TrackDetail.TN).withSchema(schema)
        .where('sid', '=', trackdetail.sid)
        .update(modification).returning('*').then();
    return dbtrackdetail;
}


module.exports = TrackDetail;