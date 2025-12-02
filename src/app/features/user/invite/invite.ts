import { Component, inject, OnInit, signal } from '@angular/core';
import { InviteService } from '../../../shared/services/invite.service';
import { Event } from '../../../shared/types/userData.types';
import { map, Observable } from 'rxjs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe, Location } from '@angular/common';
import { AuthService } from '../../../core/auth/services/auth.service';
import { HotToastService } from '@ngxpert/hot-toast';

@Component({
  selector: 'app-invite',
  imports: [DatePipe, RouterLink],
  templateUrl: './invite.html',
  styleUrl: './invite.scss',
})
export class Invite {

private inviteService = inject(InviteService);
private authService = inject(AuthService);
private route = inject(ActivatedRoute);
private location = inject(Location);
private router = inject(Router);
private toast = inject(HotToastService);

eventDetails: Event | null = null;

isLoggedIn = this.authService.isLoggedIn();
  
inviteCode = this.route.snapshot.paramMap.get('code') ?? '';

isRequestSent = signal(false);

goBack(): void {
  if (window.history.length > 1) {
    this.location.back();
  } else {
    this.router.navigate(['/']);
  }
}


request(): void {
  if (this.eventDetails) {
    this.inviteService.sendRequestToJoin(this.eventDetails.id)
      .subscribe({
        next: () => {
          this.toast.success('Request to join sent successfully!');
          this.isRequestSent.set(true);
        },
        error: (err) => {
          this.toast.error(err.error?.error || 'Failed to send request to join.');
          this.isRequestSent.set(true);
        }
      });
  }
}

ngOnInit(): void {

  if (this.inviteCode) {
    this.inviteService.getEventDetails(this.inviteCode)
      .pipe(    
        map((response: any) => response as Event)
      )
      .subscribe({
        next: (event) => {
          this.eventDetails = event;
          console.log(this.eventDetails);
          
        },
        error: (err) => {
          console.error('Error fetching event details:', err);
        }
      });
  }
}
}

