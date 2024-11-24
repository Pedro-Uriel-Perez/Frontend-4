import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatesService } from '../../services/dates.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-spotify-callback',
  template: `
    <div class="center">
      <p>Procesando autenticación de Spotify...</p>
    </div>
  `,
  styles: [`
    .center {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }
  `]
})
export class SpotifyCallbackComponent implements OnInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private datesService: DatesService
  ) {}

  ngOnInit() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (code && state) {
      try {
        const stateData = JSON.parse(state);
        
        this.datesService.getSpotifyToken(code).subscribe({
          next: (response) => {
            // Guardar tokens
            localStorage.setItem('spotify_token', response.access_token);
            if (response.refresh_token) {
              localStorage.setItem('spotify_refresh_token', response.refresh_token);
            }

            // Redirección utilizando los datos del state
            if (stateData.userId && stateData.userName) {
              const url = `/citas/${stateData.userId}/${stateData.userName}`;
              this.router.navigateByUrl(url).then(() => {
                // Recargar solo el componente de citas si es necesario
                window.location.reload();
              });
            } else {
              this.router.navigate(['/']);
            }
          },
          error: (err) => {
            console.error('Error obteniendo token:', err);
            this.router.navigate(['/']);
          }
        });
      } catch (error) {
        console.error('Error procesando callback:', error);
        this.router.navigate(['/']);
      }
    } else {
      this.router.navigate(['/']);
    }
  }
}
