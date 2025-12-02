import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MyeventsService } from '../../services/myevents.service';
import { RequestsService, AttendeeRequest } from '../../services/requests.service';
import { EventDetailDto, Attendee, GuestDto } from '../../../../../shared/types/event.type';
import { HotToastService } from '@ngxpert/hot-toast';
import { debounceTime, Subject, switchMap, of, take, takeUntil } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { TimeonlyPipe } from '../../../../../shared/pipes/timeonly-pipe';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
  private requestsService = inject(RequestsService);
  private toast = inject(HotToastService);

  eventDetail = signal<EventDetailDto | null>(null);
  attendees = signal<Attendee[]>([]);
  isLoading = signal(true);
  ref = inject(DestroyRef);
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
  
  // Attendee Status Edit
  editingAttendeeId = signal<number | null>(null);
  selectedStatus = signal<'Attending' | 'Maybe' | 'NotAttending' | 'NoResponse'>('NoResponse');
  selectedRole = signal<'Guest' | 'Organizer'>('Guest');
  isUpdatingStatus = signal(false);
  
  // Email Invites for Private Events
  showEmailInvite = signal(false);
  emailInviteText = signal('');
  isSendingEmailInvites = signal(false);
  
  // Attendee Requests
  showRequestsModal = signal(false);
  pendingRequests = signal<AttendeeRequest[]>([]);
  isLoadingRequests = signal(false);
  processingRequestId = signal<number | null>(null);
  requestsCount = signal(0);
  
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
      this.loadAttendees(+eventId);
      this.loadRequests(+eventId);
    }
    
    // Setup search with debounce and switchMap
    this.searchSubject.pipe(
      takeUntilDestroyed(this.ref),
      debounceTime(500),
      switchMap(term => {
        if (term.length < 2) {
          this.searchResults.set([]);
          this.isSearching.set(false);
          return of([]);
        }
        this.isSearching.set(true);
        const eventId = this.eventDetail()?.id;
        if (!eventId) {
          this.isSearching.set(false);
          return of([]);
        }
        return this.myeventsService.searchGuests(eventId, term);
      })
    ).subscribe({
      next: (results) => {
        this.searchResults.set(results);
        this.isSearching.set(false);
      },
      error: (error) => {
        console.error('Search error:', error);
        this.searchResults.set([]);
        this.isSearching.set(false);
      }
    });
  }

  loadEventDetail(eventId: number): void {
    this.isLoading.set(true);
    this.myeventsService.getEventDetail(eventId).subscribe({
      next: (detail) => {
        this.eventDetail.set(detail);
        console.log('Event detail loaded:', detail);
        console.log('Media array:', detail.media);
        
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading event:', error);
        this.toast.error('Failed to load event details');
        this.isLoading.set(false);
      }
    });
  }
  loadAttendees(eventId: number): void {
    this.myeventsService.getEventAttendees(eventId).subscribe({
      next: (response) => {
        this.attendees.set(response.attendies);
        console.log('Attendees loaded:', response.attendies);
      },
      error: (error) => {
        console.error('Error loading attendees:', error);
        this.toast.error('Failed to load attendees');
      }
    });
  }

  searchGuests(): void {
    const term = this.searchTerm();
    this.searchSubject.next(term);
  }

  addGuest(id: number): void {
    const eventId = this.eventDetail()?.id;
    if (!eventId) return;

    this.addingGuestId.set(id);
    this.myeventsService.addGuestToEvent(eventId, id).subscribe({
      next: () => {
        this.toast.success('Guest added successfully');
        this.loadEventDetail(eventId);
        this.loadAttendees(eventId);
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
          this.loadAttendees(eventId);
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

  startEditingStatus(attendeeId: number, currentStatus: 'Attending' | 'Maybe' | 'NotAttending' | 'NoResponse', currentRole: 'Guest' | 'Organizer'): void {
    this.editingAttendeeId.set(attendeeId);
    this.selectedStatus.set(currentStatus);
    this.selectedRole.set(currentRole);
  }

  cancelEditingStatus(): void {
    this.editingAttendeeId.set(null);
  }

  updateAttendeeStatus(attendeeId: number): void {
    const eventId = this.eventDetail()?.id;
    if (!eventId) return;

    this.isUpdatingStatus.set(true);
    const newStatus = this.selectedStatus();
    const newRole = this.selectedRole();

    this.myeventsService.updateAttendeeStatus(eventId, attendeeId, newStatus, newRole).subscribe({
      next: () => {
        this.toast.success('Status updated successfully');
        this.loadAttendees(eventId);
        this.editingAttendeeId.set(null);
        this.isUpdatingStatus.set(false);
      },
      error: (err: any) => {
        console.error('Error updating status:', err);
        this.toast.error('Failed to update status');
        this.isUpdatingStatus.set(false);
      }
    });
  }

  sendEmailInvites(): void {
    const eventId = this.eventDetail()?.id;
    if (!eventId) return;

    const emailText = this.emailInviteText().trim();
    if (!emailText) {
      this.toast.error('Please enter at least one email address');
      return;
    }

    // Split by comma, trim whitespace, and filter empty strings
    const emails = emailText
      .split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0);

    if (emails.length === 0) {
      this.toast.error('Please enter valid email addresses');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = emails.filter(email => !emailRegex.test(email));
    
    if (invalidEmails.length > 0) {
      this.toast.error(`Invalid email(s): ${invalidEmails.join(', ')}`);
      return;
    }

    this.isSendingEmailInvites.set(true);
    this.myeventsService.sendEmailInvites(eventId, emails).subscribe({
      next: () => {
        this.toast.success(`Invites sent to ${emails.length} email(s)`);
        this.emailInviteText.set('');
        this.showEmailInvite.set(false);
        this.loadAttendees(eventId);
        this.isSendingEmailInvites.set(false);
      },
      error: (err: any) => {
        console.error('Error sending email invites:', err);
        this.toast.error('Failed to send email invites');
        this.isSendingEmailInvites.set(false);
      }
    });
  }

  loadRequests(eventId: number): void {
    this.requestsService.getEventRequests(eventId).subscribe({
      next: (response) => {
        const requests = response?.requests || [];
        this.pendingRequests.set(requests.filter(r => r.status === 'Pending'));
        this.requestsCount.set(requests.filter(r => r.status === 'Pending').length);
        console.log('Requests loaded:', requests);
      },
      error: (err: any) => {
        console.error('Error loading requests:', err);
        this.pendingRequests.set([]);
        this.requestsCount.set(0);
      }
    });
  }

  openRequestsModal(): void {
    this.showRequestsModal.set(true);
    const eventId = this.eventDetail()?.id;
    if (eventId) {
      this.isLoadingRequests.set(true);
      this.requestsService.getEventRequests(eventId).subscribe({
        next: (response) => {
          const requests = response?.requests || [];
          this.pendingRequests.set(requests.filter(r => r.status === 'Pending'));
          this.isLoadingRequests.set(false);
        },
        error: (err: any) => {
          console.error('Error loading requests:', err);
          this.toast.error('Failed to load requests');
          this.pendingRequests.set([]);
          this.isLoadingRequests.set(false);
        }
      });
    }
  }

  closeRequestsModal(): void {
    this.showRequestsModal.set(false);
  }

  approveRequest(requestId: number): void {
    const eventId = this.eventDetail()?.id;
    if (!eventId) return;

    this.processingRequestId.set(requestId);
    this.requestsService.approveRequest(requestId).subscribe({
      next: () => {
        this.toast.success('Request approved');
        this.loadRequests(eventId);
        this.loadAttendees(eventId);
        this.processingRequestId.set(null);
      },
      error: (err: any) => {
        console.error('Error approving request:', err);
        this.toast.error('Failed to approve request');
        this.processingRequestId.set(null);
      }
    });
  }

  rejectRequest(requestId: number): void {
    const eventId = this.eventDetail()?.id;
    if (!eventId) return;

    this.processingRequestId.set(requestId);
    this.requestsService.rejectRequest(requestId).subscribe({
      next: () => {
        this.toast.success('Request rejected');
        this.loadRequests(eventId);
        this.processingRequestId.set(null);
      },
      error: (err: any) => {
        console.error('Error rejecting request:', err);
        this.toast.error('Failed to reject request');
        this.processingRequestId.set(null);
      }
    });
  }
}
