import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { UserData } from '../types/userData.types';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  

  constructor(private http: HttpClient) {}


  getUserData(id: number): Observable<UserData>{
    return this.http.get<UserData>(`${environment.apiUrl}/user/${id}`,{withCredentials:true});
  }

  updateInvitationStatus(attendieId:number,responseStatus:string):Observable<any>{
    return this.http.patch(`${environment.apiUrl}/attendie/${attendieId}`,{status: responseStatus},{withCredentials:true});
  }



}
