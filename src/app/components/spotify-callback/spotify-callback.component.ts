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
    private datesService: DatesService
  ) {}

  ngOnInit() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code && state) {
      try {
        const stateData = JSON.parse(state);
        
        this.datesService.getSpotifyToken(code).subscribe({
          next: (response) => {
            localStorage.setItem('spotify_token', response.access_token);
            if (response.refresh_token) {
              localStorage.setItem('spotify_refresh_token', response.refresh_token);
            }
            
            // Redirección directa a la página de citas
            window.location.href = this.datesService.BASE_URL + stateData.return_path;
          },
          error: (err) => {
            console.error('Error al obtener token:', err);
            window.location.href = this.datesService.BASE_URL + stateData.return_path;
          }
        });
      } catch (e) {
        console.error('Error al procesar callback:', e);
        window.location.href = this.datesService.BASE_URL + '/citas';
      }
    } else {
      window.location.href = this.datesService.BASE_URL + '/citas';
    }
  }
}