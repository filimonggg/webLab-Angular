import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MessageService } from 'primeng/api';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { SliderModule } from 'primeng/slider';
import { DividerModule } from 'primeng/divider';
import { SelectModule } from 'primeng/select';

import { AuthService } from '../../core/auth.service';
import { PointsService } from '../../core/points.service';
import { PointResponse } from '../../core/models';
import { GraphComponent } from './graph.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    FormsModule,
    DatePipe,
    ButtonModule,
    TableModule,
    SliderModule,
    DividerModule,
    SelectModule,
    GraphComponent,
  ],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
})
export class MainComponent implements OnInit {
  xOptions = Array.from({ length: 9 }, (_, i) => i - 5).map(v => ({ label: String(v), value: v }));
  rOptions = [1, 2, 3, 4, 5].map(v => ({ label: String(v), value: v }));

  x = 0;
  y = 0;
  r = 2;

  points: PointResponse[] = [];
  loading = false;

  constructor(
    public auth: AuthService,
    private pointsApi: PointsService,
    private router: Router,
    private toast: MessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    void this.reload();
  }

  private setLoading(value: boolean) {
    queueMicrotask(() => {
      this.loading = value;
      this.cdr.markForCheck();
    });
  }

  private setPoints(value: PointResponse[]) {
    queueMicrotask(() => {
      this.points = value;
      this.cdr.markForCheck();
    });
  }

  async reload() {
    this.setLoading(true);

    try {
      const data = await this.pointsApi.list();
      this.setPoints(data);
    } catch (e) {
      this.toast.add({
        severity: 'error',
        summary: 'Ошибка',
        detail: 'Не удалось загрузить точки (возможно, сессия истекла)',
      });
      await this.router.navigate(['/login']);
    } finally {
      this.setLoading(false);
    }
  }

  validate(): string | null {
    if (this.y < -3 || this.y > 5) return 'Y должен быть в диапазоне [-3; 5]';
    if (!(this.r > 0)) return 'R должен быть > 0';
    if (!Number.isInteger(this.x)) return 'X должен быть целым';
    return null;
  }

  async submit(
  skipValidate = false,
  payload?: { x: number; y: number; r: number }
    ) {
    if (!skipValidate) {
      const err = this.validate();
      if (err) {
        this.toast.add({ severity: 'warn', summary: 'Проверка', detail: err });
        return;
      }
    }

    const x = payload?.x ?? this.x;
    const y = payload?.y ?? this.y;
    const r = payload?.r ?? this.r;

    try {
      this.setLoading(true);
      const p = await this.pointsApi.add({ x, y, r });
      this.setPoints([p, ...this.points]);
    } catch {
      this.toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось отправить точку' });
    } finally {
      this.setLoading(false);
    }
  }

  async clear() {
    try {
      this.setLoading(true);
      await this.pointsApi.clear();
      this.setPoints([]);
    } catch {
      this.toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось очистить' });
    } finally {
      this.setLoading(false);
    }
  }

  async logout() {
    try {
      await this.auth.logout();
    } finally {
      await this.router.navigate(['/login']);
    }
  }

  async addFromGraph(x: number, y: number) {
    if (this.r == null || Number.isNaN(this.r) || this.r === 0) {
      this.toast.add({ severity: 'warn', summary: 'Проверка', detail: 'Выберите R' });
      return;
    }
    await this.submit(true, { x, y, r: this.r });
  }
}
