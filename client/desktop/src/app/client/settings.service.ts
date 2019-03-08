import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Settings } from './datamodel/settings';

@Injectable()
export class SettingsService {

    constructor(private http: HttpClient) { }

    /**
     * @name get
     * @description get settings of the application
     */
    get(): Observable<Settings> {
        return this.http.get<Settings>(`${environment.apiUrl}/settings`)
            .pipe(map(settings => {
                return settings;
            }));
    }


    /**
     * @name update
     * @description update the application settings from the database
     * @param {Settings} settings the application settings
     */
    update(settings: Settings) {
        return this.http.put<any>(`${environment.apiUrl}/settings`, settings)
            .pipe(map(settings => {
                return settings;
            }));
    }
}