import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable()
export class ProfilesService {

    constructor(private http: HttpClient) { }

    /**
     * @name getAll
     * @description return all the profiles from database
     */
    getAll() {
        return this.http.get<any>(`${environment.apiUrl}/profile`)
            .pipe(map(profiles => {
                return profiles;
            }));
    }

}