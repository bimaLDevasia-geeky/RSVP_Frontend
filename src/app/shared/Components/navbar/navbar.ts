import { Component, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/auth/services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  options = [
    { label: 'Dashboard', path: '/' },
    { label: 'My Events', path: '/myevents' },
    { label: 'Invited Events', path: '/user/invited-events' }
  ];

  isUserMenuOpen = signal(false);

  constructor(private router: Router,private authService: AuthService) {}

  toggleUserMenu(): void {
    this.isUserMenuOpen.set(!this.isUserMenuOpen());
  }

  logout(): void {
    this.isUserMenuOpen.set(false);
    this.authService.logout();
    window.location.reload();

  }
}
