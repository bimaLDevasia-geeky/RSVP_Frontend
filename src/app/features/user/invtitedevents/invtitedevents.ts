import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { InvitedEventsService } from '../../../shared/services/invited-events.service';
import { InvitedEventDto } from '../../../shared/types/event.type';
import { finalize } from 'rxjs';
import { DatePipe, CommonModule } from '@angular/common';
import { TimeonlyPipe } from '../../../shared/pipes/timeonly-pipe';
import { HotToastService } from '@ngxpert/hot-toast';
import { Router } from '@angular/router';

@Component({
  selector: 'app-invtitedevents',
  imports: [DatePipe, TimeonlyPipe, CommonModule],
  templateUrl: './invtitedevents.html',
  styleUrl: './invtitedevents.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Invtitedevents {

  invitedEvents = signal<InvitedEventDto[]>([]);
  isLoading = signal(false);

  constructor(
    private invitedEventsService: InvitedEventsService,
    private toast: HotToastService,
    private router: Router
  ) {
    this.loadInvitedEvents();
  }

  loadInvitedEvents(): void {
    this.isLoading.set(true);
    this.invitedEventsService.getInvitedEvents().
    pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (response: InvitedEventDto[]) => {
        this.invitedEvents.set(response);
        console.log('Fetched invited events:', response);
      },
      error: (error: unknown) => {
        console.error('Error fetching invited events:', error);
        this.toast.error('Failed to load invited events');
      }
    });
  }

  viewEvent(eventId: number): void {
    this.router.navigate(['/invitedevents', eventId]);
  }

  copyInviteCode(code: string): void {
    navigator.clipboard.writeText(code).then(() => {
      this.toast.success('Invite code copied to clipboard!');
    });
  }
}