// spotify-callback.component.ts

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatesService } from '../../services/dates.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-spotify-callback',
  template: `
    <div class="callback-container">
      <div *ngIf="loading" class="loading">
        <p>Conectando con Spotify...</p>
        <div class="spinner"></div>
      </div>
      <div *ngIf="error" class="error">
        <p>{{ error }}</p>
      </div>
    </div>
  `,
  styles: [`
    .callback-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      text-align: center;
    }
    .loading, .error {
      padding: 20px;
      border-radius: 8px;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .error {
      color: red;
    }
    .spinner {
      width: 40px;
      height: 40px;
      margin: 10px auto;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #1DB954;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class SpotifyCallbackComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private datesService: DatesService
  ) {}

  ngOnInit() {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const code = params['code'];
        const error = params['error'];

        if (error) {
          this.handleError('Error en la autorización de Spotify: ' + error);
          return;
        }

        if (code) {
          this.handleSpotifyCode(code);
        } else {
          this.handleError('No se recibió código de autorización');
        }
      });
  }

  private handleSpotifyCode(code: string) {
    this.datesService.getSpotifyToken(code)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Token de Spotify obtenido exitosamente');
          this.navigateBack();
        },
        error: (err) => {
          console.error('Error al obtener token de Spotify:', err);
          this.handleError('Error al conectar con Spotify');
        }
      });
  }

  private handleError(errorMessage: string) {
    this.loading = false;
    this.error = errorMessage;
    setTimeout(() => this.navigateBack(), 2000);
  }

  private navigateBack() {
    const originalUrl = localStorage.getItem('originalUrl');
    const currentUserId = localStorage.getItem('userId');
    const currentUserName = localStorage.getItem('userName');

    if (originalUrl) {
      window.location.href = originalUrl;
      localStorage.removeItem('originalUrl'); // Limpiar la URL guardada
    } else if (currentUserId && currentUserName) {
      // Si no hay URL original pero tenemos información del usuario
      this.router.navigate(['/citas'], {
        queryParams: {
          userId: currentUserId,
          userName: currentUserName
        }
      });
    } else {
      // Si no hay información, volver a citas sin parámetros
      this.router.navigate(['/citas']);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}