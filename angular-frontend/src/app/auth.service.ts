import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SignupRequest {
  fullName: string;
  name?: string;
  email: string;
  password: string;
  mobile: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = '/api/auth';

  constructor(private http: HttpClient) {}

  signup(request: SignupRequest): Observable<string> {
    return this.http.post(`${this.apiUrl}/signup`, request, { responseType: 'text' as const });
  }

  login(request: LoginRequest): Observable<string> {
    return this.http.post(`${this.apiUrl}/login`, request, { responseType: 'text' as const });
  }

  checkSuccess(): Observable<string> {
    return this.http.get(`${this.apiUrl}/success`, { responseType: 'text' as const });
  }
}
