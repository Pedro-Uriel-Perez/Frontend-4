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
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');

    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const code = params['code'];
        
        if (!code) {
          this.redirectToCitas(userId, userName);
          return;
        }

        this.datesService.getSpotifyToken(code).subscribe({
          next: (response) => {
            localStorage.setItem('spotify_token', response.access_token);
            if (response.refresh_token) {
              localStorage.setItem('spotify_refresh_token', response.refresh_token);
            }
            this.redirectToCitas(userId, userName);
          },
          error: (err) => {
            console.error('Error al obtener token:', err);
            this.redirectToCitas(userId, userName);
          }
        });
      });
  }

  private redirectToCitas(userId: string | null, userName: string | null) {
    if (userId && userName) {
      // Primero construye la URL completa
      const baseUrl = 'https://citasmedicas4.netlify.app';
      const path = `/citas/${encodeURIComponent(userId)}/${encodeURIComponent(userName)}`;
      const fullUrl = baseUrl + path;
      
      // Luego redirige
      window.location.replace(fullUrl);
    } else {
      window.location.replace('https://citasmedicas4.netlify.app/citas');
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}