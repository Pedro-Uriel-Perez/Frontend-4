import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatesService } from '../../services/dates.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-spotify-callback',
  template: `
    <div class="callback-container">
      <div *ngIf="loading" class="loading">
        <p>Conectando con Spotify...</p>
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
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private datesService: DatesService
  ) {}

  ngOnInit() {
    // Extraer código y estado de los query params
    this.route.queryParams.pipe(take(1)).subscribe(params => {
      const code = params['code'];
      const state = params['state'];

      if (!code) {
        console.error('No se recibió código de Spotify');
        this.navigateToHome();
        return;
      }

      try {
        // Parsear el estado
        const stateData = JSON.parse(state);
        const { userId, userName } = stateData;

        // Obtener el token
        this.datesService.getSpotifyToken(code).subscribe({
          next: (response) => {
            // Guardar tokens
            localStorage.setItem('spotify_token', response.access_token);
            if (response.refresh_token) {
              localStorage.setItem('spotify_refresh_token', response.refresh_token);
            }

            // Navegar usando Router en lugar de window.location
            this.navigateToUserPage(userId, userName);
          },
          error: (err) => {
            console.error('Error al obtener token:', err);
            this.navigateToUserPage(userId, userName);
          }
        });
      } catch (e) {
        console.error('Error al procesar callback:', e);
        this.navigateToHome();
      }
    });
  }

  private navigateToUserPage(userId: string, userName: string) {
    // Usar Router.navigate en lugar de window.location
    this.router.navigate(['/citas', userId, userName])
      .catch(err => {
        console.error('Error en navegación:', err);
        this.navigateToHome();
      });
  }

  private navigateToHome() {
    this.router.navigate(['/']);
  }
}