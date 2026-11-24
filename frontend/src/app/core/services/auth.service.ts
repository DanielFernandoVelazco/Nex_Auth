import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

export interface AuthUser {
    id: string;
    email: string;
    name: string;
}

interface LoginResponse {
    access_token: string;
    refresh_token: string;
    user: AuthUser;
}

interface RefreshResponse {
    access_token: string;
    refresh_token: string;
}

const ACCESS_TOKEN_KEY = 'nexauth_access_token';
const REFRESH_TOKEN_KEY = 'nexauth_refresh_token';
const USER_KEY = 'nexauth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly http = inject(HttpClient);
    private readonly router = inject(Router);

    private readonly _user = signal<AuthUser | null>(this.loadUser());
    private readonly _loading = signal(false);

    readonly user = this._user.asReadonly();
    readonly isAuthenticated = computed(() => this._user() !== null);
    readonly loading = this._loading.asReadonly();

    async login(email: string, password: string): Promise<boolean> {
        this._loading.set(true);
        try {
            const res = await firstValueFrom(
                this.http.post<LoginResponse>('/api/auth/login', { email, password })
            );
            this.persistSession(res);
            this._user.set(res.user);
            return true;
        } catch (err) {
            console.error('[Auth] Login failed:', err);
            return false;
        } finally {
            this._loading.set(false);
        }
    }

    async refresh(): Promise<boolean> {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        if (!refreshToken) return false;

        try {
            const res = await firstValueFrom(
                this.http.post<RefreshResponse>('/api/auth/refresh', {
                    refresh_token: refreshToken,
                })
            );
            localStorage.setItem(ACCESS_TOKEN_KEY, res.access_token);
            localStorage.setItem(REFRESH_TOKEN_KEY, res.refresh_token);
            return true;
        } catch {
            this.logout();
            return false;
        }
    }

    logout(): void {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        this._user.set(null);
        this.router.navigate(['/auth/login']);
    }

    getAccessToken(): string | null {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    }

    private persistSession(res: LoginResponse): void {
        localStorage.setItem(ACCESS_TOKEN_KEY, res.access_token);
        localStorage.setItem(REFRESH_TOKEN_KEY, res.refresh_token);
        localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    }

    private loadUser(): AuthUser | null {
        const raw = localStorage.getItem(USER_KEY);
        if (!raw) return null;
        try {
            return JSON.parse(raw) as AuthUser;
        } catch {
            return null;
        }
    }
}