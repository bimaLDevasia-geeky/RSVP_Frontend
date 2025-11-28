import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { jwtValues } from '../../../shared/types/jwtDecode.type';
import { User } from '../../../shared/types/auth.types';
import { BehaviorSubject, catchError, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Token } from '@angular/compiler';
import { environment } from '../../../../environments/environment';



@Injectable({
  providedIn: 'root',
})


export class AuthService {

  private currentUser = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUser.asObservable();
  private refreshToken = new BehaviorSubject<string | null>(null);
  public refreshToken$ = this.refreshToken.asObservable();
  isRefreshing = false;
  
  constructor(private http: HttpClient) {
    this.currentUser.next(this.getCurrentUser() || null);
  }

  register(name:string,email: string, password: string) {
    return this.http.post<{ token: string }>(`${environment.apiUrl}/user`, { name, email, password });
  }
  
  public login(email: string, password: string) {
    return this.http.post<{ token: string }>(`${environment.apiUrl}/auth/login`, { email, password }, { withCredentials: true }).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        this.currentUser.next(this.getCurrentUser());
        this.refreshToken.next(null);
      }));
  }


  refresh(){
    return this.http.post<{token:string;}>(`${environment.apiUrl}/refresh`,{},{withCredentials:true}).pipe(
      tap(response=>{
        localStorage.setItem('token',response.token);
        this.currentUser.next(this.getCurrentUser() || null);
        this.refreshToken.next(response.token);
        this.isRefreshing = false;
      }),
      catchError(error=>{
        console.error('Error refreshing token:', error);
        this.currentUser.next(null);
        this.refreshToken.next(null);
        this.isRefreshing = false;
        throw error;
      }
    ));
    
  }

   public updateTokenStream(token: string | null) {
    this.refreshToken.next(token);
    }

  getCurrentUser(): User | null {
    let token = this.getAccessToken();
    if (!token) {
      return null;
    }
    
    try {
      const decoded = jwtDecode<jwtValues>(token);
      
      const user: User = {
        id: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
        email: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
        role: decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
      };
      
      return user;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }



  getAccessToken() {
    return localStorage.getItem('token');
  }

  logout(){
    localStorage.removeItem('token');
    this.currentUser.next(null);
    this.refreshToken.next(null);
    this.http.post(`${environment.apiUrl}/logout`,{},{withCredentials:true}).subscribe();
  }




  

}
