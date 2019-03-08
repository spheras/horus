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
        log.info(">> registering group controllers");

        app.delete('/group/:sid', passport.authenticate('jwt', { session: false }), async function (req, res) {
            //only admins can remove groups
            if (req.user.role == User.ROLES.ADMIN) {
                await dao.removeGroup(req.params.sid);
                res.send();
            } else {
                //error 401 -> unauthorized
                return res.status(401).send('Unauthorized. Only admins can remove groups');
            }
        });

        /**
         * GET obtain a certain group info
         */
        app.get('/group/:sid', passport.authenticate('jwt', { session: false }), async function (req, res) {
            let group = await dao.getGroup(req.params.sid);
            res.send(group);
        });

        /**
         * GET obtain list of tracks of a certain group
         */
        app.get('/group/:sid/track', passport.authenticate('jwt', { session: false }), async function (req, res) {
            let tracks = await dao.getGroupTracks(req.params.sid);
            res.send(tracks);
        });
    }
};
