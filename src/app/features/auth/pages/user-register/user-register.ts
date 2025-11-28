import { Component } from '@angular/core';
import { Auth } from '../../../../core/auth/auth';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './user-register.html',
  styleUrl: './user-register.scss',
})

export class UserRegister {
  constructor(private authService: Auth, private fb: FormBuilder,private router: Router) {}

  registerForm!: FormGroup;

  

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
      // this.authService.register(name, email, password).subscribe({
      //   next: (response) => {
      //     console.log('Registration successful', response);
      //     this.router.navigate(['/login']);
      //   },
      //   error: (error) => {
      //     console.error('Registration failed', error);
      //   }
      // });

      console.log('Registration form submitted', { name, email, password });
      
    }
  }
}
