import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable()
export class TechniquesService {

    constructor(private http: HttpClient) { }

    /**
     * @name getAll
     * @description return all the techniques from database
     */
    getAll() {
        return this.http.get<any>(`${environment.apiUrl}/technique`)
            .pipe(map(technique => {
                return technique;
            }));
    }

}