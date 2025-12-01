import { Component, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { MyEventService } from '../../../shared/services/myevent.service';
import { eventType } from '../../../shared/types/event.type';
import { DatePipe } from '@angular/common';
import { TimeonlyPipe } from '../../../shared/pipes/timeonly-pipe';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faEdit } from '@fortawesome/free-solid-svg-icons';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-myevents',
  imports: [DatePipe, TimeonlyPipe, FontAwesomeModule, RouterLink],
  templateUrl: './myevents.html',
  styleUrl: './myevents.scss',
})
export class Myevents {
  private myeventservice = inject(MyEventService);
  private router = inject(Router);

  private events = signal<eventType[]>([]);
  public readEvents = this.events.asReadonly();
  isLoading = signal(false);

  faplus = faPlus;
  faedit = faEdit;

  constructor() {
    this.getMyEvents();
  }

  getMyEvents(): void {
    this.isLoading.set(true);

    this.myeventservice.getMyEvents().pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (response: eventType[]) => {
        this.events.set(response);
        console.log('Fetched events:', response);
      },
      error: (error: unknown) => {
        console.error('Error fetching events:', error);
      }
    });
  }

  viewEvent(eventId: number): void {
    this.router.navigate(['/myevents', eventId]);
  }

  editEvent(event: Event, eventId: number): void {
    event.stopPropagation();
    this.router.navigate(['/myevents/edit', eventId]);
  }

 
  

}
