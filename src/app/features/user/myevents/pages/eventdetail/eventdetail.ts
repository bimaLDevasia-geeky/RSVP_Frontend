import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MyeventsService } from '../../services/myevents.service';
import { EventDetailDto, AttendeeDto, GuestDto } from '../../../../../shared/types/event.type';
import { HotToastService } from '@ngxpert/hot-toast';
import { debounceTime, Subject } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { TimeonlyPipe } from '../../../../../shared/pipes/timeonly-pipe';

@Component({
  selector: 'app-eventdetail',
  imports: [CommonModule, FormsModule,TimeonlyPipe],
  templateUrl: './eventdetail.html',
  styleUrl: './eventdetail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Eventdetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private myeventsService = inject(MyeventsService);
  private toast = inject(HotToastService);

  eventDetail = signal<EventDetailDto | null>(null);
  attendees = signal<AttendeeDto[]>([]);
  isLoading = signal(true);
  
  // Image Gallery
  selectedImageIndex = signal(0);
  
  // Attendee Filter
  statusFilter = signal<'All' | 'Attending' | 'Maybe' | 'NotAttending' | 'NoResponse'>('All');
  
  filteredAttendees = computed(() => {
    const filter = this.statusFilter();
    if (filter === 'All') {
      return this.attendees();
    }
    return this.attendees()?.filter(a => a.status === filter) ?? [];
  });
  
  // Guest Management
  showGuestSearch = signal(false);
  searchTerm = signal('');
  searchResults = signal<GuestDto[]>([]);
  isSearching = signal(false);
  addingGuestId = signal<number | null>(null);
  
  // Search debounce
  private searchSubject = new Subject<string>();
  
  // Computed invite URL
  inviteUrl = computed(() => {
    const code = this.eventDetail()?.inviteCode;
    return code ? `${environment.frontendUrl}/invite/${code}` : '';
  });

  // Computed
  attendingCount = computed(() => 
    this.attendees()?.filter(a => a.status === 'Attending').length ?? 0
  );
  maybeCount = computed(() => 
    this.attendees()?.filter(a => a.status === 'Maybe').length ?? 0
  );
  notAttendingCount = computed(() => 
    this.attendees()?.filter(a => a.status === 'NotAttending').length ?? 0
  );
  noResponseCount = computed(() => 
    this.attendees()?.filter(a => a.status === 'NoResponse').length ?? 0
  );

  ngOnInit(): void {
    const eventId = this.route.snapshot.paramMap.get('id');
    if (eventId) {
      this.loadEventDetail(+eventId);
    }
    
    // Setup search debounce
    this.searchSubject.pipe(
      debounceTime(500)
    ).subscribe(term => {
      this.performSearch(term);
    });
  }

  loadEventDetail(eventId: number): void {
    this.isLoading.set(true);
    this.myeventsService.getEventDetail(eventId).subscribe({
      next: (detail) => {
        this.eventDetail.set(detail);
        console.log('Event detail loaded:', detail);
        console.log('Media array:', detail.media);
        this.attendees.set(detail.attendies);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading event:', error);
        this.toast.error('Failed to load event details');
        this.isLoading.set(false);
      }
    });
  }

  searchGuests(): void {
    const term = this.searchTerm();
    if (term.length < 2) {
      this.searchResults.set([]);
      return;
    }
    this.searchSubject.next(term);
  }
  
  performSearch(term: string): void {
    if (term.length < 2) {
      this.searchResults.set([]);
      return;
    }

    this.isSearching.set(true);
    this.myeventsService.searchGuests(term).subscribe({
      next: (results) => {
        this.searchResults.set(results);
        this.isSearching.set(false);
      },
      error: (error) => {
        console.error('Search error:', error);
        this.isSearching.set(false);
      }
    });
  }

  addGuest(id: number): void {
    const eventId = this.eventDetail()?.id;
    if (!eventId) return;

    this.addingGuestId.set(id);
    this.myeventsService.addGuestToEvent(eventId, id).subscribe({
      next: () => {
        this.toast.success('Guest added successfully');
        this.loadEventDetail(eventId);
        // Remove the added guest from search results
        const currentResults = this.searchResults();
        this.searchResults.set(currentResults.filter(g => g.id !== id));
        this.addingGuestId.set(null);
      },
      error: (error) => {
        console.error('Error adding guest:', error);
        this.toast.error('Failed to add guest');
        this.addingGuestId.set(null);
      }
    });
  }

  isAddingGuest(id: number): boolean {
    return this.addingGuestId() === id;
  }

  removeGuest(guestId: number): void {
    const eventId = this.eventDetail()?.id;
    if (!eventId) return;

    if (confirm('Are you sure you want to remove this guest?')) {
      this.myeventsService.removeGuestFromEvent(eventId, guestId).subscribe({
        next: () => {
          this.toast.success('Guest removed successfully');
          this.loadEventDetail(eventId);
        },
        error: (error) => {
          console.error('Error removing guest:', error);
          this.toast.error('Failed to remove guest');
        }
      });
    }
  }

  selectImage(index: number): void {
    this.selectedImageIndex.set(index);
  }
  
  setStatusFilter(status: 'All' | 'Attending' | 'Maybe' | 'NotAttending' | 'NoResponse'): void {
    this.statusFilter.set(status);
  }
  
  viewAttendee(attendeeId: number): void {
    const eventId = this.eventDetail()?.id;
    if (eventId) {
      this.router.navigate(['/attendee/event', eventId], {
        queryParams: { attendeeId }
      });
    }
  }
  
  copyInviteCode(): void {
    const code = this.eventDetail()?.inviteCode;
    if (code) {
      navigator.clipboard.writeText(code).then(() => {
        this.toast.success('Invite code copied to clipboard!');
      });
    }
  }
  
  copyInviteUrl(): void {
    const url = this.inviteUrl();
    if (url) {
      navigator.clipboard.writeText(url).then(() => {
        this.toast.success('Invite link copied to clipboard!');
      });
    }
  }

  editEvent(): void {
    const eventId = this.eventDetail()?.id;
    if (eventId) {
      this.router.navigate(['/myevents/edit', eventId]);
    }
  }

  goBack(): void {
    this.router.navigate(['/myevents']);
  }
}
