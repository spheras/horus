import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';
import { Sim } from '@ionic-native/sim';
import { TrackInfo } from '../dao/trackinfo';
import { DAOService } from '../dao/dao.service';
import { Group } from '../dao/group';
import { FileTransfer, FileTransferObject, FileUploadOptions } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';
import { UniqueDeviceID } from '@ionic-native/unique-device-id';

@Injectable()
export class ClientService {

    private phoneNumber: string = "";
    private phoneUID: string = "";
    private lastTrackInfo: TrackInfo = null;
    private fileTransfer: FileTransferObject;

    constructor(private transfer: FileTransfer, private file: File,
        private sim: Sim, private http: Http,
        private daoservice: DAOService,
        private uniqueDeviceID: UniqueDeviceID) {

        this.fileTransfer = this.transfer.create();

        this.uniqueDeviceID.get()
            .then((uuid: any) => this.phoneUID = uuid)
            .catch((error: any) => console.log(error));
    }

    /**
     * @name reset
     * @description reset the last track info saved
     */
    public reset() {
        this.lastTrackInfo = null;
    }

    /**
     * @name setPhoneNumber
     * @description set the phone number of the device (this info will be sent to the server)
     * @param {string} phoneNumber the phone number to set
     */
    public setPhoneNumber(phoneNumber: string) {
        this.phoneNumber = phoneNumber;
    }

    /**
     * @name postComment
     * @description sned a comment to the server associated with a certain trackdetail sent previously
     * @param apiurl the api url to sent the comment, configured by the qr code
     * @param {string} group the group for which we are working now
     * @param {string} comment comments for the picture
     */
    public async postComment(apiurl: string, group: Group, comment: string) {
        let pendingTracks = [];
        try {
            pendingTracks = await this.daoservice.getPendingTracks();
        } catch (error) {
            //no pendings?
        }

        if (pendingTracks.length == 0) {
            if (this.lastTrackInfo != null) {
                //we add this to the pending comments
                this.lastTrackInfo.comments.push(comment);
                pendingTracks.push(this.lastTrackInfo);
            } else {
                console.log("WARN! we need at least a first track info");
            }
        } else {
            pendingTracks[pendingTracks.length - 1].comments.push(comment);
        }

        await this.daoservice.savePendingTracks(pendingTracks);
        await this.postServerData(apiurl, group);
    }

    /**
     * @name postPicture
     * @description send a picture to the server associated with a certain trackdetail sent previously
     * @param {string} apiurl the api url to sent the picture, configured by the qr code
     * @param {string} group the group for which we are working now
     * @param {string} pictureFile the path to obtain the picture
     * @param {string} comments comments for the picture
     */
    public async postPicture(apiurl: string, group: Group, pictureFile: string, comments: string) {
        let pendingTracks = [];
        try {
            pendingTracks = await this.daoservice.getPendingTracks();
        } catch (error) {
            //no pendings?
        }

        if (pendingTracks.length == 0) {
            if (this.lastTrackInfo != null) {
                //we add this to the pending pictures
                this.lastTrackInfo.pictures.push({ file: pictureFile, comments: comments });
                pendingTracks.push(this.lastTrackInfo);
            } else {
                console.log("WARN! we need at least a first track info");
            }
        } else {
            pendingTracks[pendingTracks.length - 1].pictures.push({ file: pictureFile, comments: comments });
        }

        await this.daoservice.savePendingTracks(pendingTracks);
        await this.postServerData(apiurl, group);
    }

    /**
     * @name postServerData
     * @description post a track info to the server (and pending)
     * @param {string} apiurl the api url
     * @param {Group} group the group info
     * @param {string} trackinfo (optional) the trackinfo to be post
     */
    public async postServerData(apiurl: string, group: Group, trackinfo?: string) {
        console.log("posting to server");

        let newTrackInfo: TrackInfo = null;
        if (trackinfo && trackinfo != null) {
            console.log("creating track");
            newTrackInfo = new TrackInfo();
            newTrackInfo.group_sid = group.sid;
            newTrackInfo.group_name = group.name;
            newTrackInfo.group_hpassword = group.hpassword;
            newTrackInfo.device_uid = this.phoneUID;
            newTrackInfo.device_name = this.phoneNumber;
            newTrackInfo.track_creation = new Date().toISOString();
            newTrackInfo.track_info = trackinfo;
            newTrackInfo.sid = -1;
            newTrackInfo.pictures = [];
            newTrackInfo.comments = [];
        }

        let self = this;
        let pendingTracks: TrackInfo[] = [];
        try {
            pendingTracks = await this.daoservice.getPendingTracks();
            console.log("pending tracks:" + pendingTracks.length);
        } catch (error) {
            console.log("error obtaining pending tracks!");
            //no pendings?
        }

        if (trackinfo && trackinfo != null) {
            pendingTracks.push(newTrackInfo);
            if (pendingTracks.length > 1) {
                newTrackInfo.sid = pendingTracks[pendingTracks.length - 2].sid - 1;
            }
        }

        for (let i = 0; i < pendingTracks.length; i++) {
            let iTrackInfo = pendingTracks[i];

            //removing bad (old maybe) info to send
            if (iTrackInfo.group_hpassword !== group.hpassword) {
                //this trackinfo is not for the group!
                console.log("trackinfo stored not for the group!")
                pendingTracks.splice(0, 1);
                i--;
                continue;
            }

            if (iTrackInfo.sid < 0) {
                console.log("lets manage the new/pending track");
                try {
                    let headers = new Headers({ 'content-type': 'application/json' });
                    let options = new RequestOptions({ headers: headers });
                    let url = apiurl;
                    let body: string = JSON.stringify(iTrackInfo);


                    let response = await self.http.post(url, body, options).toPromise();
                    //setting the real trackdetail sid generated by the database
                    iTrackInfo.sid = response.json().sid;
                    this.lastTrackInfo = iTrackInfo;
                    console.log("trackinfo saved at the server");

                    if (iTrackInfo.pictures.length > 0 || iTrackInfo.comments.length > 0) {
                        //it seems we have some pictures or comments to send too
                        //pictures and comments will be sent the last
                        //but, by the moment we don't remove the trackinfo
                    } else {
                        //one less to send
                        pendingTracks.splice(i, 1);
                        i--;
                    }
                } catch (error) {
                    //error produced, saving pending data and sending later
                    console.log("error posting track info:" + error);
                    self.daoservice.savePendingTracks(pendingTracks);
                    return;
                }
            } else {
                console.log("previously sent track!");
                //the trackinfo was sent previously, 
                //if it is in the pending list, then it has some pictures/comments pending to be sent,
                //this will be done the last, lets continue
            }
        }

        console.log("sneding track info finished");

        console.log("lets send now pending pictures. pending:"+pendingTracks.length);
        //lets try to process pending images for those NOT PENDING tracks (positive sid)
        for (let i = 0; i < pendingTracks.length; i++) {
            let iTrackInfo = pendingTracks[i];
            console.log("processing track sid:"+iTrackInfo.sid);
            if (iTrackInfo.sid > 0) {
                if (this.lastTrackInfo && this.lastTrackInfo != null &&
                    this.lastTrackInfo.sid == iTrackInfo.sid) {
                    this.lastTrackInfo = iTrackInfo;
                }
                console.log("sid positive!" + iTrackInfo.pictures.length);
                //this is a real trackinfo already inserted at the database
                //lets process its pictures
                for (let p = 0; p < iTrackInfo.pictures.length; p++) {
                    let picture = iTrackInfo.pictures[p];
                    console.log("a picture!");

                    let options: FileUploadOptions = {
                        fileKey: 'photo',
                        fileName: 'photo',
                        params: { group_hpassword: iTrackInfo.group_hpassword, comments: picture.comments }
                    }
                    let desturl = apiurl + `detail/${iTrackInfo.sid}/photo`;
                    console.log("vamos a subir:" + desturl)
                    try {
                        await this.fileTransfer.upload(picture.file, desturl, options, true);
                        // success, one less picture to send
                        iTrackInfo.pictures.splice(p, 1);
                        p--;
                        console.log("sucess sending picture!");
                    } catch (err) {
                        console.log("error:: " + err.exception);
                        // error

                    }
                }

                if (iTrackInfo.pictures.length == 0 && iTrackInfo.comments.length == 0) {
                    console.log("no more pictures to send for this trackinfo... removing");
                    //we finished with this track info, lets remove it
                    pendingTracks.splice(i, 1);
                    i--;
                }
                console.log("track info pictures:" + iTrackInfo.pictures.length);
            }
        }


        console.log("lets send now pending comments. pending:"+pendingTracks.length);
        //lets try to process pending comments for those NOT PENDING tracks (positive sid)
        for (let i = 0; i < pendingTracks.length; i++) {
            let iTrackInfo = pendingTracks[i];
            console.log("processing track sid:"+iTrackInfo.sid);
            if (iTrackInfo.sid > 0) {
                if (this.lastTrackInfo && this.lastTrackInfo != null &&
                    this.lastTrackInfo.sid == iTrackInfo.sid) {
                    this.lastTrackInfo = iTrackInfo;
                }
                console.log("sid positive!" + iTrackInfo.comments.length);
                //this is a real trackinfo already inserted at the database
                //lets process its comments
                for (let p = 0; p < iTrackInfo.comments.length; p++) {
                    let comment = iTrackInfo.comments[p];
                    console.log("a comment!");

                    let desturl = apiurl + `detail/${iTrackInfo.sid}/comment`;
                    console.log("vamos a subir:" + desturl)
                    try {
                        let headers = new Headers({ 'content-type': 'application/json' });
                        let options = new RequestOptions({ headers: headers });
                        let body: string = JSON.stringify(
                            {
                                group_hpassword: iTrackInfo.group_hpassword,
                                comment: comment
                            }
                        );
                        await self.http.post(desturl, body, options).toPromise();
                        // success, one less picture to send
                        iTrackInfo.comments.splice(p, 1);
                        p--;
                        console.log("sucess sending comment!");
                    } catch (err) {
                        console.log("error:: " + err.exception);
                        // error

                    }
                }

                if (iTrackInfo.pictures.length == 0 && iTrackInfo.comments.length == 0) {
                    console.log("no more comments to send for this trackinfo... removing");
                    //we finished with this track info, lets remove it
                    pendingTracks.splice(i, 1);
                    i--;
                }
                console.log("track info comments:" + iTrackInfo.comments.length);
            }
        }
        console.log("saving pending tracks:" + pendingTracks.length);
        self.daoservice.savePendingTracks(pendingTracks);
    }

}