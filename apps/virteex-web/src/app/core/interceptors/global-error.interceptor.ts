import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastController } from '@ionic/angular';

export const globalErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastController = inject(ToastController);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unknown error occurred!';
      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Server-side error
        if (error.status === 401) {
            errorMessage = 'Unauthorized access. Please login again.';
        } else if (error.status === 403) {
            errorMessage = 'You do not have permission to access this resource.';
        } else {
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        }
      }

      // Show toast
      toastController.create({
        message: errorMessage,
        duration: 3000,
        position: 'bottom',
        color: 'danger'
      }).then(toast => toast.present());

      return throwError(() => error);
    })
  );
};
