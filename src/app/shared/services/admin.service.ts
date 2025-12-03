import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  
    constructor(private http: HttpClient) {}


  getUsers() {
    return this.http.get<any[]>(`${environment.apiUrl}/User`, { withCredentials: true });
    
  }

  updateUserStatus(userId: number,status:string) {
    return this.http.patch(`${environment.apiUrl}/User/${userId}`,{status: status} , { withCredentials: true });
  }

  getAllEvents(){
    return this.http.get<any[]>(`${environment.apiUrl}/Event`,{withCredentials:true});
  }


  updateEventStatus(eventId:number,status:string){
    return this.http.patch(`${environment.apiUrl}/Event/update-status/${eventId}`,{status: status},{withCredentials:true});
  }
  
}
