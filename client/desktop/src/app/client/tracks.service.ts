import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Track } from './datamodel/track';

@Injectable()
export class TracksService {

    constructor(private http: HttpClient) { }

    /**
     * @name getDetails
     * @description get the details certain track
     * @param {number} sid the sid to get
     */
    getDetails(sid) {
        return this.http.get<any>(`${environment.apiUrl}/track/${sid}/detail`)
            .pipe(map(details => {
                return details;
            }));
    }

    /**
     * @name getLastDetails
     * @description get the last details (after the lastCreation param) of certain track
     * @param {number} sid the track sid we want to locate details
     * @param {string} lastCreation the last creation track detail we have
     */
    getLastDetails(sid, lastCreation) {
        return this.http.get<any>(`${environment.apiUrl}/track/${sid}/detail/last/${lastCreation}`)
            .pipe(map(details => {
                return details;
            }));
    }

    /**
     * @name delete
     * @description delete a certain track from database
     * @param {number} sid the sid to remove
     */
    delete(sid) {
        return this.http.delete<any>(`${environment.apiUrl}/track/${sid}`)
            .pipe(map(track => {
                return track;
            }));
    }

    /**
     * @name update
     * @description update the track
     * @param {Track} tracki the track to update
     */
    update(tracki: Track) {
        return this.http.put<any>(`${environment.apiUrl}/track/${tracki.sid}`, tracki)
            .pipe(map(track => {
                return track;
            }));
    }

}