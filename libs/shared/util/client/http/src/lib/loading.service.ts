import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private _loading = signal<boolean>(false);
  private requestCount = 0;

  readonly isLoading = this._loading.asReadonly();

  show() {
    this.requestCount++;
    this._loading.set(true);
  }

  hide() {
    this.requestCount--;
    if (this.requestCount <= 0) {
      this.requestCount = 0;
      this._loading.set(false);
    }
  }
}
