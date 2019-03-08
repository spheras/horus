const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const HTTPS_PORT = process.env.HTTPS_PORT || 8443;
const HTTP_PORT = process.env.HTTP_PORT || 8080;
var log = require('../util/logger');
var fs = require('fs');
var https = require('https');
var http = require('http');
const dao = require('../dao/dao');

class RestController {
    constructor() {
    }

    /**
     * @name startListening
     * @description the controller start listening at the https port
     */
    async startListening() {
        this.corsOptions = {
            origin: '*',
            optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204 
        }

        const app = express();
        app.use(cors(this.corsOptions))
        app.use(bodyParser.urlencoded({
            extended: true
        }));
        app.use(bodyParser.json());

        require('./settingscontroller').listen(app);
        require('./authcontroller').listen(app);
        require('./trackcontroller').listen(app);
        require('./usercontroller').listen(app);
        require('./searchcontroller').listen(app);
        require('./groupcontroller').listen(app);
        require('./baselayercontroller').listen(app);
        require('./operationcontroller').listen(app);
        require('./profilecontroller').listen(app);
        require('./techniquecontroller').listen(app);
        //static content
        app.use('/horus', express.static(__dirname + '/../../public'));

        let settings = await dao.getSettings();
        if (settings.ssl) {
            //start listening REST api from HTTPS
            https.createServer({
                key: fs.readFileSync('certs/server.key'),
                cert: fs.readFileSync('certs/server.crt')
            }, app).listen(HTTPS_PORT, function () {
                console.log("Horus server listening on port " + HTTPS_PORT + "...");
            });
        } else {
            http.createServer(app).listen(HTTP_PORT, function () {
                console.log("WARNING. Server Horus is without SSL security. Enable SSL via configuration.");
                console.log("Horus server listening on port " + HTTP_PORT + "...");
            })
        }
    }
}

module.exports = RestController;