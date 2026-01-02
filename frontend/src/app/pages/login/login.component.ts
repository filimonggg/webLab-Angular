import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AsyncPipe, DatePipe} from '@angular/common';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

import { AuthService } from '../../core/auth.service';

import { interval, map, startWith } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CardModule, ButtonModule, InputTextModule, PasswordModule, AsyncPipe, DatePipe],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent{
  login = '';
  password = '';
  loading = false;

  now$ = interval(8000).pipe(
    startWith(0),
    map(() => new Date())
  );

  constructor(
    private auth: AuthService,
    private router: Router,
    private toast: MessageService
  ) {}

  async submit() {
    if (!this.login.trim() || !this.password) {
      this.toast.add({ severity: 'warn', summary: 'Ошибка', detail: 'Введите логин и пароль' });
      return;
    }
    this.loading = true;
    try {
      await this.auth.login(this.login.trim(), this.password);
      await this.router.navigate(['/main']);
    } catch {
      this.toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Неверный логин/пароль' });
    } finally {
      this.loading = false;
    }
  }
}
