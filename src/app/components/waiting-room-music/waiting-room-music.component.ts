import { Component, OnInit, NgZone } from '@angular/core';
import { DatesService } from '../../services/dates.service';

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: {
      Player: new (config: {
        name: string;
        getOAuthToken: (cb: (token: string) => void) => void;
        volume: number;
      }) => any;
    };
  }
}

@Component({
  selector: 'app-waiting-room-music',
  template: `
    <div class="page-container">
      <div class="control-panel">
        <select (change)="changeGenre($event)" class="genre-select">
          <option *ngFor="let genre of genres" [value]="genre.id">
            {{ genre.name }}
          </option>
        </select>

        <input 
          type="text" 
          [(ngModel)]="searchQuery" 
          (input)="handleSearch()"
          placeholder="Buscar canciones, álbumes..."
          class="search-input"
        >
      </div>

      <div class="tracks-grid">
        <div class="track-card" *ngFor="let track of displayTracks">
          <div class="track-content">
            <div class="album-cover">
              <img [src]="track.track.album.images[0]?.url" [alt]="track.track.name">
            </div>
            
            <div class="track-info">
              <div class="track-name">{{track.track.name}}</div>
              <div class="track-artist">{{track.track.artists[0].name}}</div>
            </div>

            <!-- Control indicator y botón separados -->
            <div class="control-indicator" *ngIf="currentTrack?.track.id === track.track.id && isPlaying">
              <div class="bar"></div>
              <div class="bar"></div>
              <div class="bar"></div>
            </div>

            <!-- Botón fuera del control-indicator -->
            <!-- Solo un botón que cambia su contenido según el estado -->
<button class="Btn" (click)="playTrack(track)">
  <span class="svgContainer">
    <!-- Logo de Spotify con barras de animación si está sonando -->
    <div *ngIf="currentTrack?.track.id === track.track.id && isPlaying">
      <div class="playing-indicator">
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
      </div>
    </div>
    <!-- Ícono de play si está pausada o no es la canción actual -->
    <div *ngIf="currentTrack?.track.id !== track.track.id || !isPlaying">
      <svg viewBox="0 0 496 512" height="1.6em" xmlns="http://www.w3.org/2000/svg" fill="#1db954">
        <path d="M248 8C111.1 8 0 119.1 0 256s111.1 248 248 248 248-111.1 248-248S384.9 8 248 8zm100.7 364.9c-4.2 0-6.8-1.3-10.7-3.6-62.4-37.6-135-39.2-206.7-24.5-3.9 1-9 2.6-11.9 2.6-9.7 0-15.8-7.7-15.8-15.8 0-10.3 6.1-15.2 13.6-16.8 81.9-18.1 165.6-16.5 237 26.2 6.1 3.9 9.7 7.4 9.7 16.5s-7.1 15.4-15.2 15.4zm26.9-65.6c-5.2 0-8.7-2.3-12.3-4.2-62.5-37-155.7-51.9-238.6-29.4-4.8 1.3-7.4 2.6-11.9 2.6-10.7 0-19.4-8.7-19.4-19.4s5.2-17.8 15.5-20.7c27.8-7.8 56.2-13.6 97.8-13.6 64.9 0 127.6 16.1 177 45.5 8.1 4.8 11.3 11 11.3 19.7-.1 10.8-8.5 19.5-19.4 19.5zm31-76.2c-5.2 0-8.4-1.3-12.9-3.9-71.2-42.5-198.5-52.7-280.9-29.7-3.6 1-8.1 2.6-12.9 2.6-13.2 0-23.3-10.3-23.3-23.6 0-13.6 8.4-21.3 17.4-23.9 35.2-10.3 74.6-15.2 117.5-15.2 73 0 149.5 15.2 205.4 47.8 7.8 4.5 12.9 10.7 12.9 22.6 0 13.6-11 23.3-23.2 23.3z"></path>
      </svg>
    </div>
  </span>
  <span class="BG"></span>
</button>
          </div>
        </div>
      </div>

      <div class="player-controls" *ngIf="currentTrack && deviceId">
    <div class="player-content">
      <div class="current-track">
        <img [src]="currentTrack.track.album.images[0]?.url" alt="Current" class="current-album">
        <div class="current-info">
          <div class="current-name">{{currentTrack.track.name}}</div>
          <div class="current-artist">{{currentTrack.track.artists[0].name}}</div>
        </div>
      </div>

      <div class="controls">
  <button (click)="previousTrack()" [disabled]="!deviceId" class="control-btn">⏮️</button>
  <button (click)="togglePlay()" [disabled]="!deviceId" class="play-pause">
    {{ isPlaying ? '⏸️' : '▶️' }}
  </button>
  <button (click)="nextTrack()" [disabled]="!deviceId" class="control-btn">⏭️</button>
</div>

<div class="volume">
  <input type="range" 
         [value]="volume" 
         (input)="setVolume($event)"
         min="0" 
         max="100" 
         class="volume-slider">
</div>
`,
  styles: [`
    .page-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .control-panel {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
      justify-content: center;
    }

    .genre-select, .search-input {
      padding: 8px 16px;
      border-radius: 20px;
      border: 1px solid #ddd;
      font-size: 14px;
      min-width: 200px;
    }

    .search-input:focus {
      outline: none;
      border-color: #1DB954;
    }

    .tracks-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 80px;
    }

    .track-card {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: transform 0.2s;
    }

    .track-card:hover {
      transform: translateY(-2px);
    }

    .track-content {
      padding: 15px;
      display: flex;
      align-items: center;
      gap: 15px;
      cursor: pointer;
      position: relative;
    }
    .track-content:hover .Btn {
  opacity: 1;
  
}

    .album-cover {
      width: 60px;
      height: 60px;
      border-radius: 4px;
      overflow: hidden;
      flex-shrink: 0;
    }

    .album-cover img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .track-info {
      flex: 1;
      min-width: 0;
    }

    .track-name {
      font-weight: 500;
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .track-artist {
      font-size: 0.85em;
      color: #666;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .control-indicator {
      flex-shrink: 0;
    }

    

    .playing-indicator {
  display: flex;
  align-items: center;
  gap: 2px;
  height: 20px;
}

    .bar {
  width: 2px;
  height: 20px;
  background-color: #1DB954;
  animation: soundBars 1.2s infinite ease-in-out;
}

.bar:nth-child(1) { animation-delay: -0.8s; }
.bar:nth-child(2) { animation-delay: -0.4s; }
.bar:nth-child(3) { animation-delay: 0s; }

@keyframes soundBars {
  0%, 100% { height: 4px; }
  50% { height: 20px; }
}

    
    .Btn {
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background-color: transparent;
  position: absolute;
  right: 15px;
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.3s;
  opacity: 0.8;
}


.Btn:hover .play-icon {
  color: #1ed760;
}
    .svgContainer {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: transparent;
      backdrop-filter: blur(0px);
      letter-spacing: 0.8px;
      border-radius: 10px;
      transition: all 0.3s;
      border: 1px solid rgba(156, 156, 156, 0.466);
    }

    .BG {
      position: absolute;
      content: "";
      width: 100%;
      height: 100%;
      background: rgb(20, 20, 20);
      z-index: -1;
      border-radius: 10px;
      pointer-events: none;
      transition: all 0.3s;
    }

    .Btn:hover .BG {
      transform: rotate(35deg);
      transform-origin: bottom;
    }

    .Btn:hover .svgContainer {
      background-color: rgba(207, 207, 207, 0.466);
      backdrop-filter: blur(4px);
    }

    .player-controls {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: white;
      padding: 15px;
      box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
      z-index: 1000;
    }

    .player-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
    }

    .current-track {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 200px;
    }

    .current-album {
      width: 40px;
      height: 40px;
      border-radius: 4px;
    }

    .current-info {
      min-width: 0;
    }

    .current-name {
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .play-icon {
  font-size: 24px;
  color: #1db954;
}
    .current-artist {
      font-size: 0.85em;
      color: #666;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .controls {
      display: flex;
      gap: 15px;
      align-items: center;
    }

    .controls button {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      opacity: 0.8;
      transition: opacity 0.2s;
    }

    .controls button:hover {
      opacity: 1;
    }

    .controls button:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .play-pause {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #1DB954 !important;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .volume {
      width: 100px;
    }

    .volume-slider {
      width: 100%;
      height: 4px;
      -webkit-appearance: none;
      background: #ddd;
      border-radius: 2px;
    }

    .volume-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 12px;
      height: 12px;
      background: #1DB954;
      border-radius: 50%;
      cursor: pointer;
    }
  `]
})
export class WaitingRoomMusicComponent implements OnInit {
  currentPlaylist: any = null;
  tracks: any[] = [];
  displayTracks: any[] = [];
  player: any;
  isPlaying = false;
  currentTrack: any = null;
  deviceId: string | null = null;
  volume = 50;
  isPremium = false;
  searchQuery: string = '';
  searchTimeout: any;
  loading = true;
  selectedGenre: string = 'relaxing'; // Añadido aquí

  genres = [
    { id: 'relaxing', name: 'Música Relajante' },
    { id: 'classical', name: 'Música Clásica' },
    { id: 'jazz', name: 'Jazz' },
    { id: 'ambient', name: 'Música Ambiental' },
    { id: 'meditation', name: 'Meditación' },
    { id: 'piano', name: 'Piano' },
    { id: 'aleatoria', name: 'Aleatoria' }
  ];

  constructor(
    private datesService: DatesService,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    // Suscribirse a los estados
  this.datesService.isPlaying$.subscribe(state => this.isPlaying = state);
  this.datesService.currentTrack$.subscribe(track => this.currentTrack = track);
  this.datesService.deviceId$.subscribe(id => this.deviceId = id);
    this.checkPremiumStatus();
    this.initializePlayer();
    this.loadMusic();
  }

  handleSearch() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      if (!this.searchQuery.trim()) {
        this.displayTracks = this.tracks;
        return;
      }

      // Búsqueda local primero
      const query = this.searchQuery.toLowerCase();
      const localResults = this.tracks.filter(track => 
        track.track.name.toLowerCase().includes(query) ||
        track.track.artists[0].name.toLowerCase().includes(query)
      );

      if (localResults.length > 0) {
        this.displayTracks = localResults;
      } else {
        // Si no hay resultados locales, buscar en Spotify
        this.datesService.searchSpotify(this.searchQuery).subscribe({
          next: (response: any) => {
            this.displayTracks = response.tracks.items.map((track: any) => ({ track }));
          },
          error: (err) => console.error('Error en la búsqueda:', err)
        });
      }
    }, 300);
  }

  checkPremiumStatus() {
    this.datesService.getUserProfile().subscribe({
      next: (profile: any) => {
        this.isPremium = profile.product === 'premium';
      },
      error: (err) => console.error('Error verificando estado Premium:', err)
    });
  }

  initializePlayer() {
    window.onSpotifyWebPlaybackSDKReady = () => {
      this.ngZone.run(() => {
        const token = localStorage.getItem('spotify_token');
        if (!token) return;
  
        const player = new window.Spotify.Player({
          name: 'Sala de Espera Médica',
          getOAuthToken: (cb: any) => cb(token),
          volume: 0.5
        });
  
        this.player = player;
        this.datesService.setPlayer(player);
  
        player.addListener('ready', ({ device_id }: { device_id: string }) => {
          this.ngZone.run(() => {
            console.log('Device ID:', device_id);
            this.deviceId = device_id;
            this.datesService.setDeviceId(device_id);
          });
        });
  
        player.addListener('not_ready', ({ device_id }: { device_id: string }) => {
          console.log('Device ID has gone offline:', device_id);
          this.deviceId = null;
          this.datesService.setDeviceId(null);
        });
  
        player.addListener('player_state_changed', (state: any) => {
          this.ngZone.run(() => {
            if (state) {
              // Actualizar estado de reproducción
              this.isPlaying = !state.paused;
              this.datesService.setIsPlaying(!state.paused);
  
              // Actualizar volumen
              if (typeof state.volume !== 'undefined') {
                this.volume = Math.round(state.volume * 100);
              }
  
              // Actualizar track actual
              if (state.track_window?.current_track) {
                this.updateCurrentTrack(state.track_window.current_track);
              }
            }
          });
        });
  
        // Conectar el reproductor
        player.connect().then((success: boolean) => {
          if (success) {
            console.log('Spotify Web Playback SDK successfully connected');
          }
        });
      });
    };
  }

  
  

  playTrack(track: any) {
    const currentDeviceId = this.datesService.getDeviceId();
    if (!currentDeviceId) {
      console.error('Dispositivo no disponible');
      return;
    }
  
    // Si es la misma canción, toggle play/pause
    if (this.currentTrack?.track.id === track.track.id) {
      this.togglePlay();
      return;
    }
  
    // Si es una nueva canción, reproducirla
    this.datesService.playTrack(track.track.uri, currentDeviceId).subscribe({
      next: () => {
        this.updateCurrentTrack(track);
        this.isPlaying = true;
        this.datesService.setIsPlaying(true);
      },
      error: (err) => console.error('Error reproduciendo track:', err)
    });
  }

  // Modifica el método togglePlay

togglePlay() {
  const player = this.datesService.getPlayer();
  if (player) {
    player.togglePlay().then(() => {
      // El estado se actualizará a través del listener player_state_changed
    }).catch((error: any) => {
      console.error('Error al alternar reproducción:', error);
    });
  }
}

previousTrack() {
  const player = this.datesService.getPlayer();
  if (player) {
    player.previousTrack().then(() => {
      // El estado se actualizará a través del listener player_state_changed
    }).catch((error: any) => {
      console.error('Error al cambiar a la pista anterior:', error);
    });
  }
}

nextTrack() {
  const player = this.datesService.getPlayer();
  if (player) {
    player.nextTrack().then(() => {
      // El estado se actualizará a través del listener player_state_changed
    }).catch((error: any) => {
      console.error('Error al cambiar a la siguiente pista:', error);
    });
  }
}

  
setVolume(event: any) {
  const volume = event.target.value / 100;
  const player = this.datesService.getPlayer();
  if (player) {
    player.setVolume(volume).then(() => {
      this.volume = event.target.value;
    }).catch((error: any) => {
      console.error('Error al ajustar el volumen:', error);
    });
  }
}

  updateCurrentTrack(track: any) {
    // Si viene del estado del reproductor
    if (track.uri) {
      this.currentTrack = this.displayTracks.find(
        t => t.track.uri === track.uri
      );
      if (!this.currentTrack && track) {
        // Si no encontramos el track en displayTracks, crear uno
        this.currentTrack = {
          track: {
            id: track.id,
            uri: track.uri,
            name: track.name,
            artists: track.artists,
            album: {
              images: track.album.images
            }
          }
        };
      }
    } else {
      // Si viene de la selección directa
      this.currentTrack = track;
    }
  
    // Actualizar el estado en el servicio
    this.datesService.setCurrentTrack(this.currentTrack);
  }

  loadMusic() {
    this.loading = true;
    this.datesService.getPlaylistsByGenre(this.selectedGenre).subscribe({
      next: (response: any) => {
        if (response.playlists?.items?.length > 0) {
          const randomIndex = Math.floor(Math.random() * response.playlists.items.length);
          this.currentPlaylist = response.playlists.items[randomIndex];
          this.loadPlaylistTracks(this.currentPlaylist.id);
        }
      },
      error: (err) => {
        console.error('Error cargando música:', err);
        this.loading = false;
      }
    });
  }

  changeGenre(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    if (selectElement) {
      this.selectedGenre = selectElement.value;
      this.searchQuery = '';
      this.loadMusic();
    }
  }

  loadPlaylistTracks(playlistId: string) {
    this.loading = true;
    this.datesService.getPlaylistTracks(playlistId).subscribe({
      next: (response: any) => {
        this.tracks = response.items;
        this.displayTracks = this.tracks;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando tracks:', err);
        this.loading = false;
      }
    });
  }
}