export class Settings {

    constructor(version: string, publicHostName: string, publicPort: number, ssl: boolean) {
        this.version = version;
        this.publicHostName = publicHostName;
        this.publicPort = publicPort;
        this.ssl = ssl;
    }

    public version: string;
    public publicHostName: string;
    public publicPort: number;
    public ssl: boolean;
}