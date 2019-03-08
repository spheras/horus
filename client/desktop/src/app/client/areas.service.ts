import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable()
export class AreasService {

    constructor(private http: HttpClient) { }

    /**
     * @name delete
     * @description delete a certain area from database
     * @param {number} sid the sid to remove
     */
    delete(sid) {
        return this.http.delete<any>(`${environment.apiUrl}/area/${sid}`)
            .pipe(map(area => {
                return area;
            }));
    }

}