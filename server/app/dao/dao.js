var log = require('../util/logger');
var SchemaCreator = require('./schemacreator');
var TrackDetail = require('../datamodel/trackdetail');
var TrackData = require('../datamodel/trackdata');
var Track = require('../datamodel/track');
var Operation = require('../datamodel/operation');
var Technique = require('../datamodel/technique');
var Profile = require('../datamodel/profile');
var User = require('../datamodel/user');
var Search = require('../datamodel/search');
var Group = require('../datamodel/group');
var Area = require('../datamodel/area');
var GroupArea = require('../datamodel/group-area');
var Horus = require('../datamodel/horus');
var BaseLayer = require('../datamodel/baselayer');
const knexPostgis = require('knex-postgis');
var fs = require('fs');
var rewind = require('geojson-rewind');
var geojsonhint = require('@mapbox/geojsonhint');
const Semaphore = require(`simple-semaphore`);
const track_semaphore = new Semaphore();

var knex = require('knex')({
    client: 'pg',
    debug: true,
    connection: {
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
    }
});
// install postgis functions in knex.postgis;
const st = knexPostgis(knex);

class DAO {

    constructor() { }

    /**
     * @name connect
     * @description connect to the database
     */
    async connect() {
        log.info("Connecting to database....")
        log.info("DATABASE_HOST:" + process.env.DATABASE_HOST);
        log.info("DATABASE_USER:" + process.env.DATABASE_USER);
        log.info("DATABASE_PASSWORD:" + process.env.DATABASE_PASSWORD);
        log.info("DATABASE_SCHEMA:" + process.env.DATABASE_SCHEMA);

        var screator = new SchemaCreator();
        await screator.checkDatabase(knex);
    }

    /**
     * @name getSettings
     * @description obtain the settings of the application
     * @return {Horus} the settings of the application
     */
    async getSettings() {
        let schema = process.env.DATABASE_SCHEMA;
        let dbsettings = await knex(Horus.TN).withSchema(schema).select('*');
        return dbsettings[0];
    }


    /**
     * @name updateSettings
     * @description update the application settings
     * @param {Horus} settings the horus settings
     */
    async updateSettings(settings) {
        let schema = process.env.DATABASE_SCHEMA;
        let dbhorus = Horus.update(knex, schema, settings);
        return dbhorus;
    }


    /**
     * @name getSearch
     * @description return the search with sid specified from the database
     * @return {Search} the search found
     */
    async getSearch(sid) {
        let schema = process.env.DATABASE_SCHEMA;
        let dbsearch = await knex(Search.TN).withSchema(schema).where({ sid: sid }).select('*',
            st.asGeoJSON('lastPointSighting'),
            st.asGeoJSON('locationPointMissingPerson'),
            st.asGeoJSON('lastKnownPosition'),
            st.asGeoJSON('initialPlanningPoint'),
            st.asGeoJSON('forwardCommandPost'));
        if (dbsearch.length > 0) {
            return dbsearch[0];
        } else {
            return null;
        }
    }

    /**
     * @name getSearches
     * @description return all the searches from the database
     * @return {knex[]} all the searches database info 
     */
    async getSearches() {
        let schema = process.env.DATABASE_SCHEMA;
        let dbsearch = await knex(Search.TN).withSchema(schema).select('*',
            st.asGeoJSON('lastPointSighting'),
            st.asGeoJSON('locationPointMissingPerson'),
            st.asGeoJSON('lastKnownPosition'),
            st.asGeoJSON('initialPlanningPoint'),
            st.asGeoJSON('forwardCommandPost'));
        return dbsearch;
    }

    /**
     * @name removeSearch
     * @description remove a search from the database
     * @param {number} sid  the sid of the search to be removed
     */
    async removeSearch(sid) {
        let schema = process.env.DATABASE_SCHEMA;
        let dbuser = await knex(Search.TN).withSchema(schema).where({ sid: sid }).delete();
        return dbuser;
    }

    /**
     * @name createSearch
     * @description create a new search into the database
     * @param {Search} search the search to be created
     */
    async createSearch(search, groups, areas, links) {
        let schema = process.env.DATABASE_SCHEMA;

        //dealing with postgis fields
        if (search.forwardCommandPost != null) {
            if (search.forwardCommandPost == '') {
                search.forwardCommandPost = null;
            } else {
                let lonlat = search.forwardCommandPost.split(',');
                let postgisSQL = `ST_geomFromText('POINTZ(${lonlat[0].trim()} ${lonlat[1].trim()} 0)', 4326)`;
                search.forwardCommandPost = knex.raw(postgisSQL);
            }
        }
        if (search.lastPointSighting != null) {
            if (search.lastPointSighting == '') {
                search.lastPointSighting = null;
            } else {
                let lonlat = search.lastPointSighting.split(',');
                let postgisSQL = `ST_geomFromText('POINTZ(${lonlat[0].trim()} ${lonlat[1].trim()} 0)', 4326)`;
                search.lastPointSighting = knex.raw(postgisSQL);
            }
        }
        if (search.locationPointMissingPerson != null) {
            if (search.locationPointMissingPerson == '') {
                search.locationPointMissingPerson = null;
            } else {
                let lonlat = search.locationPointMissingPerson.split(',');
                let postgisSQL = `ST_geomFromText('POINTZ(${lonlat[0].trim()} ${lonlat[1].trim()} 0)', 4326)`;
                search.locationPointMissingPerson = knex.raw(postgisSQL);
            }
        }
        if (search.lastKnownPosition != null) {
            if (search.lastKnownPosition == '') {
                search.lastKnownPosition = null;
            } else {
                let lonlat = search.lastKnownPosition.split(',');
                let postgisSQL = `ST_geomFromText('POINTZ(${lonlat[0].trim()} ${lonlat[1].trim()} 0)', 4326)`;
                search.lastKnownPosition = knex.raw(postgisSQL);
            }
        }
        if (search.initialPlanningPoint != null) {
            if (search.initialPlanningPoint == '') {
                search.initialPlanningPoint = null;
            } else {
                let lonlat = search.initialPlanningPoint.split(',');
                let postgisSQL = `ST_geomFromText('POINTZ(${lonlat[0].trim()} ${lonlat[1].trim()} 0)', 4326)`;
                search.initialPlanningPoint = knex.raw(postgisSQL);
            }
        }        

        let dbsearch = await Search.create(knex, schema, search);
        let dbgroups = [];
        let dbareas = [];
        for (let i = 0; i < groups.length; i++) {
            let group = groups[i];
            group.fk_search = dbsearch[0].sid;
            let dbgroup = await Group.create(knex, schema, group);
            dbgroups.push(dbgroup[0]);
        }
        for (let i = 0; i < areas.length; i++) {
            let area = areas[i];
            area.fk_search = dbsearch[0].sid;
            let dbarea = await Area.create(knex, schema, area);
            dbareas.push(dbarea[0]);
        }
        for (let i = 0; i < links.length; i++) {
            let link = links[i];
            if (link.fk_group < 0) {
                //we need the real fk recently created
                //lets get the position in the array of teh group with that sid
                for (let index = 0; index < groups.length; index++) {
                    if (groups[index].sid == link.fk_group) {
                        //the new sid is...
                        link.fk_group = dbgroups[index].sid;
                        break;
                    }
                }
            }
            if (link.fk_area < 0) {
                //we need the real fk recently created
                //lets get the position in the array of the area with that sid
                for (let index = 0; index < areas.length; index++) {
                    if (areas[index].sid == link.fk_area) {
                        //the new sid is...
                        link.fk_area = dbareas[index].sid;
                        break;
                    }
                }
            }
            GroupArea.create(knex, schema, link);
        }

        return dbsearch;
    }

    /**
     * @name updateZone
     * @description update the zone of the search
     * @param {number} sid the search sid
     * @param {json} zone the geojson zone
     * @return {Search} the search modified, or list of errors trying to load the geojson layer
     */
    async updateZone(sid, zone) {
        let schema = process.env.DATABASE_SCHEMA;
        let self = this;

        //util function to search the area by its name
        let locateArea = async function (name) {
            let dbarea = await self.getAreaByName(sid, name);
            if (dbarea.length > 0) {
                return dbarea[0];
            }
            return null;
        }

        //we go thru all the features inside the geojson
        for (let i = 0; i < zone.features.length; i++) {
            let feature = zone.features[i];
            if (feature.type === 'Feature') {

                //and search a property which value is an area name
                let keys = Object.keys(feature.properties);
                for (let k = 0; k < keys.length; k++) {
                    let area = await locateArea(feature.properties[keys[k]]);
                    if (area != null) {
                        //yeah, we found the area associated

                        //now, we check the geometry
                        let errors = geojsonhint.hint(feature.geometry);
                        if (errors.length > 0 && errors[0].message.indexOf("right-hand") >= 0) {
                            //right-hand error, lets reverse the order
                            let newgeometry = rewind(feature.geometry, false);
                            feature.geometry = newgeometry;
                        } else if (errors.length > 0) {
                            //errors, lets return them
                            return errors;
                        }

                        //lets force a multipolygon
                        if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'polygon') {
                            feature.geometry.type = "MultiPolygon";
                            feature.geometry.coordinates = [feature.geometry.coordinates];
                        }

                        //lets update the geometry field of the area
                        let modification = {
                            zone: st.setSRID(st.geomFromGeoJSON(feature.geometry), 4326),
                        }
                        try {
                            await knex(Area.TN).withSchema(schema)
                                .where('sid', '=', area.sid)
                                .update(modification).returning('*').then();
                        } catch (err) {
                            return [err.message];
                        }

                        //next feature
                        break;
                    }
                }
            }
        }
    }

    /**
     * @name updateUser
     * @description update a user object
     * @param {Search} search the search with the new info
     */
    async updateSearch(search, groups, areas, links) {
        let schema = process.env.DATABASE_SCHEMA;

        //dealing with postgis fields
        if (search.forwardCommandPost != null) {
            if (search.forwardCommandPost == '') {
                search.forwardCommandPost = null;
            } else {
                let lonlat = search.forwardCommandPost.split(',');
                let postgisSQL = `ST_geomFromText('POINTZ(${lonlat[0].trim()} ${lonlat[1].trim()} 0)', 4326)`;
                search.forwardCommandPost = knex.raw(postgisSQL);
            }
        }
        if (search.lastPointSighting != null) {
            if (search.lastPointSighting == '') {
                search.lastPointSighting = null;
            } else {
                let lonlat = search.lastPointSighting.split(',');
                let postgisSQL = `ST_geomFromText('POINTZ(${lonlat[0].trim()} ${lonlat[1].trim()} 0)', 4326)`;
                search.lastPointSighting = knex.raw(postgisSQL);
            }
        }
        if (search.locationPointMissingPerson != null) {
            if (search.locationPointMissingPerson == '') {
                search.locationPointMissingPerson = null;
            } else {
                let lonlat = search.locationPointMissingPerson.split(',');
                let postgisSQL = `ST_geomFromText('POINTZ(${lonlat[0].trim()} ${lonlat[1].trim()} 0)', 4326)`;
                search.locationPointMissingPerson = knex.raw(postgisSQL);
            }
        }
        if (search.lastKnownPosition != null) {
            if (search.lastKnownPosition == '') {
                search.lastKnownPosition = null;
            } else {
                let lonlat = search.lastKnownPosition.split(',');
                let postgisSQL = `ST_geomFromText('POINTZ(${lonlat[0].trim()} ${lonlat[1].trim()} 0)', 4326)`;
                search.lastKnownPosition = knex.raw(postgisSQL);
            }
        }
        if (search.initialPlanningPoint != null) {
            if (search.initialPlanningPoint == '') {
                search.initialPlanningPoint = null;
            } else {
                let lonlat = search.initialPlanningPoint.split(',');
                let postgisSQL = `ST_geomFromText('POINTZ(${lonlat[0].trim()} ${lonlat[1].trim()} 0)', 4326)`;
                search.initialPlanningPoint = knex.raw(postgisSQL);
            }
        }
        
        let dbsearch = await Search.update(knex, schema, search);

        let dbgroups = [];
        let dbareas = [];
        for (let i = 0; i < groups.length; i++) {
            let group = groups[i];
            let dbgroup;
            if (group.sid < 0) {
                //new group for this search
                group.fk_search = dbsearch[0].sid;
                dbgroup = await Group.create(knex, schema, group);
            } else {
                //existing group, lets update
                dbgroup = await Group.update(knex, schema, group);
                dbgroups.push(dbgroup[0]);
            }
            dbgroups.push(dbgroup[0]);
        }
        for (let i = 0; i < areas.length; i++) {
            let area = areas[i];
            let dbarea;
            if (area.sid < 0) {
                //new area for this search
                area.fk_search = dbsearch[0].sid;
                dbarea = await Area.create(knex, schema, area);
            } else {
                //existing area, lets update
                dbarea = await Area.update(knex, schema, area);
                dbareas.push(dbarea[0]);
            }
            dbareas.push(dbarea[0]);
        }

        //deleting old links
        //Note: Knex doesn't support delete joins
        dbgroups.forEach(async function (element) {
            await knex(GroupArea.TN)
                .withSchema(schema)
                .where('fk_group', element.sid)
                .delete().then();
        });

        //creating again
        for (let i = 0; i < links.length; i++) {
            let link = links[i];
            if (link.fk_group < 0) {
                //we need the real fk recently created
                //lets get the position in the array of teh group with that sid
                for (let index = 0; index < groups.length; index++) {
                    if (groups[index].sid == link.fk_group) {
                        //the new sid is...
                        link.fk_group = dbgroups[index].sid;
                        break;
                    }
                }
            }
            if (link.fk_area < 0) {
                //we need the real fk recently created
                //lets get the position in the array of the area with that sid
                for (let index = 0; index < areas.length; index++) {
                    if (areas[index].sid == link.fk_area) {
                        //the new sid is...
                        link.fk_area = dbareas[index].sid;
                        break;
                    }
                }
            }
            log.info("link creating: " + link.fk_group + "-" + link.fk_area);
            await GroupArea.create(knex, schema, link);
        }


        return dbsearch;
    }

    /**
     * @name getSearchGroups
     * @description return all the groups of a certai search
     * @param {number} sid the sid of the search
     */
    async getSearchGroups(sid) {
        let schema = process.env.DATABASE_SCHEMA;
        let dbgroups = await knex(Group.TN).withSchema(schema).where({
            fk_search: sid
        }).select('*');
        return dbgroups;
    }

    /**
     * @name getSearchAreas
     * @description return all the areas of a certain search
     * @param {number} sid the sid of the search
     */
    async getSearchAreas(sid) {
        let schema = process.env.DATABASE_SCHEMA;
        let dbareas = await knex(Area.TN).withSchema(schema).where({
            fk_search: sid
        }).select('*', st.asGeoJSON('zone'));
        return dbareas;
    }

    /**
     * @name getSearchGroupAreas
     * @description return all the links group-areas of a certain search
     * @param {number} sid the sid of the search
     */
    async getSearchGroupAreas(sid) {
        let schema = process.env.DATABASE_SCHEMA;
        let dbareas = await knex(GroupArea.TN)
            .withSchema(schema)
            .where(Group.TN + '.fk_search', sid)
            .select(GroupArea.TN + '.*')
            .leftJoin(Group.TN, GroupArea.TN + '.' + GroupArea.fields.fk_group, Group.TN + '.' + Group.fields.sid);
        return dbareas;
    }

    /**
     * @name getSearchTracks
     * @description return all the tracks of a certain search
     * @param {number} sid the sid of the search
     */
    async getSearchTracks(sid) {
        let schema = process.env.DATABASE_SCHEMA;
        let dbtracks = await knex(GroupArea.TN)
            .withSchema(schema)
            .where(Group.TN + '.fk_search', sid)
            .select(Track.TN + '.*')
            .leftJoin(Group.TN, Track.TN + '.' + Track.fields.fk_group, Group.TN + '.' + Group.fields.sid);
        return dbtracks;
    }

    /**
     * @name getGroup
     * @description remove a group from the database
     * @param {number} sid  the sid of the group to be removed
     */
    async getGroup(sid) {
        let schema = process.env.DATABASE_SCHEMA;
        let dbgroup = await knex(Group.TN).withSchema(schema).where({ sid: sid }).select('*');
        if (dbgroup.length > 0) {
            return dbgroup[0];
        } else {
            return null;
        }
    }

    /**
     * @name removeGroup
     * @description remove a group from the database
     * @param {number} sid  the sid of the group to be removed
     */
    async removeGroup(sid) {
        let schema = process.env.DATABASE_SCHEMA;
        let dbgroup = await knex(Group.TN).withSchema(schema).where({ sid: sid }).delete();
        return dbgroup;
    }

    /**
     * @name getGroupTracks
     * @description return all the tracks of a certain group
     * @param {number} sid the sid of the group
     */
    async getGroupTracks(sid) {
        let schema = process.env.DATABASE_SCHEMA;

        let dbtrack = await knex(Track.TN).withSchema(schema)
            .leftJoin('PROFILES as p', 'p.sid', 'TRACKS.fk_profile')
            .leftJoin('TECHNIQUES as t', 't.sid', 'TRACKS.fk_technique')
            .leftJoin('OPERATIONS as o', 'o.sid', 'TRACKS.fk_operation')
            .where({ fk_group: sid })
            .select('TRACKS.*',
                'p.name as profile_name',
                't.name as technique_name',
                'o.name as operation_name',
            );


        //let dbtrack = await knex(Track.TN).withSchema(schema).selectwhere({ fk_group: sid }).select('*');
        if (dbtrack.length > 0) {
            return dbtrack;
        } else {
            return null;
        }
    }

    /**
     * @name removeArea
     * @description remove a group from the database
     * @param {number} sid  the sid of the group to be removed
     */
    async removeArea(sid) {
        let schema = process.env.DATABASE_SCHEMA;
        let dbarea = await knex(Area.TN).withSchema(schema).where({ sid: sid }).delete();
        return dbarea;
    }

    /**
     * @name findUser
     * @description find a user by the username
     * @param {string} username the username to search
     */
    async findUser(username) {
        let schema = process.env.DATABASE_SCHEMA;
        let dbuser = await knex(User.TN).withSchema(schema).where({
            username: username
        }).select('*');
        if (dbuser.length > 0) {
            dbuser = dbuser[0];
            return new User(dbuser.sid, dbuser.username, dbuser.email, dbuser.hpassword, dbuser.role, dbuser.description);
        } else {
            return null;
        }
    }

    /**
     * @name findUserBySid
     * @description find a user by the sid
     * @param {number} sid the sid to search
     */
    async findUserBySid(sid) {
        let schema = process.env.DATABASE_SCHEMA;
        let dbuser = await knex(User.TN).withSchema(schema).where({
            sid: sid
        }).select('*');
        if (dbuser.length > 0) {
            dbuser = dbuser[0];
            return new User(dbuser.sid, dbuser.username, dbuser.email, dbuser.hpassword, dbuser.role, dbuser.description);
        } else {
            return null;
        }
    }

    /**
     * @name getUsers
     * @description return all the users from the database
     * @return {knex[]} all the users database info 
     */
    async getUsers() {
        let schema = process.env.DATABASE_SCHEMA;
        let dbuser = await knex(User.TN).withSchema(schema).select('*');
        return dbuser;
    }

    /**
     * @name removeUser
     * @description remove an user from the database
     * @param {number} sid  the sid of the user to be removed
     */
    async removeUser(sid) {
        let schema = process.env.DATABASE_SCHEMA;
        let dbuser = await knex(User.TN).withSchema(schema).where({ sid: sid }).delete();
        return dbuser;
    }

    /**
     * @name createUser
     * @description create a new user into the database
     * @param {User} user the user to be created
     */
    async createUser(user) {
        let schema = process.env.DATABASE_SCHEMA;
        let dbuser = User.create(knex, schema, user);
        return dbuser;
    }

    /**
     * @name updateUser
     * @description update a user object
     * @param {User} user the user with the new info
     * @param {boolean} flagIsAdmin flag to know if the modification is done by an admin
     */
    async updateUser(user, flagIsAdmin) {
        let oldUser = this.findUserBySid(user.sid);
        let flagPasswordModified = false;
        if (oldUser.hpassword !== user.hpassword) {
            flagPasswordModified = true;
        }
        let schema = process.env.DATABASE_SCHEMA;
        let dbuser = User.update(knex, schema, user, flagPasswordModified, flagIsAdmin);
        return dbuser;
    }


    /**
     * @name getTracks
     * @description return all the tracks from database
     */
    async getTracks() {
        let schema = process.env.DATABASE_SCHEMA;
        let tracks = await knex(Track.TN).withSchema(schema).select('*');
        return tracks;
    }

    /**
     * @name removeTrack
     * @description remove a track from the database
     * @param {number} sid  the sid of the track to be removed
     */
    async removeTrack(sid) {
        let schema = process.env.DATABASE_SCHEMA;
        let dbtrack = await knex(Track.TN).withSchema(schema).where({ sid: sid }).delete();
        return dbtrack;
    }


    /**
     * @name getTrackDetails
     * @description return all the tracks detail of a certain track
     * @param {number} sid the track sid to locate
     */
    async getTrackDetails(sid) {
        let schema = process.env.DATABASE_SCHEMA;
        let tracks = await knex(TrackDetail.TN).withSchema(schema).where({
            fk_track: sid
        }).select('*', st.asGeoJSON('trackinfo')).orderBy(TrackDetail.fields.creation, 'asc');
        return tracks;
    }

    /**
     * @name getTrackData
     * @description return all the tracks data of a certain track
     * @param {number} sid the track sid to locate
     */
    async getTrackDatas(sid) {
        let schema = process.env.DATABASE_SCHEMA;
        let datas = await knex(TrackData.TN).withSchema(schema).where({
            fk_trackdetail: sid
        }).select('*');
        return datas;
    }

    /**
     * @name getLastTrackDetails
     * @description return the last tracks details of a certain track after the lastCreation param
     * @param {number} sid the track sid to locate
     * @param {string} lastCreation the last creation date to reference
     */
    async getLastTrackDetails(sid, lastCreation) {
        let schema = process.env.DATABASE_SCHEMA;
        let tracks = await knex(TrackDetail.TN).withSchema(schema).where({
            fk_track: sid,

        }).andWhere(function () {
            this.where(TrackDetail.fields.creation, '>', lastCreation)
        }).select('*', st.asGeoJSON('trackinfo')).orderBy(TrackDetail.fields.creation, 'asc');
        return tracks;
    }

    /**
     * Update an existing track
     * @param {} track
     */
    async updateTrack(jsonTrack) {

        //preparing and creating profiles, operations and techniques
        let profile = await this.createProfile(jsonTrack.profile_name);
        jsonTrack = Object.assign({}, jsonTrack, { profile_name: undefined });
        let operation = await this.createOperation(jsonTrack.operation_name);
        jsonTrack = Object.assign({}, jsonTrack, { operation_name: undefined });
        let technique = await this.createTechnique(jsonTrack.technique_name);
        jsonTrack = Object.assign({}, jsonTrack, { technique_name: undefined });

        if (profile != null) {
            jsonTrack.fk_profile = profile.sid;
        } else {
            jsonTrack.fk_profile = null;
        }
        if (operation != null) {
            jsonTrack.fk_operation = operation.sid;
        } else {
            jsonTrack.fk_operation = null;
        }
        if (technique != null) {
            jsonTrack.fk_technique = technique.sid;
        } else {
            jsonTrack.fk_technique = null;
        }

        let schema = process.env.DATABASE_SCHEMA;
        let dbtrack = await Track.update(knex, schema, jsonTrack).then();
        return dbtrack;
    }

    /**
     * Create a new profile by its name (if exists, just return the existing profile)
     * @param {string} name the name for the profile
     * @return {Profile} the profile created
     */
    async createProfile(name) {
        if(!name || name==null || name.length==0){
            return null;
        }
        
        let schema = process.env.DATABASE_SCHEMA;
        let profile = await knex(Profile.TN).withSchema(schema).where({
            name: name
        }).select('*');
        if (profile.length > 0) {
            return profile[0];
        } else {
            //creating a new profile
            profile = new Profile(null, name);
            profile = await Profile.create(knex, schema, profile).then();
            profile = profile[0];
        }
        return profile;
    }

    /**
     * Create a new operation by its name (if exists, just return the existing operation)
     * @param {string} name the name for the operation
     * @return {Operation} the operation created
     */
    async createOperation(name) {
        if(!name || name==null || name.length==0){
            return null;
        }

        let schema = process.env.DATABASE_SCHEMA;
        let operation = await knex(Operation.TN).withSchema(schema).where({
            name: name
        }).select('*');
        if (operation.length > 0) {
            return operation[0];
        } else {
            //creating a new operation
            operation = new Operation(null, name);
            operation = await Operation.create(knex, schema, operation).then();
            operation = operation[0];
        }
        return operation;
    }

        /**
     * Create a new technique by its name (if exists, just return the existing technique)
     * @param {string} name the name for the operation
     * @return {Technique} the technique created
     */
    async createTechnique(name) {
        if(!name || name==null || name.length==0){
            return null;
        }

        let schema = process.env.DATABASE_SCHEMA;
        let technique = await knex(Technique.TN).withSchema(schema).where({
            name: name
        }).select('*');
        if (technique.length > 0) {
            return technique[0];
        } else {
            //creating a new technique
            technique = new Technique(null, name);
            technique = await Technique.create(knex, schema, technique).then();
            technique = technique[0];
        }
        return technique;
    }

    /**
     * Create a new track info into the database
     * @param {} track 
     */
    async addTrack(jsonTrack) {
        let schema = process.env.DATABASE_SCHEMA;

        //lets check if the group exists
        let dbgroup = await knex(Group.TN).withSchema(schema).where({
            sid: jsonTrack.group_sid
        }).select(Group.fields.sid, Group.fields.active, Group.fields.name, Group.fields.hpassword);

        if (dbgroup.length > 0) {
            //yes, the group exists
            dbgroup = dbgroup[0];

            //checking if the group is active
            if (!dbgroup.active) {
                log.error(`Group ${dbgroup.name} is not Active! Discarding track info!`)
                return null;
            }

            //checking the secret password for the group
            if (dbgroup.hpassword != jsonTrack.group_hpassword) {
                log.error(`Alert! password not valid for the group!! Discarding track info!`)
                return null;
            }

            //lets see if the header track exists or is the first time receiving tracks from it
            let dbtrack = await knex(Track.TN).withSchema(schema).where({
                fk_group: dbgroup.sid,
                uid: jsonTrack.device_uid
            }).select(Track.fields.sid);

            if (dbtrack.length == 0) {
                log.debug("First Track to create.. waiting semaphore");
                //Is the first time, lets insert the track header to the database

                //creating a sempahore to avoid concurrency problems
                await track_semaphore.wait();

                log.debug("inside the semaphore");

                //confirming that there is no track yet
                //note: I don't do this before to avoid locking it everytime tracks are created
                dbtrack = await knex(Track.TN).withSchema(schema).where({
                    fk_group: dbgroup.sid,
                    uid: jsonTrack.device_uid
                }).select(Track.fields.sid);

                if (dbtrack.length == 0) {
                    log.debug("no track confirmed, lets create");
                    await knex.withSchema(schema).table(Track.TN).insert({
                        name: jsonTrack.device_name,
                        uid: jsonTrack.device_uid,
                        main: jsonTrack.device_main,
                        fk_group: dbgroup.sid
                    }).then();
                } else {
                    log.debug("oh! it was created previously!");
                }

                //removing the semaphore
                log.debug("semaphore released!");
                track_semaphore.signal();
            }

            dbtrack = await knex(Track.TN).withSchema(schema).where({
                fk_group: dbgroup.sid,
                uid: jsonTrack.device_uid
            }).select(Track.fields.sid);
            dbtrack = dbtrack[0];


            //the last thing.. lets add the detail track
            let trackinfoarr = jsonTrack.track_info.split(",");
            let longitude = trackinfoarr[0];
            let latitude = trackinfoarr[1];
            let height = trackinfoarr[2] || 0;
            if (height === 'undefined') {
                height = 0;
            }

            let postgisSQL = `ST_geomFromText('POINTZ(${longitude} ${latitude} ${height})', 4326)`;
            let result = await knex.withSchema(schema).table(TrackDetail.TN).insert({
                fk_track: dbtrack.sid,
                creation: jsonTrack.track_creation,
                trackinfo: knex.raw(postgisSQL)
            }).returning('*').then();

            result = result[0];
            let td = new TrackDetail(result.sid, result.fk_track, result.creation.toISOString(), result.trackinfo, result.binaryref);
            log.info(`Track Added: ${td.toString()}`);
            return td;
        } else {
            log.error(`The group for the track to insert (${jsonTrack.group_sid}) doesn't exist!!`)
            return null;
        }
    }

    /**
     * Create a new track data with a comment into the database
     * @param {number} trackdetail_sid the sid of the trackdetail to link this photo
     * @param {string} comment comment to add
     */
    async addComment(trackdetail_sid, group_hpassword, comment) {
        let schema = process.env.DATABASE_SCHEMA;

        //lets check if the trackdetail exists
        let dbtrackdetail = await knex(TrackDetail.TN).withSchema(schema).where({
            sid: trackdetail_sid
        }).select('*');

        if (dbtrackdetail.length > 0) {
            dbtrackdetail = dbtrackdetail[0];
            //obtaining track header
            let dbtrack = await knex(Track.TN).withSchema(schema).where({
                sid: dbtrackdetail.fk_track
            }).select('*');
            dbtrack = dbtrack[0];
            //obtaining group
            let dbgroup = await knex(Group.TN).withSchema(schema).where({
                sid: dbtrack.fk_group
            }).select('*');
            dbgroup = dbgroup[0];

            //obtaining search
            let dbsearch = await knex(Search.TN).withSchema(schema).where({
                sid: dbgroup.fk_search
            }).select('*');
            dbsearch = dbsearch[0];

            //checking if the group is active
            if (!dbgroup.active) {
                log.error(`Group ${dbgroup.name} is not Active! Discarding track info!`)
                return null;
            }

            //checking the secret password for the group
            if (dbgroup.hpassword != group_hpassword) {
                log.error(`Alert! password is not valid for the group!! Discarding track info!`)
                return null;
            }

            //adding it to the track detail
            let dbtrackdata = await knex.withSchema(schema).table(TrackData.TABLE_NAME).insert(
                [
                    {
                        fk_trackdetail: trackdetail_sid,
                        ref: null,
                        comments: comment
                    }
                ]
            ).then();

            return dbtrackdata;

        } else {
            throw "Inexistent Track Detail!";
        }
    }

    /**
     * @name getPhoto
     * @description get a picture taken for a track data
     * @param {number} trackdata_sid the track data sid to obtain a photo
     * @return the binary of the photo or null if not found
     */
    async getPhoto(trackdata_sid) {
        let schema = process.env.DATABASE_SCHEMA;
        let dbtrackdata = await knex(TrackData.TN).withSchema(schema).where({
            sid: trackdata_sid
        }).select('*');
        if (dbtrackdata && dbtrackdata.length > 0) {
            let path = dbtrackdata[0].ref;
            if (path && path != null) {
                let result=await fs.readFileSync(path);
                return result;
            }
        }

        return null;
    }

    /**
     * Create a new track data with a picture into the database
     * @param {string} file the file path of the photo uploaded
     * @param {number} trackdetail_sid the sid of the trackdetail to link this photo
     * @param {string} group_hpassword the password of the group for security reasons
     * @param {string} comments (optional) comments for the photo
     */
    async addPhoto(file, trackdetail_sid, group_hpassword, comments) {
        let schema = process.env.DATABASE_SCHEMA;

        //lets check if the trackdetail exists
        let dbtrackdetail = await knex(TrackDetail.TN).withSchema(schema).where({
            sid: trackdetail_sid
        }).select('*');

        if (dbtrackdetail.length > 0) {
            dbtrackdetail = dbtrackdetail[0];
            //obtaining track header
            let dbtrack = await knex(Track.TN).withSchema(schema).where({
                sid: dbtrackdetail.fk_track
            }).select('*');
            dbtrack = dbtrack[0];
            //obtaining group
            let dbgroup = await knex(Group.TN).withSchema(schema).where({
                sid: dbtrack.fk_group
            }).select('*');
            dbgroup = dbgroup[0];

            //obtaining search
            let dbsearch = await knex(Search.TN).withSchema(schema).where({
                sid: dbgroup.fk_search
            }).select('*');
            dbsearch = dbsearch[0];

            //checking if the group is active
            if (!dbgroup.active) {
                log.error(`Group ${dbgroup.name} is not Active! Discarding track info!`)
                return null;
            }

            //checking the secret password for the group
            if (dbgroup.hpassword != group_hpassword) {
                log.error(`Alert! password is not valid for the group!! Discarding track info!`)
                return null;
            }

            //adding it to the track detail
            let now = Date.now();
            let destination = `${__dirname}/../../pictures/${dbsearch.sid}-${now}.jpg`;

            let dbtrackdata = await knex.withSchema(schema).table(TrackData.TABLE_NAME).insert(
                [
                    {
                        fk_trackdetail: trackdetail_sid,
                        ref: destination,
                        comments: comments
                    }
                ]
            ).then();

            //lets move the photo from the temporary folder to the destination folder
            fs.renameSync(
                `${__dirname}/../../uploads/${file.filename}`, //file is temporally at the uploads folder
                destination); //we move it to the pictures folder

            return dbtrackdata;

        } else {
            throw "Inexistent Track Detail!";
        }

    }

    /**
     * @name getBaseLayers
     * @description return all the base layers from the database
     * @return {knex[]} all the base layers database info 
     */
    async getBaseLayers() {
        let schema = process.env.DATABASE_SCHEMA;
        let dbbaselayer = await knex(BaseLayer.TN).withSchema(schema).select('*');
        return dbbaselayer;
    }

    /**
     * @name removeBaseLayer
     * @description remove a base layer from the database
     * @param {number} sid  the sid of the base layer to be removed
     */
    async removeBaseLayer(sid) {
        let schema = process.env.DATABASE_SCHEMA;
        let dbbaselayer = await knex(BaseLayer.TN).withSchema(schema).where({ sid: sid }).delete();
        return dbbaselayer;
    }

    /**
     * @name createBaseLayer
     * @description create a new base layer into the database
     * @param {BaseLayer} user the base layer to be created
     */
    async createBaseLayer(baselayer) {
        let schema = process.env.DATABASE_SCHEMA;
        let dbbaselayer = BaseLayer.create(knex, schema, baselayer);
        return dbbaselayer;
    }

    /**
     * @name updateBaesLayer
     * @description update a baselayer object
     * @param {BaseLayer} baselayer the baselayer with the new info
     */
    async updateBaseLayer(baselayer) {
        let schema = process.env.DATABASE_SCHEMA;
        let dbaselayer = BaseLayer.update(knex, schema, baselayer);
        return dbaselayer;
    }

    /**
     * Search an area by its name
     * @param {number} fk_search the fk_search to filter
     * @param {string} name the area name
     */
    async getAreaByName(fk_search, name) {
        let schema = process.env.DATABASE_SCHEMA;
        let dbarea = await knex(Area.TN).withSchema(schema).
            where({ name: name, fk_search: fk_search }).select('*');
        return dbarea;
    }

    /**
     * Return all the profiles
     */
    async getAllProfiles() {
        let schema = process.env.DATABASE_SCHEMA;
        let dbrecords = await knex(Profile.TN).withSchema(schema).select('*');
        return dbrecords;
    }

    /**
     * Return all the operations
     */
    async getAllOperations() {
        let schema = process.env.DATABASE_SCHEMA;
        let dbrecords = await knex(Operation.TN).withSchema(schema).select('*');
        return dbrecords;
    }

    /**
     * Return all the techniques
     */
    async getAllTechniques() {
        let schema = process.env.DATABASE_SCHEMA;
        let dbrecords = await knex(Technique.TN).withSchema(schema).select('*');
        return dbrecords;
    }

}


module.exports = new DAO();




