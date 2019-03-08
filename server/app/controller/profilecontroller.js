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
        log.info(">> registering profile controllers");

        /**
         * GET obtain all records
         */
        app.get('/profile', passport.authenticate('jwt', { session: false }), async function (req, res) {
            let profiles = await dao.getAllProfiles();
            res.send(profiles);
        });
    }
};
