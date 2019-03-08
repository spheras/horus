import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { BaseLayer } from './datamodel/baselayer';
import { Observable } from 'rxjs';

@Injectable()
export class BaseLayerService {

    constructor(private http: HttpClient) { }

    /**
     * @name getAll
     * @description return all the base layers from the database
     */
    getAll(): Observable<BaseLayer[]> {
        return this.http.get<BaseLayer[]>(`${environment.apiUrl}/baselayer`)
            .pipe(map(baselayer => {
                return baselayer;
            }));
    }


    /**
     * @name create
     * @description create a new base layer at the database
     * @param {BaseLayer} baselayer the base layer to create
     */
    create(baselayer) {
        return this.http.post<any>(`${environment.apiUrl}/baselayer`, baselayer)
            .pipe(map(baselayer => {
                return baselayer;
            }));
    }

    /**
     * @name update
     * @description update a certain base layer from the database
     * @param {BaseLayer} baselayer the baselayer info to be updated
     */
    update(baselayer) {
        return this.http.put<any>(`${environment.apiUrl}/baselayer/${baselayer.sid}`, baselayer)
            .pipe(map(baselayer => {
                return baselayer;
            }));
    }

    /**
     * @name delete
     * @description delete a certain base layer from database
     * @param {number} sid the sid to remove
     */
    delete(sid) {
        return this.http.delete<any>(`${environment.apiUrl}/baselayer/${sid}`);
    }
}