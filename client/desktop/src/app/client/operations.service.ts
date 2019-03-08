import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable()
export class OperationsService {

    constructor(private http: HttpClient) { }

    /**
     * @name getAll
     * @description return all the operations from database
     */
    getAll() {
        return this.http.get<any>(`${environment.apiUrl}/operation`)
            .pipe(map(operation => {
                return operation;
            }));
    }

}