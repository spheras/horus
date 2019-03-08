const dao = require('../dao/dao');
var log = require('../util/logger');
const passport = require('passport');
const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' })

/**
 * @name listen
 * @description add the paths to listen into the express application
 * @param {Express} app the express application
 */
module.exports = {
    listen: async function listen(app) {
        log.info(">> registering track controllers");

        app.delete('/track/:sid', passport.authenticate('jwt', { session: false }), async function (req, res) {
            //only admins can remove groups
            if (req.user.role == User.ROLES.ADMIN) {
                await dao.removeTrack(req.params.sid);
                res.send();
            } else {
                //error 401 -> unauthorized
                return res.status(401).send('Unauthorized. Only admins can remove tracks');
            }
        });

        /**
         * GET obtain all the tracks
         */
        app.get('/track', passport.authenticate('jwt', { session: false }), async function (req, res) {
            let tracks = await dao.getTracks();
            res.send(tracks);
        });

        /**
         * GET track details for a certain track
         */
        app.get('/track/:sid/detail', passport.authenticate('jwt', { session: false }), async function (req, res) {
            let details = await dao.getTrackDetails(req.params.sid);
            //filling track datas for each detail
            for (let i = 0; i < details.length; i++) {
                let detail = details[i];
                detail.datas = await dao.getTrackDatas(detail.sid);
            }
            res.send(details);
        });

        /**
         * GET last track details for a certain track
         */
        app.get('/track/:sid/detail/last/:lastCreation', passport.authenticate('jwt', { session: false }), async function (req, res) {
            let details = await dao.getLastTrackDetails(req.params.sid, req.params.lastCreation);
            //filling track datas for each detail
            for (let i = 0; i < details.length; i++) {
                let detail = details[i];
                detail.data = await dao.getTrackDatas(detail.sid);
            }
            res.send(details);
        });

        /**
         * GET a photo
         * TODO JAS passport.authenticate('jwt', { session: false }),
         */
        app.get('/photo/:sid',  async function (req, res) {
            let data = await dao.getPhoto(req.params.sid);
            res.contentType('image/jpeg');
            res.send(data);
        });

        /**
         * POST send a new track to be stored at the database. Example data to be sent:
         * {
         *   "group": "145",
         *   "hpassword": "12345",
         *   "uid": "687758665",
         *   "name": "pepe",
         *   "main": true,
         *   "creation": new Date().toISOString(),
         *   "trackinfo": trackinfo,
         *   "type": "GEO"
         * }
         */
        app.post('/track', async function (req, res) {
            log.info('/track posted...');
            let track = await dao.addTrack(req.body);
            if (track != null) {
                res.send(track);
            } else {
                res.status(500).send('Server Error adding track!');
            }
        });


        app.put('/track/:sid', passport.authenticate('jwt', { session: false }), async function (req, res) {
            log.info('/track updated...');
            let track = await dao.updateTrack(req.body);
            if (track != null) {
                res.send(track);
            } else {
                res.status(500).send('Server Error adding track!');
            }
        });
        

        /**
         * POST send a picture for a certain track info
         */
        app.post('/trackdetail/:sid/photo', upload.single('photo'), async function (req, res, next) {
            // req.file is the `photo` file
            // req.body will hold the text fields, if there were any
            try {
                await dao.addPhoto(req.file, req.params.sid, req.body.group_hpassword, req.body.comments);
                res.send("");
            } catch (error) {
                res.status(500).send('Error:' + error);
            }
        });

        /**
         * POST send a comment for a certain track info
         */
        app.post('/trackdetail/:sid/comment', async function (req, res) {
            try {
                await dao.addComment(req.params.sid, req.body.group_hpassword, req.body.comment);
                res.send("");
            } catch (error) {
                res.status(500).send('Error:' + error);
            }
        });
    }
};
