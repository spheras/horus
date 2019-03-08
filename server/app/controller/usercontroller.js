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
        log.info(">> registering users controllers");

        /**
         * GET obtain list of users
         * TODO
         */
        app.get('/user', passport.authenticate('jwt', { session: false }), async function (req, res) {
            if (req.user.role == User.ROLES.ADMIN) {
                //if we are adming, return all the users
                let users = await dao.getUsers();
                res.send(users);
            } else {
                //if we ar not admin, return only the user logged
                let result = [];
                result.push(req.user);
                res.send(result);
            }
        });

        app.delete('/user/:sid', passport.authenticate('jwt', { session: false }), async function (req, res) {
            if (req.user.sid == req.params.sid) {
                return res.status(500).send("You can't remove yourself");
            }
            //only admins can remove users
            if (req.user.role == User.ROLES.ADMIN) {
                dao.removeUser(req.params.sid);
                res.send();
            } else {
                //error 401 -> unauthorized
                return res.status(401).send('Unauthorized. Only admins can remove users');
            }
        });

        /**
         * POST send a new user to be stored at the database.
         */
        app.post('/user', passport.authenticate('jwt', { session: false }), async function (req, res) {
            if (req.user.role == User.ROLES.ADMIN) {
                log.debug('/user posted.. inserting to database...')
                dao.createUser(req.body);
                res.send();
            } else {
                //error 401 -> unauthorized
                return res.status(401).send('Unauthorized. Only admins can create users');
            }
        });

        /**
         * PUT update the user with the SID indicated
         * the request body must pass the user info
         */
        app.put('/user/:sid', passport.authenticate('jwt', { session: false }), async function (req, res) {
            //only allowed to admins or if the modificated user is the same as logged
            let flagIsAdmin = req.user.role == User.ROLES.ADMIN;
            if (flagIsAdmin || req.user.sid == req.body.sid) {
                log.debug('/user updated... updating to database...');
                dao.updateUser(req.body, flagIsAdmin);
                res.send();
            } else {
                //error 401 -> unauthorized
                return res.status(401).send('Unauthorized. Only admins can modify users');
            }
        });
    }
};
