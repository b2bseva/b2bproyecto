
import type React from 'react';

export interface Service {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  category: string;
  price: number;
  priceType: 'por hora' | 'por proyecto';
  providerId: string;
  providerName: string;
  providerLogoUrl: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  createdAt: string;
  status: 'active' | 'inactive';
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface Faq {
  question: string;
  answer: string;
}

export type UserRole = 'client' | 'provider' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyName: string;
}

export interface Reservation {
    id: string;
    serviceId: string;
    serviceTitle: string;
    date: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

export interface ChartDataPoint {
    name: string; // e.g., 'Jan', 'Feb'
    value: number;
}

// Interfaces para autenticación
export interface SignUpData {
    email: string;
    password: string;
    nombre_persona: string;
    nombre_empresa: string;
}

export interface SignUpResponse {
    message: string;
    user_id?: string;
}

export interface TokenResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface AuthError {
    detail: string;
    status_code: number;
}