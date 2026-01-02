import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { LoginRequest, UserResponse } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly base = '/api/auth';
  private _user$ = new BehaviorSubject<UserResponse | null>(null);
  user$ = this._user$.asObservable();

  constructor(private http: HttpClient) {}

  get user(): UserResponse | null {
    return this._user$.value;
  }

  async login(login: string, password: string): Promise<UserResponse> {
    const body: LoginRequest = { login, password };
    const u = await firstValueFrom(this.http.post<UserResponse>(`${this.base}/login`, body, {
      withCredentials: true
    }));
    this._user$.next(u);
    return u;
  }

  async logout(): Promise<void> {
    await firstValueFrom(this.http.post(`${this.base}/logout`, {}, { withCredentials: true }));
    this._user$.next(null);
  }

  async refreshMe(): Promise<void> {
    try {
      const u = await firstValueFrom(this.http.get<UserResponse>(`${this.base}/me`, {
        withCredentials: true
      }));
      this._user$.next(u);
    } catch {
      this._user$.next(null);
    }
  }
}
