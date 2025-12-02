import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { CreateEventDto, UpdateEventDto, eventType, EventDetailDto, AddGuestDto, GuestDto, AttendeeResponseDto } from '../../../../shared/types/event.type';

@Injectable({
  providedIn: 'root'
})
export class MyeventsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/event`;

  createEvent(eventData: CreateEventDto, images: File[]): Observable<number> {
    const formData = new FormData();
    
    formData.append('name', eventData.name);
    formData.append('description', eventData.description);
    formData.append('date', eventData.date);
    formData.append('venue', eventData.venue);
    formData.append('time', eventData.time);
    formData.append('isPublic', eventData.isPublic.toString());
    
    // Append multiple images
    images.forEach((image) => {
      formData.append('images', image);
    });

    return this.http.post<number>(`${this.apiUrl}`, formData);
  }

  updateEvent(eventData: UpdateEventDto, newImages?: File[]): Observable<void> {
    const formData = new FormData();
    
    formData.append('eventId', eventData.eventId.toString());
    
    if (eventData.name) formData.append('name', eventData.name);
    if (eventData.description) formData.append('description', eventData.description);
    if (eventData.date) formData.append('date', eventData.date);
    if (eventData.venue) formData.append('venue', eventData.venue);
    if (eventData.time) formData.append('time', eventData.time);
    if (eventData.isPublic !== undefined) formData.append('isPublic', eventData.isPublic.toString());
    if (eventData.status) formData.append('status', eventData.status);
    
    // Append images to delete
    if (eventData.imagesToDelete && eventData.imagesToDelete.length > 0) {
      eventData.imagesToDelete.forEach((img, index) => {
        formData.append(`imagesToDelete[${index}].imageId`, img.imageId.toString());
        formData.append(`imagesToDelete[${index}].publicId`, img.publicId);
      });
    }
    
    // Append new images
    if (newImages && newImages.length > 0) {
      newImages.forEach((image) => {
        formData.append('newImages', image);
      });
    }

    return this.http.put<void>(`${this.apiUrl}/${eventData.eventId}`, formData);
  }

  getEventById(id: number): Observable<eventType> {
    return this.http.get<eventType>(`${this.apiUrl}/${id}`);
  }

  getEventDetail(id: number): Observable<EventDetailDto> {
    return this.http.get<EventDetailDto>(`${this.apiUrl}/${id}`);
  }

  getMyEvents(): Observable<eventType[]> {
    return this.http.get<eventType[]>(`${this.apiUrl}/my-events`);
  }

  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Guest Management
  searchGuests(eventId: number, searchTerm: string): Observable<GuestDto[]> {
    return this.http.get<GuestDto[]>(`${environment.apiUrl}/event/non-attendies/${eventId}`, {
      params: { term: searchTerm }
    });
  }

  addGuestToEvent(eventId: number, userId: number): Observable<AddGuestDto> {
    const dto: AddGuestDto = { eventId, userId };
    return this.http.post<AddGuestDto>(`${environment.apiUrl}/attendie`, dto);
  }

  removeGuestFromEvent(eventId: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${eventId}/guests/${userId}`);
  }

  getEventAttendees(eventId: number): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/attendie/filter`,{eventId: eventId} );
  }

  updateAttendeeStatus(eventId: number, attendeeId: number, status: string, role: string): Observable<void> {
    return this.http.patch<void>(`${environment.apiUrl}/attendie/${attendeeId}`, { 
      status,
      role
    });
  }

  sendEmailInvites(eventId: number, emails: string[]): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/attendie/bulk`, {
      eventId,
      attendieEmails: emails
    });
  }
}
