//main application
var log = require('./util/logger');
var fs = require('fs');

//launching program
main();

/**
 * @name main
 * @description main function
 */
async function main() {
    //try {
    //showing horus version and logo
    log.info("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<-----[HORUS]----->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
    log.info("Horus v1.0");
    let data = fs.readFileSync('logo.txt', 'utf8');
    log.info(data.toString('utf8'));

    //getting the configuration of the application
    await require('dotenv').config();

    //connecting to the database
    await require('./dao/dao').connect();

    //start listening REST petitions
    const RestController = require('./controller/restcontroller');
    const app = new RestController();
    app.startListening();
    /*} catch (error) {
        log.error(error);
    }*/
}

