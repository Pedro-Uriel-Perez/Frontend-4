import { Component, Input, OnInit, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import 'leaflet';
import 'leaflet-routing-machine';



declare let L: any;

@Component({
  selector: 'app-geolocalizacion',
  template: `
    <div class="mapa-overlay" *ngIf="visible">
      <div class="mapa-container">
        <div class="mapa-header">
          <h3>Ubicación del Médico: {{nombreMedico}}</h3>
          <button class="cerrar-btn" (click)="cerrar()">×</button>
        </div>
        <div id="map" style="height: 500px;"></div>
      </div>
    </div>
  `,
  styles: [`
    .mapa-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    .mapa-container {
      width: 90%;
      max-width: 800px;
      background: white;
      border-radius: 8px;
      overflow: hidden;
    }
    .mapa-header {
      padding: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #eee;
    }
    .cerrar-btn {
      border: none;
      background: none;
      font-size: 24px;
      cursor: pointer;
    }
  `]
})
export class GeolocalizacionComponent implements OnChanges {
  @Input() latitud!: number;
  @Input() longitud!: number;
  @Input() nombreMedico: string = '';
  @Input() visible: boolean = false;
  @Output() cerrarModal = new EventEmitter<void>();

  map: any = null;
  routingControl: any = null;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['visible']?.currentValue === true) {
      setTimeout(() => {
        this.initMap();
      }, 100);
    }
  }

  initMap() {
    if (!this.map) {
      this.map = L.map('map').setView([this.latitud, this.longitud], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);

      // Marcador del médico
      const doctorMarker = L.marker([this.latitud, this.longitud])
        .addTo(this.map)
        .bindPopup(this.nombreMedico)
        .openPopup();

      // Obtener ubicación del usuario
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;

          // Marcador del usuario
          const userMarker = L.marker([userLat, userLng])
            .addTo(this.map)
            .bindPopup('Tu ubicación')
            .openPopup();

          // Añadir ruta
          if (!this.routingControl) {
            this.routingControl = L.Routing.control({
              waypoints: [
                L.latLng(userLat, userLng),
                L.latLng(this.latitud, this.longitud)
              ],
              routeWhileDragging: false,
              showAlternatives: false,
              fitSelectedRoutes: true,
              lineOptions: {
                styles: [
                  { color: '#6FA1EC', weight: 4 }
                ]
              },
              router: L.Routing.osrmv1({
                serviceUrl: 'https://router.project-osrm.org/route/v1',
                language: 'es'
              })
            }).addTo(this.map);
          }

          // Ajustar vista para mostrar toda la ruta
          this.map.fitBounds([
            [userLat, userLng],
            [this.latitud, this.longitud]
          ], { padding: [50, 50] });
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('No se pudo obtener tu ubicación. Por favor, permite el acceso a tu ubicación en el navegador.');
        }
      );
    }
  }

  cerrar() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    if (this.routingControl) {
      this.routingControl.remove();
      this.routingControl = null;
    }
    this.cerrarModal.emit();
  }
}