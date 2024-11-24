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
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        this.datesService.handleSpotifyCallback(token).subscribe({
          next: (response) => {
            if (response.valid) {
              const returnPath = localStorage.getItem('spotify_return_path') || '/citas';
              localStorage.removeItem('spotify_return_path'); // Limpiar después de usar
              this.router.navigateByUrl(returnPath);
            } else {
              this.router.navigate(['/login']);
            }
          },
          error: (error) => {
            console.error('Error en callback de Spotify:', error);
            this.router.navigate(['/login']);
          }
        });
      } else {
        this.router.navigate(['/login']);
      }
    });
  }
}
