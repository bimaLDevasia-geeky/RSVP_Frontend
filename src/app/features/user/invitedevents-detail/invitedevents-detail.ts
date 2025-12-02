import { Component, OnInit, signal, inject, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvitedEventsService } from '../../../shared/services/invited-events.service';
import { InvitedEventDto } from '../../../shared/types/event.type';
import { HotToastService } from '@ngxpert/hot-toast';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TimeonlyPipe } from '../../../shared/pipes/timeonly-pipe';

@Component({
  selector: 'app-invitedevents-detail',
  imports: [CommonModule, FormsModule,TimeonlyPipe],
  templateUrl: './invitedevents-detail.html',
  styleUrl: './invitedevents-detail.scss'
})
export class InvitedeventsDetailComponent implements OnInit {
  private invitedEventsService = inject(InvitedEventsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(HotToastService);
  private destroyRef = inject(DestroyRef);

  event = signal<InvitedEventDto | null>(null);
  selectedImageIndex = signal(0);
  editingStatus = signal(false);
  selectedStatus = signal<'Attending' | 'Maybe' | 'NotAttending'>('Attending');
  isUpdatingStatus = signal(false);

  ngOnInit() {
    const eventId = this.route.snapshot.paramMap.get('id');
    if (eventId) {
      this.loadEventDetail(Number(eventId));
    }
  }

  loadEventDetail(eventId: number) {
    this.invitedEventsService.getInvitedEvents()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (events) => {
          const event = events.find((e: InvitedEventDto) => e.id === eventId);
          if (event) {
            this.event.set(event);
            this.selectedStatus.set(this.getCurrentStatus());
          } else {
            this.toast.error('Event not found');
            this.router.navigate(['/user/invitedevents']);
          }
        },
        error: () => {
          this.toast.error('Failed to load event details');
          this.router.navigate(['/user/invitedevents']);
        }
      });
  }

  selectImage(index: number) {
    this.selectedImageIndex.set(index);
  }

  getSelectedImageIndex(): number {
    return this.selectedImageIndex();
  }

  getCurrentStatus(): 'Attending' | 'Maybe' | 'NotAttending' {
    const event = this.event();
    if (!event || event.status === 'NoResponse') return 'Attending';
    return event.status;
  }

  startEditingStatus() {
    this.selectedStatus.set(this.getCurrentStatus());
    this.editingStatus.set(true);
  }

  cancelEditingStatus() {
    this.editingStatus.set(false);
  }

  updateMyStatus() {
    const event = this.event();
    if (!event) return;

    this.isUpdatingStatus.set(true);
    this.invitedEventsService.updateMyStatus(event.id, this.selectedStatus())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toast.success('Status updated successfully');
          this.editingStatus.set(false);
          this.loadEventDetail(event.id);
        },
        error: () => {
          this.toast.error('Failed to update status');
        },
        complete: () => {
          this.isUpdatingStatus.set(false);
        }
      });
  }

  copyInviteCode(code: string) {
    navigator.clipboard.writeText(code);
    this.toast.success('Invite code copied!');
  }

  goBack() {
    this.router.navigate(['/user/invitedevents']);
  }
}
