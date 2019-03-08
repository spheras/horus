var log = require('../util/logger');
var Horus = require('../datamodel/horus');
var Track = require('../datamodel/track');
var TrackDetail = require('../datamodel/trackdetail');
var TrackData = require('../datamodel/trackdata');
var Operation=require('../datamodel/operation');
var Technique=require('../datamodel/technique');
var Profile=require('../datamodel/profile');
var User = require('../datamodel/user');
var Search = require('../datamodel/search');
var Group = require('../datamodel/group');
var Area = require('../datamodel/area');
var GroupArea = require('../datamodel/group-area');
var BaseLayer = require('../datamodel/baselayer');
var fs = require('fs');
var rimraf = require('rimraf');

class SchemaCreator {

    constructor() { }

    /**
     * @name checkDatabase
     * @description check if the database is correctly build. If not, it creates tables, etc..
     * @param {Knex} knex the Knex database connection
     */
    async checkDatabase(knex) {
        var schema = process.env.DATABASE_SCHEMA;
        var existHorus = await knex.schema.withSchema(schema).hasTable(Horus.TABLE_NAME);
        if (existHorus) {
            log.info('Database exists! let\'s checking version...');
            var version = 0;
            let result = await knex(knex.ref(Horus.TABLE_NAME).withSchema(schema)).select(['version']);
            log.info('Database Version:' + result[0].version);
            //by the moment we only have one version. 
            //In the future, we must manage database updates for different versions.
        } else {
            log.info('Database DOESN\'T exist! creating a new one...');
            await this.createNewDatabaseFromScratch(knex);
        }
    }

    /**
     * @name createNewDatabaseFromScratch
     * @description create the database from scratch (database doesn't exist)
     * @param {Knex} knex the Knex database connection
     */
    async createNewDatabaseFromScratch(knex) {
        var schema = process.env.DATABASE_SCHEMA;

        /*
        return knex.schema
            .raw('CREATE EXTENSION postgis')
            .raw('CREATE EXTENSION postgis_topology')
            .raw('CREATE EXTENSION fuzzystrmatch')
            .raw('CREATE EXTENSION postgis_tiger_geocoder')
            .raw(`SET SCHEMA '${schema}'`)
            .raw('CREATE EXTENSION pg_trgm');
        */

        //creating Horus table (generic application configuration)
        await Horus.createTable(knex, schema);
        //creating BaseLayer Data Table
        await BaseLayer.createTable(knex, schema);
        //creating Users Table
        await User.createTable(knex, schema);
        //creating Searches Table
        await Search.createTable(knex, schema);
        //creating Groups Table
        await Group.createTable(knex, schema);
        //creating Areas Table
        await Area.createTable(knex, schema);
        //creating Groups - Areas Table
        await GroupArea.createTable(knex, schema);
        //Creating Operations Table
        await Operation.createTable(knex, schema);
        //Creating Profiles Table
        await Profile.createTable(knex, schema);
        //Creating Techniques Table
        await Technique.createTable(knex, schema);
        //creating Tracks Header Table
        await Track.createTable(knex, schema);
        //creating Tracks Detail Table
        await TrackDetail.createTable(knex, schema);
        //creating Tracks Data Table
        await TrackData.createTable(knex, schema);

        log.info("Removing old pictures and uploads...");
        //now lets check if there is a folder to upload pictures
        //if exists them, we need to remove
        //and create new ones
        let picture_path = `${__dirname}/../../pictures`;
        try {
            fs.accessSync(picture_path, fs.F_OK);
            rimraf.sync(picture_path);
        } catch (e) {
            // It isn't accessible
            //perfect
        }

        let uploads_path = `${__dirname}/../../uploads`;
        try {
            fs.accessSync(uploads_path, fs.F_OK);
            rimraf.sync(uploads_path);
        } catch (e) {
            // It isn't accessible
            //perfect
        }

        fs.mkdirSync(picture_path);
        fs.mkdirSync(uploads_path);
    }
}

module.exports = SchemaCreator;




