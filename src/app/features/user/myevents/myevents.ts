import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { finalize, Observable } from 'rxjs';
import { MyEventService } from '../../../shared/services/myevent.service';
import { eventType } from '../../../shared/types/event.type';
import { DatePipe } from '@angular/common';
import { TimeonlyPipe } from '../../../shared/pipes/timeonly-pipe';

@Component({
  selector: 'app-myevents',
  imports: [DatePipe, TimeonlyPipe],
  templateUrl: './myevents.html',
  styleUrl: './myevents.scss',
})
export class Myevents {

  myeventservice = inject(MyEventService);
  private events= signal<eventType[]>([]);
  public readEvents= this.events.asReadonly();
  isLoading= signal(false);
  
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
}
