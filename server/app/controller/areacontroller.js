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
        log.info(">> registering area controllers");

        app.delete('/area/:sid', passport.authenticate('jwt', { session: false }), async function (req, res) {
            //only admins can remove areas
            if (req.user.role == User.ROLES.ADMIN) {
                await dao.removeArea(req.params.sid);
                res.send();
            } else {
                //error 401 -> unauthorized
                return res.status(401).send('Unauthorized. Only admins can remove areas');
            }
        });

    }
};
