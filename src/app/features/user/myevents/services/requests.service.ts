import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface AttendeeRequest {
  id: number;
  userId: number;
  eventId: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestedAt: Date;
  user?: {
    name: string;
    email: string;
  }
}

export interface AttendeeRequestsResponse {
  id: number;
  eventId: number;
  userId: number;
  requestedAt: Date;
  status: "Pending" | "Accepted" | "Rejected";
  userName: string;
}

@Injectable({
  providedIn: 'root'
})
export class RequestsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/externalrequest`;

  getEventRequests(eventId: number): Observable<AttendeeRequestsResponse[]> {
    return this.http.get<AttendeeRequestsResponse[]>(`${this.apiUrl}/event/${eventId}`);
  }

  approveRequest(requestId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${requestId}`, {status: 'Accepted'});
  }

  rejectRequest(requestId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${requestId}`, {status: 'Rejected'});
  }
}
