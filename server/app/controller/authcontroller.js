const dao = require('../dao/dao');
const log = require('../util/logger');
const bCrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const jwt = require('jsonwebtoken');
const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

/**
 * @name listen
 * @description add the paths to listen into the express application
 * @param {Express} app the express application
 */
module.exports = {
    listen: async function listen(app) {
        log.info(">> registering auth controllers");

        //check whether the password is valid or not
        var isValidPassword = function (user, password) {
            return bCrypt.compareSync(password, user.hpassword);
        }

        /**
         * The local strategy followed to login
         * @param {string} username the username to login
         * @param {string} password the password to login
         */
        passport.use(new LocalStrategy({
            usernameField: 'username',
            passwordField: 'password'
        },
            async function (username, password, cb) {
                try {
                    let user = await dao.findUser(username);
                    if (user != null && isValidPassword(user, password)) {
                        return cb(null, user, { message: 'Logged In Successfully' });
                    } else {
                        return cb(null, false, { message: 'Incorrect username or password.' });
                    }
                } catch (err) {
                    cb(err);
                }
            }
        ));


        /**
         * Defines the JWT Strategy to load the token from the header whenever
         * a request is done
         * It needs a header parameter like:
         * authorization: bearer JWT_TOKEN
         */
        passport.use(new JWTStrategy({
            jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.SECURITY_SECRET
        },
            async function (jwtPayload, cb) {
                let user = await dao.findUserBySid(jwtPayload.sid);
                if (user != null) {
                    return cb(null, user);
                } else {
                    return cb("User not valid!");
                }
            }
        ));

        /**
         * POST /login
         * @description login service 
         * @param username {string} the username to login
         * @param password {string} the hashed password to login
         */
        app.post('/login', function (req, res, next) {
            passport.authenticate('local', { session: false }, (err, dbuser, info) => {
                if (err || !dbuser) {
                    if (err) {
                        return res.status(400).json({
                            message: 'Something is not right: ' + err,
                            dbuser: dbuser
                        });
                    } else {
                        return res.status(400).json({
                            message: 'Incorrect username or password',
                            dbuser: dbuser
                        });
                    }
                }
                req.login(dbuser, { session: false }, (err) => {
                    if (err) {
                        res.send(err);
                    }
                    //user = { sid: dbuser.sid, email: dbuser.email, username: dbuser.username };
                    let user = JSON.parse(JSON.stringify(dbuser)); //we need a plain object
                    const token = jwt.sign(user, process.env.SECURITY_SECRET, {
                        expiresIn: 86400 //seconds, therefor expires in 24 hours
                    });
                    return res.json({ user, token });
                });
            })(req, res);
        });
    }
};
