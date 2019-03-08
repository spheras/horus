/**
 * Entity Track
 */
class Horus {

    constructor(version, publicHostName, publicPort, ssl) {
        this.version = version;
        this.publicHostName = publicHostName;
        this.publicPort = publicPort;
        this.ssl = ssl;
    }

    toString() {
        return `Horus -
        version        : ${this.version}
        publicHostName : ${this.publicHostName}
        publicPort     : ${this.publicPort}
        ssl            : ${this.ssl}`;
    }

}
Horus.TABLE_NAME = 'HORUS';
Horus.TN = Horus.TABLE_NAME;
Horus.fields = {
    version: "version",
    ssl: "ssl",
    publicHostName: "publicHostName",
    publicPort: "publicPort"
}

/**
 * @name createTable
 * @description create the table for the entity from scratch
 * @param {*} knex the knex connection
 * @param {string} schema the schema name
 */
Horus.createTable = async function (knex, schema) {
    await knex.schema.withSchema(schema).createTable(Horus.TABLE_NAME, function (table) {
        //table.increments('sid').primary();
        table.integer(Horus.fields.version);
        table.string(Horus.fields.publicHostName, 512);
        table.integer(Horus.fields.publicPort);
        table.boolean(Horus.fields.ssl);
    });
    knex.withSchema(schema).table(Horus.TABLE_NAME).
        insert(
            {
                version: 1,
                publicHostName: process.env.SERVER_PUBLIC_DNS,
                publicPort: process.env.SERVER_PUBLIC_PORT,
                ssl: false //false by default, users must activate and provide valid certs (becareful with chrome 58 and ASN changes)
            }).then();
}

/**
 * @name update
 * @description update settings
 * @param {*} knex  the knex connection
 * @param {string} schema  the schema name
 * @param {Horus} setings the settings modifications
 */
Horus.update = async function (knex, schema, settings) {
    let modification = Object.assign({}, settings);
    await knex(Horus.TN).withSchema(schema)
        .update(modification).then();
}

module.exports = Horus;