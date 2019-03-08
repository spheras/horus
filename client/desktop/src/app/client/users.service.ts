import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable()
export class UserService {

    constructor(private http: HttpClient) { }

    /**
     * @name getAll
     * @description return all the users from the database
     */
    getAll() {
        return this.http.get<any>(`${environment.apiUrl}/user`)
            .pipe(map(user => {
                return user;
            }));
    }

    /**
     * @name delete
     * @description delete a certain user from database
     * @param {number} sid the sid to remove
     */
    delete(sid) {
        return this.http.delete<any>(`${environment.apiUrl}/user/${sid}`);
    }

    /**
     * @name create
     * @description create a new user at the database
     * @param {User} user the user to create
     */
    create(user) {
        return this.http.post<any>(`${environment.apiUrl}/user`, user)
            .pipe(map(user => {
                return user;
            }));
    }

    /**
     * @name update
     * @description update a certain user from the database
     * @param {User} user the user info to be updated
     */
    update(user) {
        return this.http.put<any>(`${environment.apiUrl}/user/${user.sid}`, user)
            .pipe(map(user => {
                return user;
            }));
    }
}