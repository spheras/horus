export class TrackInfo {
    public sid: number; //negative values for not registered yet at the server
    public group_sid: number;
    public group_name: string;
    public group_hpassword: string;
    public device_uid: string;
    public device_name: string;
    public track_creation: string;
    public track_info: string;
    public pictures: Picture[];
    public comments: string[];
}

export class Picture {
    public file: string;
    public comments: string;
}