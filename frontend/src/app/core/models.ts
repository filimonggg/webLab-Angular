export interface LoginRequest {
  login: string;
  password: string;
}

export interface UserResponse {
  id: number;
  login: string;
}

export interface PointRequest {
  x: number;
  y: number;
  r: number;
}

export interface PointResponse {
  id: number;
  x: number;
  y: number;
  r: number;
  inside: boolean;
  serverTime: string; 
  executionTime: number;
}
