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
        log.info(">> registering baselayers controllers");

        app.get('/baselayer', passport.authenticate('jwt', { session: false }), async function (req, res) {
            let result = await dao.getBaseLayers();
            res.send(result);
        });

        /**
         * DELETE remove an existent base layer at the database.
         */
        app.delete('/baselayer/:sid', passport.authenticate('jwt', { session: false }), async function (req, res) {
            //only admins can remove searches
            if (req.user.role == User.ROLES.ADMIN) {
                await dao.removeBaseLayer(req.params.sid);
                res.send();
            } else {
                //error 401 -> unauthorized
                return res.status(401).send('Unauthorized. Only admins can remove base layers');
            }
        });

        /**
         * POST send a new base layer to be stored at the database.
         * the request body must pass the base layer info
         */
        app.post('/baselayer', passport.authenticate('jwt', { session: false }), async function (req, res) {
            if (req.user.role == User.ROLES.ADMIN) {
                log.debug('/base layer posted.. inserting to database...')
                await dao.createBaseLayer(req.body);
                res.send();
            } else {
                //error 401 -> unauthorized
                return res.status(401).send('Unauthorized. Only admins can create base layers');
            }
        });

        /**
         * PUT update the base layer with the SID indicated
         * the request body must pass the base layer info
         */
        app.put('/baselayer/:sid', passport.authenticate('jwt', { session: false }), async function (req, res) {
            //only allowed to admins or if the modificated search is the same as logged
            let flagIsAdmin = req.user.role == User.ROLES.ADMIN;
            if (flagIsAdmin) {
                log.debug('/baselayer updated... updating to database...');
                await dao.updateBaseLayer(req.body);
                res.send();
            } else {
                //error 401 -> unauthorized
                return res.status(401).send('Unauthorized. Only admins can modify base layers');
            }
        });


    }
};
