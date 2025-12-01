import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { HotToastService } from '@ngxpert/hot-toast';

@Component({
  selector: 'app-user-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './user-login.html',
  styleUrl: './user-login.scss',
})
export class UserLogin {

loginForm!: FormGroup;
toastservice=inject(HotToastService);

constructor(
    private fb: FormBuilder,        
    private authService: AuthService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.login(email, password).subscribe({
        next: (response:unknown) => {
          console.log('Login successful', response);
          this.router.navigate(['/']);
          this.toastservice.success('Login Successful!');
        },
        error: (error:unknown) => {
          console.error('Login failed', error);
        }
      });
    }
  }

  

}
