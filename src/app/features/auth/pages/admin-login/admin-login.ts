import { Component } from '@angular/core';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, ɵInternalFormsSharedModule } from '@angular/forms';
import { HotToastService } from '@ngxpert/hot-toast';

@Component({
  selector: 'app-admin-login',
  imports: [ReactiveFormsModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.scss',
})
export class AdminLogin {

  loginForm! :FormGroup; 

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private toastservice: HotToastService
  ){}


  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {

    if(this.loginForm.valid){
      const {email,password}=this.loginForm.value;
      this.authService.login(email,password).subscribe({
        next:(response:unknown)=>{
          this.toastservice.success('Admin Login Successful!');
          this.router.navigate(['/admin']);
        },
        error:(error:unknown)=>{
          this.toastservice.error('Login failed. Please try again.');
        }
      });
  }

  }

}




