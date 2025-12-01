import { Component, signal } from '@angular/core';
import { HomeService } from '../../../shared/services/home.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/auth/services/auth.service';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {

  userData = signal<any>({});

  currentUser: number;

  notifications: unknown[] = [];



  constructor(private homeService: HomeService,private authService: AuthService) {
    this.currentUser = this.authService.getCurrentUser()?.id || 0;
  }




  ngOnInit(): void {
    this.homeService.getUserData(this.currentUser).subscribe({
      next: (data) => {
        this.userData.set(data);
      },
      error: (error) => {
        console.error('Error retrieving user data:', error);
      }
    });

    this.notifications= this.userData().notifications || [];

    console.log(this.notifications);
    
  }

}
