import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatesService } from '../../services/dates.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-spotify-callback',
  template: `
    <div class="callback-container">
      <p>Procesando autenticación de Spotify...</p>
    </div>
  `,
  styles: [`
    .callback-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }
    .loading {
      text-align: center;
    }
    .spinner {
      width: 40px;
      height: 40px;
      margin: 20px auto;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
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
        
        this.datesService.getSpotifyToken(code).subscribe({
          next: (response) => {
            localStorage.setItem('spotify_token', response.access_token);
            if (response.refresh_token) {
              localStorage.setItem('spotify_refresh_token', response.refresh_token);
            }
            this.handleRedirect(stateData.userId, stateData.userName);
          },
          error: (err) => {
            console.error('Error al obtener token:', err);
            this.handleRedirect(stateData.userId, stateData.userName);
          }
        });
      } catch (e) {
        console.error('Error processing callback:', e);
        this.handleRedirect();
      }
    });
  }

  private handleRedirect(userId?: string, userName?: string) {
    if (userId && userName) {
      // Usar window.location.href para una redirección completa
      window.location.href = `https://citasmedicas4.netlify.app/citas/${userId}/${userName}`;
    } else {
      window.location.href = 'https://citasmedicas4.netlify.app/citas';
    }
  }
}
