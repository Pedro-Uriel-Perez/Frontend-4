import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatesService } from '../../services/dates.service';
import { Citas } from '../../models/Citas';
import * as L from 'leaflet';
import { Subject, take, takeUntil } from 'rxjs';
import { IMensaje } from 'src/app/models/chat.model';




@Component({
  selector: 'app-citas',
  templateUrl: './citas.component.html',
  styleUrls: ['./citas.component.css']
})
export class CitasComponent implements OnInit, AfterViewInit, OnDestroy {

  
  
  private destroy$ = new Subject<void>();


  @ViewChild('mapContainer', { static: false }) mapContainer: ElementRef | undefined;

  modalAbierto = false;
  fechaSeleccionada: string = '';
  horaSeleccionada: string = '';
  
  //medicoSeleccionado: any = {};
  
  medicoSeleccionado: any = {
    latitud: null,
    longitud: null,
    nombre: '',
    imagen: ''
  };

  idPaciente: string = '';
  nombrePaciente: string = '';
  errorMessage: string = '';
  welcomeMessage: string = '';
  citaGenerada: boolean = false;
  historialCitas: Citas[] = [];
  mostrarHistorial: boolean = false;
  userId: string | null = null;
  userName: string | null = null;

  
  mostrarMapa = false;
  
  //userId: string = '';  // Cambiado de string | null a string
  //userName: string = ''; // Cambiado de string | null a string

  map: L.Map | undefined;
  mapInitialized: boolean = false;

  private customIcon = L.icon({
    iconUrl: 'assets/custom-marker-icon.png',  //  imagen esta e n carpeta assets
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
  });


  medicos = [
    { id: 1, nombre: 'Dr. Juan Pérez', hospital: 'Hospital Del Ángel', ciudad: 'Dolores Hidalgo', 
      especialidad: 'Cardiología', disponibilidad: 'Disponible', imagen: 'assets/Doctores/doctorJuanPerez.jpg',latitud: 21.15789733348977,longitud:-100.9184991597011 },
      
    { id: 2, nombre: 'Dra. María García', hospital: 'Hospital MAC', ciudad: 'San Miguel de Allende',
       especialidad: 'Pediatría', disponibilidad: 'Disponible', imagen: 'assets/Doctores/doctoraMariaGarcia.jpg',latitud: 20.90038775092955,longitud:-100.72953443712234  },

    { id: 3, nombre: 'Dr. Carlos López', hospital: 'Hospital General SDLP', ciudad: 'San Luis de la paz', 
      especialidad: 'Neurología', disponibilidad: 'Disponible', imagen: 'assets/Doctores/doctorCarlosLopez.jpg',latitud: 21.279606204774485,longitud: -100.49606761123135  },

    { id: 4, nombre: 'Dra. Ana Martínez', hospital: 'Hospital General Dolores Hidalgo', ciudad: 'Dolores Hidalgo', 
      especialidad: 'Dermatología', disponibilidad: 'Disponible', imagen: 'assets/Doctores/doctoraAnaMartinez.jpg',latitud: 21.1355310118905,longitud: -100.93347581956743 },

    { id: 5, nombre: 'Dra. Sandra Martínez', hospital: 'Hospital H+ Querétaro', ciudad: 'Queretaro',
       especialidad: 'Neurología', disponibilidad: 'Disponible', imagen: 'assets/Doctores/doctoraSandraMartinez.jpg',latitud: 20.5847024995157,longitud: -100.40021725839604 },

    { id: 6, nombre: 'Dr. Pedro Esparza', hospital: 'Hospital Angeles Pedregal', ciudad: 'CDMX', 
      especialidad: 'Cardiología', disponibilidad: 'Disponible', imagen: 'assets/Doctores/doctorPedroEsparza.jpg',latitud: 19.312516319110998,longitud: -99.22116559045386 },

    { id: 7, nombre: 'Dr. Antonio Gomez', hospital: 'Hospital General Tijuana', ciudad: 'Tijuana', 
      especialidad: 'Ginecologia', disponibilidad: 'Disponible', imagen: 'assets/Doctores/doctorAntonioGomez.jpg',latitud: 32.5256293927447,longitud: -117.00948121144893 },

    { id: 8, nombre: 'Dra. Paulina Delgado', hospital: 'Hospital General de Queretaro', ciudad: 'Queretaro', 
      especialidad: 'Psicologia', disponibilidad: 'Disponible', imagen: 'assets/Doctores/doctoraPaulinaDelgado.jpg',latitud: 20.579954108345174,longitud: -100.4059652249689 },

    { id: 9, nombre: 'Dr. Xavie Sinue', hospital: 'Hospital General La Villa', ciudad: 'CDMX',   
      especialidad: 'Dermatología', disponibilidad: 'Disponible', imagen: 'assets/Doctores/doctorXavierSinue.jpg',latitud: 19.482133373225736 ,longitud: -99.10335737316684 },

    { id: 10, nombre: 'Dr. Calos Carrillo', hospital: 'Hospital Star Médica Querétaro', ciudad: 'Queretaro', 
      especialidad: 'Cirujano', disponibilidad: 'Disponible', imagen: 'assets/Doctores/doctorCarlosCarrillo.jpg',latitud: 20.6175496295999,longitud: -100.40740511349595 },

    { id: 11, nombre: 'Dr. Jesus Hernandez', hospital: 'Hospital de la Mujer', ciudad: 'CDMX', 
      especialidad: 'Anestesiólogo', disponibilidad: 'Disponible', imagen: 'assets/Doctores/doctorJesusHernandez.jpg',latitud: 19.452945160210596,longitud: -99.17067337980909 },

    { id: 12, nombre: 'Dr. José Martínez', hospital: 'Hospital San José de Querétaro', ciudad: 'Queretaro',
      especialidad: 'Psicologia', disponibilidad: 'Disponible', imagen: 'assets/Doctores/doctorJoseMartinez.jpg',latitud: 20.564966426437575,longitud: -100.41278866280385 },

    { id: 13, nombre: 'Dr. Diego Cruz', hospital: 'Clínica de Especialidades Santa Fe', ciudad: 'Dolores Hidalgo',  
      especialidad: 'Dermatología', disponibilidad: 'Disponible', imagen: 'assets/Doctores/doctorDiegoCruz.jpg',latitud: 21.15420719311542,longitud:  -100.91945145887419 },

    { id: 14, nombre: 'Dr. María Cruz', hospital: 'Clínica Santa María', ciudad: 'San Luis de la paz', 
      especialidad: 'Cirujano', disponibilidad: 'Disponible', imagen: 'assets/Doctores/doctoraMariaCruz.jpg',latitud: 21.290033949075724,longitud: -100.51391295396476 },

    { id: 15, nombre: 'Dr. Miguel García', hospital: 'Sanatorio de Especialidades Guadalupe', ciudad: 'Dolores Hidalgo', 
      especialidad: 'Psicologia', disponibilidad: 'Disponible', imagen: 'assets/Doctores/doctorMiguelGarcia.jpg',latitud:21.159526913342553,longitud: -100.93471951360526 },

    { id: 16, nombre: 'Dr. Pedro Gómez', hospital: 'Hospital General SDLP', ciudad: 'San Luis de la paz', 
      especialidad: 'Cirujano', disponibilidad: 'Disponible', imagen: 'assets/Doctores/doctorPedroGomez.jpg',latitud: 21.28003523489967,longitud: -100.49622332787783 },

    { id: 17, nombre: 'Dr. Hernan Martínez', hospital: 'Hospital Del Ángel', ciudad: 'Dolores Hidalgo', 
      especialidad: 'Cirujano', disponibilidad: 'Disponible', imagen: 'assets/Doctores/doctorHernanMartinez.jpg',latitud: 21.15868645012911,longitud: -100.91858334428885 },

    { id: 18, nombre: 'Dr. Diego Gómez', hospital: 'Hospital Del Ángel', ciudad: 'Dolores Hidalgo', 
      especialidad: 'Psicologia', disponibilidad: 'Disponible', imagen: 'assets/Doctores/doctorDiegoGomez.jpg',latitud: 21.15868645012911,longitud: -100.91858334428885 },
  ];



  
  citas: Citas[] | undefined;

  medicosFiltrados: any[] = [];

  searchNombre: string = '';
  searchEspecialidad: string = '';
  searchHospital: string = '';
  searchCiudad: string = '';

  especialidades: string[] = [];
  hospitales: string[] = [];
  ciudades: string[] = [];
userLoggedInWithTwitter: any;
  facebookUser: any;
  isConnectedWithFacebook: boolean = false;
  spotifyConnected: boolean = false;
  showSpotifySection = false; // Nueva propiedad
  
// Propiedades del chat

@ViewChild('messagesContainer') messagesContainer!: ElementRef;
chatAbierto: boolean = false;
chatMinimizado: boolean = false;
chatPosition: any = { top: '0px', left: '0px' };
medicoSeleccionadoChat: any = null;
mensajes: any[] = [];
nuevoMensaje: string = '';


constructor(
  private datesService: DatesService,
  private route: ActivatedRoute,
  private router: Router,
  private ngZone: NgZone
) {
  this.spotifyConnected = !!localStorage.getItem('spotify_token');
  this.idPaciente = localStorage.getItem('pacienteId') || '';
  // Cargar datos inmediatamente si hay un usuario autenticado
  const user = this.datesService.getCurrentUser();
  if (user) {
    this.cargarDatosIniciales(user.id, user.name);
  }
}

private cargarDatosIniciales(userId: string, userName: string) {
  this.idPaciente = userId;
  this.nombrePaciente = userName;
  this.welcomeMessage = `Bienvenido, ${this.nombrePaciente}!`;
  this.medicosFiltrados = [...this.medicos];
  this.inicializarFiltros();
  this.cargarHistorialCitas();
  this.cargarCitas();
  this.obtenerCoordenadasMedicos();
}


   mostrarUbicacionMedico(medico: any) {
    this.medicoSeleccionado = medico;
    this.mostrarMapa = true;
  }

  cerrarMapa() {
    this.mostrarMapa = false;
    this.medicoSeleccionado = null;
  }


   abrirChat(medico: any, event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    this.medicoSeleccionadoChat = medico;
    this.chatAbierto = true;
  }
  

  minimizarChat() {
    this.chatMinimizado = !this.chatMinimizado;
  }

  onMensajeEnviado(mensaje: IMensaje) {
    this.scrollToBottom();
  }


   

  cargarMensajes(medicoId: string) {
    console.log('Cargando mensajes para médico ID:', medicoId);
    this.datesService.getMensajesChat(this.idPaciente, medicoId)
      .subscribe({
        next: (mensajes) => {
          console.log('Mensajes cargados:', mensajes);
          this.mensajes = mensajes;
          setTimeout(() => this.scrollToBottom(), 100);
        },
        error: (error) => {
          console.error('Error al cargar mensajes:', error);
        }
      });
  }

  enviarMensaje() {
    if (!this.nuevoMensaje.trim() || !this.medicoSeleccionadoChat) return;

    const mensaje = {
      emisor_id: this.idPaciente,
      receptor_id: this.medicoSeleccionadoChat.id,
      contenido: this.nuevoMensaje,
      tipo_emisor: 'paciente' as const
    };

    // Enviar mensaje usando Firebase
    this.datesService.enviarMensaje(mensaje);
    this.nuevoMensaje = ''; // Limpiar input
    this.scrollToBottom();
  }

  

  

  cerrarChat() {
    this.chatAbierto = false;
    this.mensajes = [];
    this.medicoSeleccionadoChat = null;
  }
  private scrollToBottom(): void {
    try {
      setTimeout(() => {
        if (this.messagesContainer) {
          const element = this.messagesContainer.nativeElement;
          element.scrollTop = element.scrollHeight;
        }
      }, 100);
    } catch (err) {
      console.error('Error en scrollToBottom:', err);
    }
  }

  
  // En cualquier componente donde quieras iniciar la conexión con Spotify
connectToSpotify() {
  // Guardar la URL completa actual, incluyendo los parámetros
  const currentUrl = window.location.href;
  localStorage.setItem('originalUrl', currentUrl);
  
  // Iniciar la autenticación de Spotify
  this.datesService.initializeSpotifyAuth();
}


toggleSpotifySection() {
  this.showSpotifySection = !this.showSpotifySection;
}

// Opcional: método para verificar si la música está reproduciéndose
checkSpotifyStatus() {
  if (this.spotifyConnected) {
    this.datesService.getWaitingRoomMusic().subscribe({
      next: (response) => {
        console.log('Música de sala de espera cargada:', response);
      },
      error: (error) => {
        console.error('Error al cargar música:', error);
        this.spotifyConnected = false;
        localStorage.removeItem('spotify_token');
      }
    });
  }
}

// Método para manejar la detención de Spotify y navegación
private stopSpotifyAndNavigate() {
  const spotifyToken = localStorage.getItem('spotify_token');
  if (spotifyToken) {
    this.datesService.stopSpotifyPlayback().subscribe({
      complete: () => {
        this.router.navigate(['/home']);
      },
      error: () => {
        this.router.navigate(['/home']);
      }
    });
  } else {
    this.router.navigate(['/home']);
  }
}



  //para cerrar sesion de git

  async logout(): Promise<void> {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      try {
        await this.datesService.logout();
        // La navegación se manejará a través del observable logout$
      } catch (error) {
        console.error('Error durante el logout:', error);
        // Si hay un error, intentar navegar de todos modos
        this.router.navigate(['/home']);
      }
    }
  }



  //para la geolocalizacion
  

  abrirMapaEnNuevaPestana(latitud: number, longitud: number) {
    const url = `/geolocalizacion?lat=${latitud}&lng=${longitud}`;
    window.open(url, '_blank');
  }
  
  toggleUbicacion(medico: any) {
    medico.ubicacionVisible = !medico.ubicacionVisible;
  }
  
  obtenerCoordenadasMedicos(): void {
    this.medicos.forEach(medico => {
      if (medico.latitud === 0 && medico.longitud === 0) {
        // Usa el servicio DatesService para obtener las coordenadas de Positionstack
        const direccion = `${medico.hospital}, ${medico.ciudad}`;
        this.datesService.geocodeAddress(direccion).subscribe(
          (response: any) => {
            if (response && response.data && response.data.length > 0) {
              const coordenadas = response.data[0];
              medico.latitud = coordenadas.latitude;
              medico.longitud = coordenadas.longitude;
              console.log(`Coordenadas obtenidas para ${medico.nombre}: ${medico.latitud}, ${medico.longitud}`);
              
              this.agregarMarcador(medico);
            }
          },
          (error) => {
            console.error(`Error al obtener coordenadas para ${medico.nombre}:`, error);
          }
        );
      } else {
        this.agregarMarcador(medico);
      }
    });
  }

  
  ngAfterViewInit(): void {
    this.inicializarMapa();
  }

  inicializarMapa(): void {
    if (this.mapContainer && !this.mapInitialized) {
      this.map = L.map(this.mapContainer.nativeElement).setView([20.0, -100.0], 5);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.map);

      this.mapInitialized = true;
    }
  }
  

  agregarMarcador(medico: any): void {
    if (this.map) {
      const marker = L.marker([medico.latitud, medico.longitud]).addTo(this.map)
        .bindPopup(`<b>${medico.nombre}</b><br>${medico.hospital}<br>${medico.especialidad}`);
      marker.on('click', () => {
        console.log(`Marcador clickeado para el médico: ${medico.nombre}`);
      });
    }
  }
  


  verUbicacionMedico(latitud: number, longitud: number): void {
    if (this.map && this.mapInitialized) {
      const nuevaUbicacion = L.latLng(latitud, longitud);
      this.map.setView(nuevaUbicacion, 15); // Ajustar zoom y centrar en la ubicacion
    } else {
      alert('Mapa no está inicializado o la ubicación no está disponible.');
    }
  }

  

  ///hata aqui termina geolocalizacion


  

  ngOnInit(): void {

    const user = this.datesService.getCurrentUser();
    if (user) {
      this.cargarDatosIniciales(user.id, user.name);
    }

    // Inicializar las suscripciones de logout
    this.datesService.logout$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.stopSpotifyAndNavigate();
      });
  
    // Primero, intentamos obtener la información del usuario de Facebook
    this.facebookUser = this.datesService.getCurrentUser();
    
    if (this.facebookUser && this.facebookUser.provider === 'FACEBOOK') {
      this.isConnectedWithFacebook = true;
      this.idPaciente = this.facebookUser.id;
      this.nombrePaciente = this.facebookUser.name;
      
      // Verificar si estamos en la URL correcta
      const currentUrl = this.router.url;
      const expectedUrl = `/citas/${this.idPaciente}/${encodeURIComponent(this.nombrePaciente)}`;
      
      if (currentUrl !== expectedUrl) {
        // Si no estamos en la URL correcta, redirigir
        this.router.navigate(['/citas', this.idPaciente, this.nombrePaciente], {
          replaceUrl: true // Esto reemplazará la entrada en el historial
        });
      } else {
        this.procederConInicializacion();
        this.checkSpotifyStatus();
      }
    } else {
      // Si no hay usuario de Facebook, seguimos con la lógica existente
      this.route.params.pipe(
        takeUntil(this.destroy$)
      ).subscribe(params => {
        this.idPaciente = params['userId'] || localStorage.getItem('userId') || '';
        this.nombrePaciente = params['userName'] || localStorage.getItem('userName') || '';
        
        if (!this.idPaciente || !this.nombrePaciente) {
          this.route.queryParams.pipe(
            takeUntil(this.destroy$)
          ).subscribe(queryParams => {
            const token = queryParams['token'];
            if (token) {
              localStorage.setItem('auth_token', token);
              try {
                const decodedToken = jwt_decode(token);
                this.idPaciente = decodedToken.userId;
                this.nombrePaciente = decodedToken.userName;
                localStorage.setItem('userId', this.idPaciente);
                localStorage.setItem('userName', this.nombrePaciente);
              } catch (error) {
                console.error('Error al decodificar el token:', error);
              }
            }
            this.procederConInicializacion();
            this.checkSpotifyStatus();
          });
        } else {
          this.procederConInicializacion();
          this.checkSpotifyStatus();
        }
      });
      // Suscribirse a nuevos mensajes
    this.datesService.getMensajesObservable().subscribe(mensajes => {
      console.log('Nuevos mensajes recibidos:', mensajes);
      this.mensajes = mensajes;
      this.scrollToBottom();  
    });
    }
  }
  
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  
  private procederConInicializacion(): void {
    if (this.idPaciente && this.nombrePaciente) {
      // Verificar Facebook URL
      if (this.isConnectedWithFacebook) {
        const currentUrl = this.router.url;
        const expectedUrl = `/citas/${this.idPaciente}/${encodeURIComponent(this.nombrePaciente)}`;
        
        if (currentUrl !== expectedUrl) {
          this.router.navigate(['/citas', this.idPaciente, this.nombrePaciente], {
            replaceUrl: true
          });
          return;
        }
      }
   
      this.loading = true; // Añadir loading
      this.welcomeMessage = `Bienvenido, ${this.nombrePaciente}!`;
   
      // Cargar datos base
      this.medicosFiltrados = [...this.medicos];
      this.inicializarFiltros();
   
      // Cargar datos asíncronos
      setTimeout(() => {
        Promise.all([
          this.cargarHistorialCitas(),
          this.cargarCitas(),
          this.obtenerCoordenadasMedicos()
        ]).finally(() => {
          this.loading = false;
        });
      }, 100);
   
    } else {
      console.error('No se encontró ID o nombre de paciente');
      this.router.navigate(['/login']);
    }
   }
   loading: boolean = true;
  

  irAVerCitas(): void {
    this.router.navigate(['/ver-citas', this.idPaciente, this.nombrePaciente]);
  }

  irAHistorialPaciente(): void {
    this.router.navigate(['/historial-paciente', this.idPaciente, this.nombrePaciente]);
  }


  cargarCitas() {

    const userId = this.isConnectedWithFacebook ? 
    this.facebookUser.id : this.idPaciente;

    console.log('Cargando citas para usuario:', userId);

    this.datesService.getCitasByPaciente(this.idPaciente).subscribe(
      (citas: Citas[]) => {
        this.citas = citas.map(cita => ({
          ...cita,
          especialidad: cita.especialidad || 'No especificada',
          hospital: cita.hospital || 'No especificada',
          duracionEstimada: '30 minutos',
          telefonoMedico: cita.telefonoMedico || 'No disponible',
          correoMedico: cita.correoMedico || 'No disponible',
          imagenMedico: cita.imagenMedico || 'assets/default-doctor-image.jpg' 
        }));
        console.log('Citas cargadas:', this.citas);
      },
      error => console.error('Error al cargar citas:', error)
    );
  }

  

  abrirModal(medico: any): void {
    this.medicoSeleccionado = medico;
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.fechaSeleccionada = '';
    this.horaSeleccionada = '';
    this.medicoSeleccionado = {};
    this.citaGenerada = false;
  }

  onFechaChange(event: any): void {
    this.fechaSeleccionada = event.target.value;
  }

  onHoraChange(event: any): void {
    this.horaSeleccionada = event.target.value;
  }

  generarCita(): void {
    if (!this.fechaSeleccionada || !this.horaSeleccionada || !this.medicoSeleccionado.id) {
      alert('Por favor, complete todos los campos');
      return;
    }
    

    const nuevaCita: Citas = {
      idcita: 0,
      IdMedico: this.medicoSeleccionado.id,
      idPaciente: this.idPaciente,
      nombrePaciente: this.nombrePaciente,
      descripcion: `Consulta con ${this.medicoSeleccionado.nombre} - ${this.medicoSeleccionado.especialidad}`,
      fecha: this.fechaSeleccionada,
      hora: this.horaSeleccionada,
      nombreMedico: this.medicoSeleccionado.nombre,
      especialidad: this.medicoSeleccionado.especialidad,
      hospital: this.medicoSeleccionado.hospital,
      telefonoMedico: this.medicoSeleccionado.telefono,
      correoMedico: this.medicoSeleccionado.correo,
      duracionEstimada: undefined,
      estado: 'pendiente' // borrar si es nesesacrio 
    };

    console.log('Generando cita:', nuevaCita);

    this.datesService.saveCita(nuevaCita).subscribe(
      (resp: any) => {
        console.log('Cita guardada con éxito', resp);
        this.citaGenerada = true;
        alert('Cita generada con éxito');
        
        const citaConFormato = {
          ...nuevaCita,
          fechaFormateada: this.formatearFecha(nuevaCita.fecha),
          horaFormateada: this.formatearHora(nuevaCita.hora)
        };
        this.historialCitas.unshift(citaConFormato);
        
        this.cerrarModal();
      },
      error => {
        console.error('Error al guardar la cita', error);
        alert('Error al generar la cita');
      }
    );
  }

  verHistorialCitas(): void {
    this.mostrarHistorial = !this.mostrarHistorial;
    if (this.mostrarHistorial && this.historialCitas.length === 0) {
      this.cargarHistorialCitas();
    }
  }

  

  

  cargarHistorialCitas(): void {

    const userId = this.isConnectedWithFacebook ?
    this.facebookUser.id : this.idPaciente;

    console.log('Cargando historial de citas para usuario:', userId);

    if (this.idPaciente) {
      console.log('Cargando historial de citas para el paciente:', this.idPaciente);
      this.datesService.getCitasByPaciente(this.idPaciente).subscribe(
        (citas: Citas[]) => {
          console.log('Citas recibidas del servidor:', citas);
          this.historialCitas = citas.map(cita => ({
            ...cita,
            fechaFormateada: this.formatearFecha(cita.fecha),
            horaFormateada: this.formatearHora(cita.hora)
          }));
          console.log('Historial de citas formateado:', this.historialCitas);
          if (this.historialCitas.length === 0) {
            console.log('No se encontraron citas para este paciente');
          }
        },
        error => {
          console.error('Error al cargar el historial de citas', error);
          this.errorMessage = 'Error al cargar el historial de citas';
        }
      );
    } else {
      console.error('No hay ID de paciente para cargar el historial');
    }
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  }

  formatearHora(hora: string): string {
    return hora.substring(0, 5);
  }

  downloadCitas(): void {
    this.errorMessage = '';
    this.datesService.getAllCitas().subscribe({
      next: (citas: Citas[]) => {
        this.datesService.downloadCitasAsJson(citas);
      },
      error: (error) => {
        this.errorMessage = 'Error al descargar las citas: ' + error.message;
        console.error('Error al descargar las citas', error);
      }
    });
  }
  inicializarFiltros(): void {
    this.especialidades = [...new Set(this.medicos.map(m => m.especialidad))];
    this.hospitales = [...new Set(this.medicos.map(m => m.hospital))];
    this.ciudades = [...new Set(this.medicos.map(m => m.ciudad))];
  }

  aplicarFiltros(): void {
    this.medicosFiltrados = this.medicos.filter(medico => 
      medico.nombre.toLowerCase().includes(this.searchNombre.toLowerCase()) &&
      (this.searchEspecialidad === '' || medico.especialidad === this.searchEspecialidad) &&
      (this.searchHospital === '' || medico.hospital === this.searchHospital) &&
      (this.searchCiudad === '' || medico.ciudad === this.searchCiudad)
    );
  }
}

function jwt_decode(token: any): any {
  throw new Error('Function not implemented.');
}