import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatesService } from '../../services/dates.service';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-spotify-callback',
  template: `
    <div class="callback-container">
      <div *ngIf="loading" class="loading">
        <p>Procesando autenticación de Spotify...</p>
        <div class="spinner"></div>
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
export class SpotifyCallbackComponent implements OnInit {
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private datesService: DatesService
  ) {}

  ngOnInit() {
    this.route.queryParams.pipe(take(1)).subscribe(params => {
      const code = params['code'];
      const state = params['state'];

      if (!code) {
        this.handleRedirect();
        return;
      }

      try {
        const stateData = JSON.parse(state);
        const userId = stateData.userId;
        const userName = stateData.userName;

        this.datesService.getSpotifyToken(code).subscribe({
          next: (response) => {
            localStorage.setItem('spotify_token', response.access_token);
            if (response.refresh_token) {
              localStorage.setItem('spotify_refresh_token', response.refresh_token);
            }
            
            // Redirigir directamente a la ruta específica
            this.redirectToUserPage(userId, userName);
          },
          error: (err) => {
            console.error('Error al obtener token:', err);
            this.redirectToUserPage(userId, userName);
          }
        });
      } catch (e) {
        console.error('Error processing callback:', e);
        this.handleRedirect();
      }
    });
  }

  private redirectToUserPage(userId: string, userName: string) {
    // Construir la URL completa y redirigir
    const url = `/citas/${userId}/${userName}`;
    window.location.href = `https://citasmedicas4.netlify.app${url}`;
  }

  private handleRedirect() {
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    
    if (userId && userName) {
      this.redirectToUserPage(userId, userName);
    } else {
      window.location.href = 'https://citasmedicas4.netlify.app/citas';
    }
  }

  ngOnDestroy() {
        // Cleanup si es necesario

  }
}