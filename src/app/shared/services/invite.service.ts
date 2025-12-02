import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class InviteService {
  

  constructor(private http: HttpClient) {}


  getEventDetails(inviteCode: string) {
    return this.http.get(`${environment.apiUrl}/Invite/get-event/${inviteCode}`);
  }


  sendRequestToJoin(eventId: number) {
    return this.http.post(`${environment.apiUrl}/ExternalRequest`, {"eventId": eventId}, { withCredentials: true });
  }

}
