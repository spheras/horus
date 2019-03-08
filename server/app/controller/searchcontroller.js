const dao = require('../dao/dao');
var log = require('../util/logger');
const passport = require('passport');
const User = require('../datamodel/user');

/**
 * @name listen
 * @description add the paths to listen into the express application
 * @param {Express} app the express application
 */
module.exports = {
    listen: async function listen(app) {
        log.info(">> registering search controllers");

        /**
         * GET obtain list of searches
         */
        app.get('/search/:sid', passport.authenticate('jwt', { session: false }), async function (req, res) {
            let searches = await dao.getSearch(req.params.sid);
            res.send(searches);
        });

        /**
         * GET obtain list of searches
         */
        app.get('/search', passport.authenticate('jwt', { session: false }), async function (req, res) {
            let searches = await dao.getSearches();
            res.send(searches);
        });

        /**
         * GET obtain list of groups of a certain search
         */
        app.get('/search/:sid/group', passport.authenticate('jwt', { session: false }), async function (req, res) {
            let groups = await dao.getSearchGroups(req.params.sid);
            res.send(groups);
        });

        /**
         * GET obtain list of areas of a certain search
         */
        app.get('/search/:sid/area', passport.authenticate('jwt', { session: false }), async function (req, res) {
            let areas = await dao.getSearchAreas(req.params.sid);
            res.send(areas);
        });

        /**
         * GET obtain list of group-areas of a certain search
         */
        app.get('/search/:sid/grouparea', passport.authenticate('jwt', { session: false }), async function (req, res) {
            let groupareas = await dao.getSearchGroupAreas(req.params.sid);
            res.send(groupareas);
        });

        /**
         * GET obtain list of tracks of a certain search
         */
        app.get('/search/:sid/track', passport.authenticate('jwt', { session: false }), async function (req, res) {
            let tracks = await dao.getSearchTracks(req.params.sid);
            res.send(tracks);
        });

        app.delete('/search/:sid', passport.authenticate('jwt', { session: false }), async function (req, res) {
            //only admins can remove searches
            if (req.user.role == User.ROLES.ADMIN) {
                await dao.removeSearch(req.params.sid);
                res.send();
            } else {
                //error 401 -> unauthorized
                return res.status(401).send('Unauthorized. Only admins can remove searches');
            }
        });

        /**
         * POST send a new search to be stored at the database.
         * the request body must pass the search info (and groups, and areas, and links)
         */
        app.post('/search', passport.authenticate('jwt', { session: false }), async function (req, res) {
            if (req.user.role == User.ROLES.ADMIN) {
                log.debug('/search posted.. inserting to database...')
                await dao.createSearch(req.body.search, req.body.groups, req.body.areas, req.body.links);
                res.send();
            } else {
                //error 401 -> unauthorized
                return res.status(401).send('Unauthorized. Only admins can create searches');
            }
        });

        /**
         * PUT update the search with the SID indicated
         * the request body must pass the search info (and groups, and areas, and links)
         */
        app.put('/search/:sid', passport.authenticate('jwt', { session: false }), async function (req, res) {
            //only allowed to admins or if the modificated search is the same as logged
            let flagIsAdmin = req.user.role == User.ROLES.ADMIN;
            if (flagIsAdmin) {
                log.debug('/search updated... updating to database...');
                await dao.updateSearch(req.body.search, req.body.groups, req.body.areas, req.body.links);
                res.send();
            } else {
                //error 401 -> unauthorized
                return res.status(401).send('Unauthorized. Only admins can modify searches');
            }
        });

        /**
         * PUT update the zone of a search with the SID indicated
         * the request body must pass the zone in geojson format
         */
        app.put('/search/:sid/zone', passport.authenticate('jwt', { session: false }), async function (req, res) {
            //only allowed to admins or if the modificated search is the same as logged
            let flagIsAdmin = req.user.role == User.ROLES.ADMIN;
            if (flagIsAdmin) {
                log.debug('/search updated... updating to database...');
                let search = await dao.updateZone(req.params.sid, req.body);
                res.send(search);
            } else {
                //error 401 -> unauthorized
                return res.status(401).send('Unauthorized. Only admins can modify searches');
            }
        });
    }
};
