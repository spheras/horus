import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Group } from './datamodel/group';
import { GroupArea } from './datamodel/group-area';
import { Area } from './datamodel/area';
import { Search } from './datamodel/search';

@Injectable()
export class SearchesService {

    constructor(private http: HttpClient) { }

    /**
     * @name getAll
     * @description return all the searches from the database
     */
    get(sid: number) {
        return this.http.get<any>(`${environment.apiUrl}/search/${sid}`)
            .pipe(map(search => {
                return search;
            }));
    }


    /**
     * @name getAll
     * @description return all the searches from the database
     */
    getAll() {
        return this.http.get<any>(`${environment.apiUrl}/search`)
            .pipe(map(search => {
                return search;
            }));
    }

    /**
     * @name delete
     * @description delete a certain search from database
     * @param {number} sid the sid to remove
     */
    delete(sid) {
        return this.http.delete<any>(`${environment.apiUrl}/search/${sid}`)
            .pipe(map(search => {
                return search;
            }));
    }

    /**
     * @name create
     * @description create a new search at the database
     * @param {Search} search the search to create
     */
    create(search: Search, groups: Group[], areas: Area[], links: GroupArea[]) {
        let body = {
            search: search,
            groups: groups,
            areas: areas,
            links: links
        }
        return this.http.post<any>(`${environment.apiUrl}/search`, body)
            .pipe(map(search => {
                return search;
            }));
    }

    /**
     * @name update
     * @description update a certain search from the database
     * @param {Search} search the search info to be updated
     */
    update(search: Search, groups: Group[], areas: Area[], links: GroupArea[]) {
        let body = {
            search: search,
            groups: groups,
            areas: areas,
            links: links
        }
        return this.http.put<any>(`${environment.apiUrl}/search/${search.sid}`, body)
            .pipe(map(search => {
                return search;
            }));
    }

    /**
     * @name updateZone
     * @param {Search} search the search to update
     * @param {any} zone the geojson zone object
     */
    updateZone(search: Search, zone: any) {
        return this.http.put<any>(`${environment.apiUrl}/search/${search.sid}/zone`, zone)
            .pipe(map(search => {
                return search;
            }));
    }

    /**
     * @name getGroups
     * @description return all the groups from the database for a certain search
     */
    getGroups(searchSid: number) {
        return this.http.get<any>(`${environment.apiUrl}/search/${searchSid}/group`)
            .pipe(map(groups => {
                return groups;
            }));
    }

    /**
     * @name getArea
     * @description return all the areas from the database for a certain search
     */
    getAreas(searchSid: number) {
        return this.http.get<any>(`${environment.apiUrl}/search/${searchSid}/area`)
            .pipe(map(areas => {
                return areas;
            }));
    }

    /**
     * @name getLinks
     * @description return all the links (groups-areas) from the database for a certain search
     */
    getLinks(searchSid: number) {
        return this.http.get<any>(`${environment.apiUrl}/search/${searchSid}/grouparea`)
            .pipe(map(areas => {
                return areas;
            }));
    }
}