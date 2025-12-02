import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { Observable } from "rxjs";
import { InvitedEventDto } from "../types/event.type";

@Injectable({  
    providedIn: 'root'
})
export class InvitedEventsService { 

    constructor(private http: HttpClient) {}

    getInvitedEvents(): Observable<InvitedEventDto[]> {
        return this.http.get<InvitedEventDto[]>(`${environment.apiUrl}/event/invited`);
    }

    updateMyStatus(attendeeId: number, status: string): Observable<void> {
        return this.http.patch<void>(`${environment.apiUrl}/attendie/${attendeeId}`, { 
            status 
        });
    }
    getAttendieViaUserId(eventId: number, userId: number){
        return this.http.get<any>(`${environment.apiUrl}/attendie/user`,{params: {eventId: eventId, userId: userId}});
    } 
    
}