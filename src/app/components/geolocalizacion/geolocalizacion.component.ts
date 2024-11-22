import { Component, Input, OnInit, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-routing-machine';

interface RoutingControlOptions {
 waypoints: L.LatLng[];
 routeWhileDragging: boolean;
 lineOptions: {
   styles: Array<{
     color: string;
     weight: number;
   }>;
   extendToWaypoints: boolean;
   missingRouteTolerance: number;
 };
 showAlternatives: boolean;
 router: any;
 createMarker: (i: number, waypoint: { latLng: L.LatLng }) => L.Marker;
}

@Component({
 selector: 'app-geolocalizacion',
 templateUrl: './geolocalizacion.component.html',
 styleUrls: ['./geolocalizacion.component.css']
})
export class GeolocalizacionComponent implements OnInit, OnChanges {
 @Input() latitud!: number;
 @Input() longitud!: number;
 @Input() nombreMedico: string = '';
 @Input() visible: boolean = false;
 @Output() cerrarModal = new EventEmitter<void>();

 map: L.Map | undefined = undefined;

 ngOnInit() {
   if (this.visible) {
     setTimeout(() => this.initMap(), 100);
   }
 }

 

 ngOnChanges(changes: SimpleChanges) {
  if (changes['visible']?.currentValue && this.latitud && this.longitud) {
    setTimeout(() => {
      this.initMap();
    }, 100);
  }
}
 initMap() {
  if (!this.map && this.latitud && this.longitud) {
     const mapContainer = document.getElementById('map');
     if (mapContainer) {
       mapContainer.style.height = '800px';
     }

     this.map = L.map('map').setView([this.latitud, this.longitud], 13);
     
     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
       attribution: '© OpenStreetMap contributors'
     }).addTo(this.map);

     const doctorIcon = L.icon({
       iconUrl: 'assets/custom-marker-icon.png',
       iconSize: [32, 32],
       iconAnchor: [16, 32],
       popupAnchor: [0, -32]
     });

     const userIcon = L.icon({
       iconUrl: 'assets/custom-marker-icon.png',
       iconSize: [32, 32],
       iconAnchor: [16, 32],
       popupAnchor: [0, -32]
     });

     if (this.map) {
       L.marker([this.latitud, this.longitud], { icon: doctorIcon })
         .addTo(this.map)
         .bindPopup(`<b>${this.nombreMedico}</b>`)
         .openPopup();
     }

     if (navigator.geolocation) {
       navigator.geolocation.getCurrentPosition(
         (position) => {
           const userLat = position.coords.latitude;
           const userLng = position.coords.longitude;

           if (this.map) {
             const routingControl = L.Routing.control({
               waypoints: [
                 L.latLng(userLat, userLng),
                 L.latLng(this.latitud, this.longitud)
               ],
               routeWhileDragging: true,
               lineOptions: {
                 styles: [{ color: '#6FA1EC', weight: 4 }],
                 extendToWaypoints: true,
                 missingRouteTolerance: 0
               },
               showAlternatives: false,
               router: L.Routing.osrmv1({
                 serviceUrl: 'https://router.project-osrm.org/route/v1',
                 language: 'es'
               }),
               createMarker: function(i: number, waypoint: { latLng: L.LatLng }) {
                 return L.marker(waypoint.latLng, {
                   icon: i === 0 ? userIcon : doctorIcon
                 });
               }
             } as RoutingControlOptions).addTo(this.map);

             this.map.fitBounds([
               [this.latitud, this.longitud],
               [userLat, userLng]
             ]);
           }
         },
         (error) => {
           console.error('Error obteniendo ubicación:', error);
         }
       );
     }
   }
 }

 onOverlayClick(event: MouseEvent) {
   if ((event.target as HTMLElement).className === 'mapa-overlay') {
     this.cerrar();
   }
 }

 cerrar() {
   if (this.map) {
     this.map.remove();
     this.map = undefined;
   }
   this.cerrarModal.emit();
 }
}