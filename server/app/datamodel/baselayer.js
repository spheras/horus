const Search = require('./search');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

/**
 * Entity Base Layer
 */
class BaseLayer {

    constructor(sid, name, description, url, layers, format, minZoom, maxZoom, attribution, transparent, continousWorld) {
        this.sid = sid;
        this.name = name;
        this.description = description;
        this.url = url;
        this.layers = layers;
        this.format = format;
        this.minZoom = minZoom;
        this.maxZoom = maxZoom;
        this.attribution = attribution;
        this.transparent = transparent;
        this.continousWorld = continousWorld;
    }

    toString() {
        return `BaseLayer -
        sid            : ${this.sid}
        name           : ${this.name}
        description    : ${this.description}
        url            : ${this.url}
        layers         : ${this.layers}
        format         : ${this.format}
        minZoom        : ${this.minZoom}
        maxZoom        : ${this.maxZoom}
        attribution    : ${this.attribution}
        transparent    : ${this.transparent}
        continousWorld : ${this.continousWorld}`;
    }

}
BaseLayer.TABLE_NAME = 'BASELAYERS';
BaseLayer.TN = BaseLayer.TABLE_NAME;
BaseLayer.fields = {
    sid: "sid",
    name: "name",
    description: "description",
    url: "url",
    layers: "layers",
    format: "format",
    minZoom: "minZoom",
    maxZoom: "maxZoom",
    attribution: "attribution",
    transparent: "transparent",
    continousWorld: "continousWorld"
}

/**
 * @name createTable
 * @description create the table for the entity from scratch
 * @param {*} knex the knex connection
 * @param {string} schema the schema name
 */
BaseLayer.createTable = async function (knex, schema) {
    await knex.schema.withSchema(schema).createTable(BaseLayer.TABLE_NAME, function (table) {
        table.increments(BaseLayer.fields.sid).primary();
        table.string(BaseLayer.fields.name, 255);
        table.string(BaseLayer.fields.description, 255);
        table.string(BaseLayer.fields.url, 255);
        table.string(BaseLayer.fields.layers, 255);
        table.string(BaseLayer.fields.format, 50);
        table.integer(BaseLayer.fields.minZoom);
        table.integer(BaseLayer.fields.maxZoom);
        table.text(BaseLayer.fields.attribution);
        table.boolean(BaseLayer.fields.transparent).defaultTo(false);
        table.boolean(BaseLayer.fields.continousWorld).defaultTo(true);
    });

    //default base layers
    await knex.withSchema(schema).table(BaseLayer.TABLE_NAME).insert(
        [
            //open street map
            {
                name: 'osm', description: 'Open Street Map',
                url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                minZoom: 1, maxZoom: 22,
                attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
            }
        ]);
}


/**
 * @name create
 * @description create a base layer
 * @param {*} knex  the knex connection
 * @param {string} schema  the schema name
 * @param {BaseLayer} baselayer the base layer data
 */
BaseLayer.create = async function (knex, schema, baselayer) {
    if (baselayer.sid) {
        baselayer = Object.assign({}, baselayer, { sid: undefined });
    }
    let dbbaselayer = await knex.withSchema(schema).table(BaseLayer.TABLE_NAME).insert(baselayer).returning('*').then();
    return dbbaselayer;
}

/**
 * @name update
 * @description update a baselayer
 * @param {*} knex the knex connection
 * @param {string} schema the schema name
 * @param {BaseLayer} baselayer the baselayer modifications
 */
BaseLayer.update = async function (knex, schema, baselayer) {
    let modification = Object.assign({}, baselayer, { sid: undefined });
    let dbbaselayer = await knex(BaseLayer.TN).withSchema(schema)
        .where('sid', '=', baselayer.sid)
        .update(modification).returning('*').then();
    return dbbaselayer;
}


module.exports = BaseLayer;