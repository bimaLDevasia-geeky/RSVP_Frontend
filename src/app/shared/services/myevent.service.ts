import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { eventType } from "../types/event.type";



@Injectable({  
    providedIn: 'root'
})

export class MyEventService {

    constructor(private http:HttpClient) {}

    getMyEvents():Observable<eventType[]> {
    return this.http.get<eventType[]>(`${environment.apiUrl}/event/my-events`);
  }

}