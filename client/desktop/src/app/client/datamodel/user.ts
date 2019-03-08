export class User {
    constructor(sid: number, username: string, hpassword: string, email: string, description: string, role: string) {
        this.sid = sid;
        this.username = username;
        this.hpassword = hpassword;
        this.email = email;
        this.description = description;
        this.role = role;
    }

    public sid: number;
    public username: string;
    public hpassword: string;
    public email: string;
    public description: string;
    public role: string;
}