  import { Component, OnInit } from '@angular/core';
  import { ActivatedRoute } from '@angular/router';
  import { DatesService } from '../../services/dates.service'; 
  declare let L: any;
  import 'leaflet-routing-machine';

  @Component({
    selector: 'app-geolocalizacion',
    templateUrl: './geolocalizacion.component.html',
    styleUrls: ['./geolocalizacion.component.css']
  })
  export class GeolocalizacionComponent implements OnInit {
    latitud!: number;
    longitud!: number;
    map: any;
    nombreMedico: string = '';
    direccionMedico: string = '';

    doctorIcon = L.icon({
      iconUrl: 'assets/custom-marker-icon.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });

    clientIcon = L.icon({
      iconUrl: 'assets/custom-marker-icon.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });

    constructor(
      private route: ActivatedRoute,
      private datesService: DatesService
    ) {}

    ngOnInit(): void {
      this.route.queryParams.subscribe(params => {
        this.latitud = parseFloat(params['lat']);
        this.longitud = parseFloat(params['lng']);
        this.nombreMedico = params['nombre'] || 'Médico';
        this.obtenerDireccionDetallada(this.latitud, this.longitud);
      });
    }

    obtenerDireccionDetallada(lat: number, lon: number): void {
      this.datesService.reverseGeocode(lat, lon).subscribe(
        (data) => {
          if (data && data.data && data.data.length > 0) {
            const direccion = data.data[0];
            this.direccionMedico = `${direccion.name}, ${direccion.street}, ${direccion.city}`;
            this.inicializarMapa();
            
          }
        },
        (error) => {
          console.error('Error al obtener la dirección:', error);
          this.inicializarMapa(); 
        }
      );
    }

    
    inicializarMapa(): void {
      this.map = L.map('map').setView([this.latitud, this.longitud], 13);
    
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);
    
      L.marker([this.latitud, this.longitud], { icon: this.doctorIcon }).addTo(this.map)
        .bindPopup('Dirección del médico')
        .openPopup();
    
      this.solicitarUbicacionUsuario();
    }

    solicitarUbicacionUsuario(): void {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            this.mostrarRuta(userLat, userLng);
          },
          () => {
            alert('No se pudo obtener tu ubicación. La ruta no podrá ser calculada.');
          }
        );
      } else {
        alert('Tu navegador no soporta geolocalización. La ruta no podrá ser calculada.');
      }
    }

    mostrarRuta(userLat: number, userLng: number): void {
      // Primero, añadimos el marcador del usuario con las coordenadas básicas
      const userMarker = L.marker([userLat, userLng], { icon: this.clientIcon }).addTo(this.map)
        .bindPopup('Cargando tu ubicación...')
        .openPopup();
    
      // Aqui obtenemos la dirección dsel usuario usando Positionstack
      this.datesService.reverseGeocode(userLat, userLng).subscribe(
        (data) => {
          if (data && data.data && data.data.length > 0) {
            const direccionUsuario = data.data[0];
            console.log('Dirección del usuario:', direccionUsuario);
            
            // Actualizamos el popup del marcador con la dirección detallada
            const direccionFormateada = `${direccionUsuario.name}, ${direccionUsuario.street || ''}, ${direccionUsuario.city}`;
            userMarker.setPopupContent(`Tu ubicacion`);
            
          }
        },
        (error) => {
          console.error('Error al obtener la dirección del usuario:', error);
        }
      );
    
      const customPlan = L.Routing.plan([
        L.latLng(userLat, userLng),
        L.latLng(this.latitud, this.longitud)
      ], {
        createMarker: (i: number, wp: any) => {
          if (i === 0) {
            return userMarker; // Usamos el marcador que ya creamos
          } else {
            return L.marker(wp.latLng, { icon: this.doctorIcon });
          }
        }
      });
    
      L.Routing.control({
        plan: customPlan,
        routeWhileDragging: true,
        lineOptions: {
          styles: [{ color: '#6FA1EC', weight: 4 }]
        },
        language: 'es',
        showAlternatives: false,
        addWaypoints: false,
        fitSelectedRoutes: true,
        router: L.Routing.osrmv1({
          serviceUrl: 'https://router.project-osrm.org/route/v1',
          language: 'es'
        })
      }).addTo(this.map);
    
      this.map.fitBounds([
        [userLat, userLng],
        [this.latitud, this.longitud]
      ]);
    
      console.log('Calculando mejor ruta...');
    }}