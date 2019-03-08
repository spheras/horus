import { Injectable } from '@angular/core';
import { NativeStorage } from '@ionic-native/native-storage';
import { Group } from './group';
import { Platform } from 'ionic-angular';
import { TrackInfo } from './trackinfo';

@Injectable()
export class DAOService {
    static readonly GROUP_ITEM: string = "GROUP";
    static readonly PENDING_TRACK_ITEM: string = "PENDING_TRACK";
    static readonly PHONE_NUMBER: string = "PHONE_NUMBER";

    constructor(private nativeStorage: NativeStorage, private platform: Platform) {
    }

    /**
     * @name getGroup
     * @description return the promise to load the group from database
     * @returns {Promise<Group>} the group found or null if none
     */
    getGroup(): Promise<Group> {
        if (this.platform.is('cordova')) {
            return this.nativeStorage.getItem(DAOService.GROUP_ITEM);
        } else {
            return null;
        }
    }

    /**
     * @name saveGroup
     * @description save a group to the database
     * @param {Group} group the group to save
     */
    saveGroup(group: Group) {
        if (this.platform.is('cordova')) {
            this.nativeStorage.setItem(DAOService.GROUP_ITEM, group);
        }
    }

    /**
     * @name deleteGroup
     * @description remove the group info from database
     */
    deleteGroup() {
        if (this.platform.is('cordova')) {
            this.nativeStorage.setItem(DAOService.GROUP_ITEM, null);
        }
    }

    /**
     * @name getPhoneNumber
     * @description return the phone number saved at the database
     * @return the promise to return the phone number
     */
    getPhoneNumber(): Promise<string> {
        if (this.platform.is('cordova')) {
            return this.nativeStorage.getItem(DAOService.PHONE_NUMBER);
        }
        return null;
    }

    /**
     * @name savePhoneNumber
     * @description save the phone number associated with this devide
     * @param {string} phoneNumber the phone number to save
     */
    savePhoneNumber(phoneNumber: string) {
        if (this.platform.is('cordova')) {
            this.nativeStorage.setItem(DAOService.PHONE_NUMBER, phoneNumber);
        }
    }

    /**
     * @name getPendingTracks
     * @description return pending tracks saved temporally at the database
     * @return {Promise<TrackInfo>} the promise to return a track info list
     */
    getPendingTracks(): Promise<TrackInfo[]> {
        if (this.platform.is('cordova')) {
            return this.nativeStorage.getItem(DAOService.PENDING_TRACK_ITEM);
        }
        return Promise.resolve([]);
    }

    /**
     * @name savePendingTracks
     * @description save tracks that are pending to be sent to the server. Replace the old info!
     * @param {TrackInfo[]} tracks the list of tracks to be saved
     */
    savePendingTracks(tracks: TrackInfo[]) {
        if (this.platform.is('cordova')) {
            return this.nativeStorage.setItem(DAOService.PENDING_TRACK_ITEM, tracks);
        }
    }

}