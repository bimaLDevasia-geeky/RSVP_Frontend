import { Component, computed, signal } from '@angular/core';
import { HomeService } from '../../../shared/services/home.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/services/auth.service';
import { UserData } from '../../../shared/types/userData.types';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [RouterLink, DatePipe],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  userData = signal<UserData | null>(null);
  
  currentUser: number;

  userName = computed(() => {
    const data = this.userData();
    return data ? data.name.split(' ')[0] : 'user';
  });

  notifications = computed(() => {
    const data = this.userData();
    if (!data || !data.notifications) return [];

    return [...data.notifications].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  });

  createdEvents = computed(() => {
    const data = this.userData();
    if (!data || !data.createdEvents) return [];

    return [...data.createdEvents].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  });

  invitedEvents = computed(() => {
    const data = this.userData();
    if (!data || !data.invitedEvents) return [];
    return [...data.invitedEvents]
  });

organizedEvents = computed(() => {
    const data = this.userData();
    if (!data || !data.organizedEvents) return [];
    return [...data.organizedEvents].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  });

  constructor(private homeService: HomeService, private authService: AuthService) {
    this.currentUser = this.authService.getCurrentUser()?.id || 0;
  }


  updateInvitationStatus(attendieId:number,responseStatus:string): void {
    this.homeService.updateInvitationStatus(attendieId,responseStatus).subscribe({
      next: () => {
        this.ngOnInit();
      },
      error: (error) => {
        console.error('Error updating invitation status:', error);
      }
    });
  }

  ngOnInit(): void {
    if (!this.currentUser) return;

    this.homeService.getUserData(this.currentUser).subscribe({
      next: (data: UserData) => {
        this.userData.set(data);
        
      },
      error: (error) => {
        console.error('Error retrieving user data:', error);
      },
    });
  }
}
