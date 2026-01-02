import {
  Component, EventEmitter, Input, Output,
  AfterViewInit, OnChanges, SimpleChanges,
  ElementRef, ViewChild
} from '@angular/core';
import { PointResponse } from '../../core/models';

@Component({
  selector: 'app-graph',
  standalone: true,
  template: `<canvas #cv class="canvas" (click)="onClick($event)"></canvas>`,
  styles: [`
    .canvas {
      width: 100%;
      height: 360px;
      border: 1px solid #e6e6e6;
      border-radius: 12px;
      display: block;
      background: #fff;
    }
  `]
})
export class GraphComponent implements AfterViewInit, OnChanges {
  @Input() r = 2;
  @Input() points: PointResponse[] = [];
  @Output() pointClick = new EventEmitter<{ x: number; y: number }>();

  @ViewChild('cv', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private get canvas() { return this.canvasRef.nativeElement; }

  ngAfterViewInit(): void {
    this.redraw();
    window.addEventListener('resize', () => this.redraw());
  }

  ngOnChanges(ch: SimpleChanges): void {
    if (ch['r'] || ch['points']) this.redraw();
  }

  // === Проверка попадания точки (x,y) при текущем r ===
  private inArea(x: number, y: number, r: number): boolean {
    if (!r || Number.isNaN(r)) return false;

    if (x <= 0 && y >= 0) {
      const rr = r / 2;
      if (x * x + y * y <= rr * rr) return true;
    }

    if (x >= 0 && y >= 0) {
      if (x <= r / 2 && y <= (r - 2 * x)) return true;
    }

    if (x >= 0 && x <= r && y <= 0 && y >= -r / 2) return true;

    return false;
  }

  private redraw() {
    const canvas = this.canvas;
    const rect = canvas.getBoundingClientRect();
    const dpr = devicePixelRatio || 1;

    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);

    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const w = canvas.width, h = canvas.height;
    const cx = w / 2, cy = h / 2;

    const pad = 36 * dpr; 
    const radiusPx = Math.min(w, h) / 2 - pad; 

    // Нормированное преобразование:
    // u = x / r, v = y / r
    const toPxNorm = (u: number, v: number) => ({ px: cx + u * radiusPx, py: cy - v * radiusPx });
    const fromPxNorm = (px: number, py: number) => ({ u: (px - cx) / radiusPx, v: (cy - py) / radiusPx });

    // Сохраняем для клика: перевод из пикселей в (x,y) с учётом текущего r
    (this as any)._fromPx = (px: number, py: number) => {
      const { u, v } = fromPxNorm(px, py);
      return { x: u * this.r, y: v * this.r };
    };

    // Стили
    const axisColor = '#c7c7c7';
    const labelColor = '#9aa0a6';
    const areaColor = 'rgba(160, 200, 255, 0.35)';
    const tickColor = '#bdbdbd';
    const fontSize = 12 * dpr;

    // --- Оси ---
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 2 * dpr;
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(w, cy);
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, h);
    ctx.stroke();

    ctx.fillStyle = tickColor;
    const marks = [-1, -0.5, 0, 0.5, 1];

    for (const u of marks) {
      const p = toPxNorm(u, 0);
      ctx.beginPath();
      ctx.arc(p.px, p.py, 2.5 * dpr, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = labelColor;
      ctx.font = `${fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const val = (u * this.r);
      const text = this.formatMark(val);
      ctx.fillText(text, p.px, p.py + 6 * dpr);
      ctx.fillStyle = tickColor;
    }

    for (const v of marks) {
      const p = toPxNorm(0, v);
      ctx.beginPath();
      ctx.arc(p.px, p.py, 2.5 * dpr, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = labelColor;
      ctx.font = `${fontSize}px sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      const val = (v * this.r);
      const text = this.formatMark(val);
      ctx.fillText(text, p.px + 6 * dpr, p.py);
      ctx.fillStyle = tickColor;
    }

    ctx.fillStyle = areaColor;
    ctx.beginPath();
    const p0 = toPxNorm(0, 0);
    ctx.moveTo(p0.px, p0.py);
    ctx.arc(p0.px, p0.py, 0.5 * radiusPx, Math.PI, 1.5 * Math.PI, false);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    const a = toPxNorm(0, 0), b = toPxNorm(0, 1), c = toPxNorm(0.5, 0);
    ctx.moveTo(a.px, a.py);
    ctx.lineTo(b.px, b.py);
    ctx.lineTo(c.px, c.py);
    ctx.closePath();
    ctx.fill();

    const r1 = toPxNorm(0, 0);
    const r2 = toPxNorm(1, -0.5);
    ctx.fillRect(
      Math.min(r1.px, r2.px),
      Math.min(r1.py, r2.py),
      Math.abs(r2.px - r1.px),
      Math.abs(r2.py - r1.py)
    );

    for (const pt of this.points) {
      const u = pt.x / this.r;
      const v = pt.y / this.r;
      const p = toPxNorm(u, v);

      const inside = this.inArea(pt.x, pt.y, this.r);
      ctx.fillStyle = inside ? '#1b8f3a' : '#cc2f2f';

      ctx.beginPath();
      ctx.arc(p.px, p.py, 4 * dpr, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private formatMark(v: number): string {
    if (Math.abs(v) < 1e-12) return '0';
    const s = Number(v.toFixed(3)).toString();
    return s;
  }

  onClick(ev: MouseEvent) {
    if (this.r == null || Number.isNaN(this.r) || this.r === 0) {
      console.warn('R not selected or invalid');
      return;
    }

    const rect = this.canvas.getBoundingClientRect();
    const dpr = devicePixelRatio || 1;

    const px = (ev.clientX - rect.left) * dpr;
    const py = (ev.clientY - rect.top) * dpr;

    const fromPx = (this as any)._fromPx as
      ((px: number, py: number) => { x: number; y: number }) | undefined;
    if (!fromPx) return;

    const { x, y } = fromPx(px, py);

    this.pointClick.emit({
      x: Number(x.toFixed(5)),
      y: Number(y.toFixed(5))
    });
  }
}
