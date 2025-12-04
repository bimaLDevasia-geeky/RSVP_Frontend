import { Component, inject } from '@angular/core';
import { AuthService } from   '../../../../core/auth/services/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HotToastService } from '@ngxpert/hot-toast';


@Component({
  selector: 'app-user-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './user-register.html',
  styleUrl: './user-register.scss',
})

export class UserRegister {
  constructor(private authService: AuthService, private fb: FormBuilder,private router: Router,private toastservice: HotToastService) {}

  registerForm!: FormGroup;
  route=inject(ActivatedRoute)
  returnUrl: string | null = this.route.snapshot.queryParamMap.get('return');

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      const { name, email, password } = this.registerForm.value;
      this.authService.register(name, email, password).subscribe({
        next: (response) => {
          console.log('Registration successful', response);
          if (this.returnUrl) {
            this.router.navigate(['/login'], { queryParams: { return: this.returnUrl } });
          } else {
          this.router.navigate(['/login']);
          }
          this.toastservice.success('Registration successful! Please log in.');
        },
        error: (error) => {
          this.toastservice.error('Registration failed.');
        }
      });

      console.log('Registration form submitted', { name, email, password });
      
    }
  }
}
