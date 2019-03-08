var bcrypt = require('bcryptjs');

/**
 * Entity User
 */
class User {

    constructor(sid, username, email, hpassword, role, description) {
        this.sid = sid;
        this.username = username;
        this.email = email;
        this.hpassword = hpassword;
        this.role = role;
        this.description = description;
    }

    toString() {
        return `User -
        sid         : ${this.sid}
        username    : ${this.username}
        email       : ${this.email}
        role        : ${this.role}
        hpassword   : ${this.hpassword}
        description : ${this.description}`;
    }

}
User.TABLE_NAME = 'USERS';
User.TN = User.TABLE_NAME;
User.ROLES = {
    ADMIN: "ADMIN",
    USER: "USER"
}
User.fields = {
    sid: "sid",
    username: "username",
    hpassword: "hpassword",
    role: "role",
    description: "description",
    email: "email"
}

/**
 * @name createTable
 * @description create the table for the entity from scratch
 * @param {*} knex the knex connection
 * @param {string} schema the schema name
 */
User.createTable = async function (knex, schema) {
    //creating Users Table
    await knex.schema.withSchema(schema).createTable(User.TABLE_NAME, function (table) {
        table.increments(User.fields.sid).primary();
        table.string(User.fields.username, 20).unique();
        table.string(User.fields.hpassword, 255);
        table.string(User.fields.email, 255);
        table.string(User.fields.role, 20);
        table.string(User.fields.description, 255);
    });
    var hashedPassword = bcrypt.hashSync("horus", 8);
    knex.withSchema(schema).table(User.TABLE_NAME).insert(
        [
            { username: "admin", hpassword: hashedPassword, email: "default@admin.com", role: User.ROLES.ADMIN, description: "default system admin" },
            { username: "jas", hpassword: hashedPassword, email: "jose.amuedo@horus.com", role: User.ROLES.USER, description: "test user" },
            { username: "rcm", hpassword: hashedPassword, email: "raul.caballero@horus.com", role: User.ROLES.USER, description: "test user" },
        ]
    ).then();

}

/**
 * @name update
 * @description update an user
 * @param {*} knex  the knex connection
 * @param {string} schema  the schema name
 * @param {User} user the user modifications
 * @param {boolean} updatePassword flag to indicate if the password has been modificated
 * @param {boolean} isAdmin flag to indiciate if the modification is done by an admin
 */
User.update = async function (knex, schema, user, updatePassword, isAdmin) {
    if (updatePassword) {
        user.hpassword = bcrypt.hashSync(user.hpassword, 8);
    }

    let modification = {
        username: user.username,
        hpassword: user.hpassword,
        email: user.email,
        description: user.description
    };

    if (isAdmin) {
        //only admins can change a role
        modification.role = user.role;
    }

    await knex(User.TN).withSchema(schema)
        .where('sid', '=', user.sid)
        .update(modification).then();
}

/**
 * @name create
 * @description create a user
 * @param {*} knex  the knex connection
 * @param {string} schema  the schema name
 * @param {User} user the user data
 * @return {User} the user created
 */
User.create = async function (knex, schema, user) {
    user.hpassword = bcrypt.hashSync(user.hpassword, 8);
    if (user.sid) {
        user = Object.assign({}, user, { sid: undefined });
    }
    let dbuser = await knex.withSchema(schema).table(User.TABLE_NAME).insert(user).returning('*').then();
    return dbuser;
}

module.exports = User;