import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, from } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const auth = inject(AuthService);

    // No añadir token a login/refresh
    const isAuthEndpoint = req.url.includes('/auth/login') || req.url.includes('/auth/refresh');
    const token = auth.getAccessToken();

    const authReq = (!isAuthEndpoint && token)
        ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
        : req;

    return next(authReq).pipe(
        catchError((err: HttpErrorResponse) => {
            // Si 401 y no es login/refresh → intentar refresh token
            if (err.status === 401 && !isAuthEndpoint) {
                return from(auth.refresh()).pipe(
                    switchMap((refreshed) => {
                        if (!refreshed) return throwError(() => err);

                        const newToken = auth.getAccessToken();
                        const retryReq = req.clone({
                            setHeaders: { Authorization: `Bearer ${newToken}` },
                        });
                        return next(retryReq);
                    })
                );
            }
            return throwError(() => err);
        })
    );
};