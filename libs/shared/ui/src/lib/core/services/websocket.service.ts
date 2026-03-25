// app/core/services/websocket.service.ts

import { Injectable, OnDestroy, inject } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs'; // Importa Subject
import { APP_CONFIG } from '@virteex/shared-config';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService implements OnDestroy {
  private config = inject(APP_CONFIG);
  private socket: Socket | null = null;
  // Subject para notificar cuando la conexión está establecida
  private connectionReady = new Subject<void>();
  public connectionReady$ = this.connectionReady.asObservable();

  constructor() {}

  connect(): void {
    if (this.socket?.connected) {
      return;
    }

    const baseUrl = this.config.apiUrl.split('/api')[0];

    this.socket = io(baseUrl, {
      withCredentials: true,
    });

    this.socket.on('connect', () => {
      // Notificar a los suscriptores que la conexión está lista
      this.connectionReady.next();
    });

    this.socket.on('disconnect', (reason) => { /* Handle disconnect */ });
    this.socket.on('connect_error', (err) => console.error('WebSocket connection error:', err.message));
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  listen<T>(eventName: string): Observable<T> {
    return new Observable(observer => {
      if (!this.socket) {
        return;
      }
      this.socket.on(eventName, (data: T) => {
        observer.next(data);
      });

      return () => {
        this.socket?.off(eventName);
      };
    });
  }

  emit(eventName: string, data: any): void {
    if (this.socket) {
      this.socket.emit(eventName, data);
    }
  }

  ngOnDestroy() {
    this.disconnect();
  }
}
