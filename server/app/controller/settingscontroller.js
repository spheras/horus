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
        log.info(">> registering settings controllers");

        /**
         * GET obtain the settings
         */
        app.get('/settings', passport.authenticate('jwt', { session: false }), async function (req, res) {
            let settings = await dao.getSettings();
            res.send(settings);
        });

        /**
         * PUT update the settings
         * the request body must pass the settings info
         */
        app.put('/settings', passport.authenticate('jwt', { session: false }), async function (req, res) {
            //only allowed to admins or if the modificated search is the same as logged
            let flagIsAdmin = req.user.role == User.ROLES.ADMIN;
            if (flagIsAdmin) {
                log.debug('/setting updated... updating to database...');
                await dao.updateSettings(req.body);
                res.send();
            } else {
                //error 401 -> unauthorized
                return res.status(401).send('Unauthorized. Only admins can modify settings');
            }
        });
    }
};
