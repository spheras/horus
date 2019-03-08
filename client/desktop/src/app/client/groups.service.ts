import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable()
export class GroupsService {

    constructor(private http: HttpClient) { }

    /**
     * @name delete
     * @description delete a certain group from database
     * @param {number} sid the sid to remove
     */
    delete(sid) {
        return this.http.delete<any>(`${environment.apiUrl}/group/${sid}`)
            .pipe(map(group => {
                return group;
            }));
    }

    /**
     * @name get
     * @description get a certain group info
     * @param {number} sid the sid to get
     */
    get(sid) {
        return this.http.get<any>(`${environment.apiUrl}/group/${sid}`)
            .pipe(map(group => {
                return group;
            }));
    }

    /**
     * @name getTracks
     * @description obtain tracks from a certain group
     * @param {number} sid the sid group
     */
    getTracks(sid) {
        return this.http.get<any>(`${environment.apiUrl}/group/${sid}/track`)
            .pipe(map(tracks => {
                return tracks;
            }));
    }

}