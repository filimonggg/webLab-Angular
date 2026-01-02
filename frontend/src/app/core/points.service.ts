import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { PointRequest, PointResponse } from './models';

@Injectable({ providedIn: 'root' })
export class PointsService {
  private readonly base = '/api/points';

  constructor(private http: HttpClient) {}

  list(): Promise<PointResponse[]> {
    return firstValueFrom(this.http.get<PointResponse[]>(this.base, { withCredentials: true }));
  }

  add(req: PointRequest): Promise<PointResponse> {
    return firstValueFrom(this.http.post<PointResponse>(this.base, req, { withCredentials: true }));
  }

  clear(): Promise<void> {
    return firstValueFrom(this.http.delete<void>(this.base, { withCredentials: true }));
  }
}
