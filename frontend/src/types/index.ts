export interface User {
  id: string;
  username: string;
  role: 'ADMIN' | 'SURVIVOR' | 'NIKITA';
  createdAt: string;
  updatedAt: string;
}

export interface Round {
  id: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'SCHEDULED';
  points?: number;
}

export interface LoginResponse {
  access_token: string;
  user: User;
} 