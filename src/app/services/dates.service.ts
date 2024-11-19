  import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
  import { Injectable } from '@angular/core';
  import { Observable, throwError, BehaviorSubject, Subject, of } from 'rxjs';
  import { catchError, map, tap } from 'rxjs/operators';
  import { Citas } from '../models/Citas';
  import { User } from '../models/User';   //cambien esto, checar si no afecta
import { SocialAuthService } from 'angularx-social-login';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onValue, Database, update, get } from 'firebase/database';
import { getAnalytics } from "firebase/analytics";
import { IChatActivo, IMensaje, IPaciente, IultimoMensaje } from '../models/chat.model';




// Interfaces
interface SpotifyProfile {
  product: string;
  id: string;
  email: string;
}

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}


  @Injectable({
    providedIn: 'root'
  })
  export class DatesService {
    API_URI = 'http://localhost:3000/api'; // para frontend usando api backend
    //API_URI = 'https://citasmedicas-ten.vercel.app/api'; // Cambiado para usar backend

    private POSITIONSTACK_API = 'https://api.positionstack.com/v1';
    private POSITIONSTACK_API_KEY = 'fa06cdb185054fb35ca0032d6d8855c9'; // API de datos


  private readonly FDA_API_KEY = 'XAtGFTDFWlItLPWa37FNOVvpMMTfLQFw4JItiG8a'; // API key
  private readonly FDA_BASE_URL = 'https://api.fda.gov';

  private readonly CIMA_API_URL = 'https://cima.cofepris.gob.mx';  //ESTE YO CREO QUE LO VOY A QUITAR


   // nuevas variables para Spotify
   private readonly SPOTIFY_CLIENT_ID = '2aaab0af49ac40b5a78ae868e50bb7d0';
   private readonly SPOTIFY_CLIENT_SECRET = '9bccdb16cdde4f6d8814ce74585f7e14';
   private readonly SPOTIFY_REDIRECT_URI = 'http://localhost:4200/spotify-callback';
   private readonly SPOTIFY_API_URL = 'https://api.spotify.com/v1';

   

   private logoutSubject = new Subject<void>();
  logout$ = this.logoutSubject.asObservable();

  private player = new BehaviorSubject<any>(null);
  private isPlaying = new BehaviorSubject<boolean>(false);
  private currentTrack = new BehaviorSubject<any>(null);
  private deviceId = new BehaviorSubject<string | null>(null);


 //para lo del chat medico y usuario
   // Inicialización correcta de las propiedades del chat
   

   
  
  // Observables públicos
  player$ = this.player.asObservable();
  isPlaying$ = this.isPlaying.asObservable();
  currentTrack$ = this.currentTrack.asObservable();
  deviceId$ = this.deviceId.asObservable();
  
  

    private currentUserSubject: BehaviorSubject<any>;
    public currentUser: Observable<any>;
    private mensajes = new BehaviorSubject<any[]>([]);

    nombrePaciente: any;
    idPaciente: any;
    router: any;
    db!: Database;
    


    constructor(
    private http: HttpClient, 
    private socialAuthService: SocialAuthService
  ) {
    // Inicialización del usuario
    let user = null;
    try {
      user = JSON.parse(localStorage.getItem('user') || '{}');
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
    }
    this.currentUserSubject = new BehaviorSubject<any>(user);
    this.currentUser = this.currentUserSubject.asObservable();

  // Inicializar Firebase
    this.initFirebase();

  }
  

  private initFirebase() {
    const firebaseConfig = {
      apiKey: "AIzaSyBKQwLEFVXZD3XWkfaRMtlrph9UQQOTVIc",
      authDomain: "chat-medico-paciente-31a7c.firebaseapp.com",
      databaseURL: "https://chat-medico-paciente-31a7c-default-rtdb.firebaseio.com", // Esta URL es importante
      projectId: "chat-medico-paciente-31a7c",
      storageBucket: "chat-medico-paciente-31a7c.appspot.com",
      messagingSenderId: "576013986168",
      appId: "1:576013986168:web:ba0f4359a824a8aa02408d",
      measurementId: "G-JGTSLWB92R"
    };
  
    const app = initializeApp(firebaseConfig);
    this.db = getDatabase(app);
  }

  // Métodos de chat actualizados



enviarMensaje(mensaje: any) {
  console.log('Enviando mensaje:', mensaje);
  // Ordenar IDs para consistencia
  const ids = [mensaje.emisor_id, mensaje.receptor_id].sort();
  const chatId = `chat_${ids[0]}_${ids[1]}`;
  const chatRef = ref(this.db, `chats/${chatId}/mensajes`);
  
  return push(chatRef, {
    ...mensaje,
    fecha: new Date().toISOString()
  });
}



getMensajesChat(emisorId: string, receptorId: string): Observable<any[]> {
  console.log('Obteniendo mensajes para:', emisorId, receptorId);
  return new Observable(observer => {
    // Ordenar IDs para consistencia
    const ids = [emisorId, receptorId].sort();
    const chatId = `chat_${ids[0]}_${ids[1]}`;
    const chatRef = ref(this.db, `chats/${chatId}/mensajes`);
    
    // Obtener información del paciente
    const pacienteRef = ref(this.db, `usuarios/${receptorId}`);
    
    // Primero obtenemos los datos del paciente
    get(pacienteRef).then((pacienteSnapshot) => {
      const pacienteData = pacienteSnapshot.val();
      const nombrePaciente = pacienteData?.nombreCompleto || pacienteData?.nombre || `Paciente ${receptorId}`;
      
      // Luego obtenemos los mensajes
      onValue(chatRef, (snapshot) => {
        const mensajes: any[] = [];
        
        snapshot.forEach((childSnapshot) => {
          const mensaje = childSnapshot.val();
          mensajes.push({
            id: childSnapshot.key,
            ...mensaje,
            // Añadir el nombre del remitente basado en quién envió el mensaje
            nombreRemitente: mensaje.emisor_id === emisorId ? 'Tú' : nombrePaciente
          });
        });
        
        // Ordenar mensajes por fecha
        mensajes.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
        
        console.log('Mensajes encontrados:', mensajes);
        observer.next(mensajes);
      }, error => {
        console.error('Error al obtener mensajes:', error);
        observer.error(error);
      });
    }).catch(error => {
      console.error('Error al obtener datos del paciente:', error);
      observer.error(error);
    });
  });
}


  getMensajesObservable(): Observable<any[]> {
    return this.mensajes.asObservable();
  }
  

  // Método para obtener chats activos  
  
  getChatsActivos(medicoId: string): Observable<IChatActivo[]> {
    return new Observable(observer => {
      const chatsRef = ref(this.db, 'chats');
      
      onValue(chatsRef, (snapshot) => {
        const chats: IChatActivo[] = [];
        
        snapshot.forEach((childSnapshot) => {
          const chatId = childSnapshot.key || '';
          const chatData: any = childSnapshot.val();
          
          if (chatId.includes(medicoId)) {
            // Extraer ID del paciente del chatId
            const [id1, id2] = chatId.replace('chat_', '').split('_');
            const pacienteId = id1 === medicoId ? id2 : id1;
            
            // Obtener información del paciente
            const pacienteRef = ref(this.db, `pacientes/${pacienteId}`);
            get(pacienteRef).then((pacienteSnapshot) => {
              const pacienteData = pacienteSnapshot.val();
              
              const chatActivo: IChatActivo = {
                id: chatId,
                paciente: {
                  id: pacienteId,
                  nombre: pacienteData?.nombre || pacienteData?.nombreCompleto || `Paciente ${pacienteId}`
                },
                ultimoMensaje: chatData.ultimoMensaje || null
              };
              
              chats.push(chatActivo);
              observer.next(chats);
            });
          }
        });
      });
      
      return () => {};
    });
  }


// Método para marcar mensajes como leídos
marcarMensajesComoLeidos(chatId: string, medicoId: string): Observable<boolean> {
  return new Observable(observer => {
    const mensajesRef = ref(this.db, `chats/${chatId}/mensajes`);
    
    onValue(mensajesRef, (snapshot) => {
      snapshot.forEach((childSnapshot) => {
        const mensaje = childSnapshot.val();
        if (mensaje.receptor_id === medicoId && !mensaje.leido) {
          const mensajeRef = ref(this.db, `chats/${chatId}/mensajes/${childSnapshot.key}`);
          update(mensajeRef, { leido: true });
        }
      });
      observer.next(true);
    }, error => {
      console.error('Error al marcar mensajes como leídos:', error);
      observer.error(error);
    });

    // Retornar una función de limpieza
    return () => {};
  });
}

// Método para obtener mensajes no leídos
getMensajesNoLeidos(medicoId: string): Observable<number> {
  return new Observable(observer => {
    const chatsRef = ref(this.db, 'chats');
    
    onValue(chatsRef, (snapshot) => {
      let count = 0;
      
      snapshot.forEach((childSnapshot) => {
        const chatData = childSnapshot.val();
        if (chatData.mensajes) {
          Object.values(chatData.mensajes).forEach((mensaje: any) => {
            if (mensaje.receptor_id === medicoId && !mensaje.leido) {
              count++;
            }
          });
        }
      });
      
      observer.next(count);
    }, error => {
      console.error('Error al obtener mensajes no leídos:', error);
      observer.error(error);
    });
  });
}


//aqui termina lo de chat


    public get currentUserValue(): any {
      return this.currentUserSubject.value;
    }
    
    setDeviceId(id: string | null) {
  this.deviceId.next(id);
}

    // Métodos para manejar el estado del reproductor DE SPOTYFY
  setPlayer(player: any) {
    this.player.next(player);
  }

  setIsPlaying(state: boolean) {
    this.isPlaying.next(state);
  }

  setCurrentTrack(track: any) {
    this.currentTrack.next(track);
  }

  

  getPlayer() {
    return this.player.value;
  }

  getCurrentTrack() {
    return this.currentTrack.value;
  }

  getDeviceId() {
    return this.deviceId.value;
  }

  getIsPlaying() {
    return this.isPlaying.value;
  }

    searchSpotify(query: string) {
      const headers = {
        'Authorization': `Bearer ${localStorage.getItem('spotify_token')}`
      };
      
      return this.http.get(`https://api.spotify.com/v1/search?q=${query}&type=track,album,show&limit=9`, { headers });
    }

    // Método para obtener el perfil del usuario
  getUserProfile(): Observable<SpotifyProfile> {
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${localStorage.getItem('spotify_token')}`);

    return this.http.get<SpotifyProfile>(`${this.SPOTIFY_API_URL}/me`, { headers });
  }

  // Método para obtener token
  getSpotifyToken(code: string): Observable<SpotifyTokenResponse> {
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/x-www-form-urlencoded');

    const body = new URLSearchParams();
    body.set('grant_type', 'authorization_code');
    body.set('code', code);
    body.set('redirect_uri', 'http://localhost:4200/spotify-callback');
    body.set('client_id', this.SPOTIFY_CLIENT_ID);
    body.set('client_secret', this.SPOTIFY_CLIENT_SECRET);

    return this.http.post<SpotifyTokenResponse>(
      'https://accounts.spotify.com/api/token',
      body.toString(),
      { headers }
    ).pipe(
      tap(response => {
        localStorage.setItem('spotify_token', response.access_token);
      }),
      catchError(this.handleError)
    );
  }

  // Método para obtener música de sala de espera
  getWaitingRoomMusic(): Observable<any> {
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${localStorage.getItem('spotify_token')}`);

    return this.http.get(
      `${this.SPOTIFY_API_URL}/search?q=relaxing%20waiting%20room&type=playlist&limit=1`,
      { headers }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Método para obtener tracks de una playlist
  getPlaylistTracks(playlistId: string): Observable<any> {
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${localStorage.getItem('spotify_token')}`);

    return this.http.get(
      `${this.SPOTIFY_API_URL}/playlists/${playlistId}/tracks`,
      { headers }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Método para reproducir una pista
  // Y en el método playTrack del servicio
playTrack(trackUri: string, deviceId: string): Observable<any> {
  if (!deviceId) {
    return throwError(() => new Error('No hay dispositivo disponible'));
  }

  const headers = new HttpHeaders()
    .set('Authorization', `Bearer ${localStorage.getItem('spotify_token')}`)
    .set('Content-Type', 'application/json');

  const body = {
    uris: [trackUri],
    position_ms: 0
  };

  return this.http.put(
    `${this.SPOTIFY_API_URL}/me/player/play?device_id=${deviceId}`,
    body,
    { headers }
  ).pipe(
    catchError(this.handleError)
  );
}

  // Método para inicializar la autenticación de Spotify
  initializeSpotifyAuth(): void {
    const scopes = [
      'streaming',
      'user-read-email',
      'user-read-private',
      'user-read-playback-state',
      'user-modify-playback-state',
      'user-read-currently-playing',
      'app-remote-control'
    ].join(' ');

    const params = new URLSearchParams({
      client_id: this.SPOTIFY_CLIENT_ID,
      response_type: 'code',
      redirect_uri: 'http://localhost:4200/spotify-callback',
      scope: scopes,
      show_dialog: 'true'
    });

    const url = 'https://accounts.spotify.com/authorize?' + params.toString();
    window.location.href = url;
  }

  // Método para manejar errores
  private handleError(error: any): Observable<never> {
    let errorMessage = 'Ocurrió un error';

    if (error.error instanceof ErrorEvent) {
      // Error del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.status) {
      // Error del servidor
      switch (error.status) {
        case 401:
          errorMessage = 'No autorizado. Por favor, vuelve a iniciar sesión.';
          localStorage.removeItem('spotify_token');
          break;
        case 403:
          errorMessage = 'Acceso prohibido. Verifica tus permisos.';
          break;
        case 429:
          errorMessage = 'Demasiadas solicitudes. Por favor, espera un momento.';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.error.message}`;
      }
    }

    console.error('Error en Spotify API:', error);
    return throwError(() => errorMessage);
  }


  getPlaylistsByGenre(genre: string): Observable<any> {
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${localStorage.getItem('spotify_token')}`);
  
    let searchQuery: string;
    switch (genre) {
      case 'relaxing':
        searchQuery = 'relaxing waiting room';
        break;
      case 'classical':
        searchQuery = 'classical piano peaceful';
        break;
      case 'jazz':
        searchQuery = 'smooth jazz relaxing';
        break;
      case 'ambient':
        searchQuery = 'ambient peaceful';
        break;
      case 'meditation':
        searchQuery = 'meditation mindfulness';
        break;
      case 'corridos Tumbados':
        searchQuery = 'corridos tumbados';
        break;
      case 'piano':
        searchQuery = 'peaceful piano';
        break;
      default:
        searchQuery = 'relaxing';
        
    }
  
    return this.http.get(
      `${this.SPOTIFY_API_URL}/search?q=${encodeURIComponent(searchQuery)}&type=playlist&limit=6`,
      { headers }
    ).pipe(
      catchError(this.handleError)
    );
  }
  
  stopSpotifyPlayback(): Observable<any> {
    const token = localStorage.getItem('spotify_token');
    if (!token) return of(null);

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`);

    return this.http.put(
      `${this.SPOTIFY_API_URL}/me/player/pause`,
      {},
      { headers }
    ).pipe(
      catchError(error => {
        console.error('Error deteniendo reproducción de Spotify:', error);
        return of(null);
      })
    );
  }

    guardarHospital(hospital: any): Observable<any> {
      return this.http.post(`${this.API_URI}/hospitales`, hospital);
    }
  
    procesarPago(pago: any): Observable<any> {
      return this.http.post(`${this.API_URI}/pagos`, pago);
    }


    procesarPagoPayPal(datosPago: any): Observable<any> {
      console.log('Enviando solicitud de pago PayPal al servidor');
      return this.http.post(`${this.API_URI}/pagos-paypal`, datosPago).pipe(
        tap(response => console.log('Respuesta del servidor:', response)),
        catchError(error => {
          console.error('Error en la solicitud:', error);
          return throwError(error);
        })
      );
    }

  
    enviarComprobantePago(email: string, datosPago: any, idTransaccion: string): Observable<any> {
      const url = `${this.API_URI}/enviar-comprobante`;  // Define la ruta correspondiente en tu backend
      const body = { email, datosPago, idTransaccion };
      return this.http.post(url, body);
    }
    
  

    // Nuevos métodos para la API CIMA

  // Método para buscar medicamentos por nombre
  buscarMedicamentos(nombre: string): Observable<any> {
    const url = `${this.CIMA_API_URL}/medicamentos/buscar?nombre=${nombre}`; // Cambia esto según la estructura de la API
    return this.http.get<any>(url).pipe(
      tap(response => console.log('Resultados de la búsqueda:', response)),
      catchError(this.handleError)
    );
  }

  // Método para obtener detalles de un medicamento por ID
  obtenerMedicamentoPorId(id: number): Observable<any> {
    const url = `${this.CIMA_API_URL}/medicamentos/${id}`; // Cambia esto según la estructura de la API
    return this.http.get<any>(url).pipe(
      tap(response => console.log('Detalles del medicamento:', response)),
      catchError(this.handleError)
    );
  }

  



    //Para la api de base de datos, es una de ver medicamentos y demas
    searchDrug(drugName: string): Observable<any> {
      // Modificar la búsqueda para ser más flexible
      const url = `${this.FDA_BASE_URL}/drug/label.json?api_key=${this.FDA_API_KEY}&search=openfda.brand_name:${drugName}`;
      
      console.log('URL de búsqueda:', url);
  
      return this.http.get(url).pipe(
        map((response: any) => {
          if (response.error) {
            throw new Error(response.error.message);
          }
          return response;
        }),
        catchError(error => {
          console.error('Error en la búsqueda:', error);
          return throwError(() => 'No se encontraron resultados para este medicamento');
        })
      );
    }
  
    // Método para obtener una lista de medicamentos disponibles
    getAvailableDrugs(): Observable<any> {
      const url = `${this.FDA_BASE_URL}/drug/label.json?api_key=${this.FDA_API_KEY}&limit=100`;
      
      return this.http.get(url).pipe(
        map((response: any) => {
          if (response.results) {
            return response.results.map((drug: any) => ({
              brandName: drug.openfda?.brand_name?.[0] || 'N/A',
              genericName: drug.openfda?.generic_name?.[0] || 'N/A',
              manufacturer: drug.openfda?.manufacturer_name?.[0] || 'N/A'
            }));
          }
          return [];
        }),
        catchError(error => {
          console.error('Error obteniendo lista de medicamentos:', error);
          return throwError(() => 'Error al obtener la lista de medicamentos');
        })
      );
    }
  
  

  searchDrugsByManufacturer(manufacturerName: string): Observable<any> {
    const url = `${this.FDA_BASE_URL}/drug/label.json?api_key=${this.FDA_API_KEY}&search=openfda.manufacturer_name:"${manufacturerName}"&limit=10`;
    return this.http.get(url).pipe(
      tap(response => console.log('Medicamentos del fabricante:', response)),
      catchError(error => {
        console.error('Error al buscar por fabricante:', error);
        return throwError(() => error);
      })
    );
  }


  //Para facebok
  setCurrentUser(user: any) {
    this.currentUserSubject.next(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  procesarLoginFacebook(userData: any): Observable<any> {
    return this.http.post(`${this.API_URI}/facebook-login`, userData);
  }



  
  getCurrentUser() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    return this.currentUserSubject.value;
  }



    
  
    private getAuthHeaders(): HttpHeaders {
      const token = localStorage.getItem('token');
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
    }

    //infromacion del usuario de

    getUserInfo(): Observable<any> {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.get(`${this.API_URI}/user`, { headers }).pipe(
        tap(user => {
          console.log('Usuario obtenido:', user);
        }),
        catchError(this.handleError)
      );
   }
   
   

    

    

    
    private getToken(): string {
      return localStorage.getItem('token') || '';
    }
  
  

    

    // Autenticación con GitHub
    loginWithGitHub(): void {
      window.location.href = `${this.API_URI}/auth/github`;
    }

    

    handleAuthResponse(token: string): Observable<any> {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.get(`${this.API_URI}/user`, { headers }).pipe(
        tap(user => {
          console.log('User data received:', user);
          this.handleAuthSuccess(user);  // Asegúrate de manejar el éxito aquí
        }),
        catchError(this.handleError)
      );
    }

    // Método para manejar el éxito de la autenticación
    // Método para manejar la respuesta de autenticació

   
  private handleAuthSuccess(response: any): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    localStorage.setItem('userName', response.user.nombre); // Guarda el nombre del usuario
    this.currentUserSubject.next(response.user);
  }

    // Verificar si el usuario está autenticado
    isAuthenticated(): boolean {
      return !!this.getToken() && !!this.currentUserValue;
    }

  


  async logout(): Promise<void> {
    try {
      // Detener la música primero
      await this.stopSpotifyPlayback().toPromise();

      // Notificar a los componentes del logout
      this.logoutSubject.next();

      // Limpiar localStorage
      localStorage.clear();

      // Resetear el BehaviorSubject
      this.currentUserSubject.next(null);

      // Cerrar sesión de redes sociales
      if (this.socialAuthService) {
        try {
          await this.socialAuthService.signOut();
        } catch (error) {
          console.error('Error al cerrar sesión de redes sociales:', error);
        }
      }
    } catch (error) {
      console.error('Error durante el logout:', error);
    }
  }

  

    



   // Netodos para la geolocalizacion de Positionstack
   

  
  geocodeAddress(address: string): Observable<any> {
    const url = `${this.POSITIONSTACK_API}/forward`;
    const params = {
      access_key: this.POSITIONSTACK_API_KEY,
      query: address
    };
    return this.http.get(url, { params });
  }

  reverseGeocode(lat: number, lon: number): Observable<any> {
    const url = `${this.POSITIONSTACK_API}/reverse`;
    const params = {
      access_key: this.POSITIONSTACK_API_KEY,
      query: `${lat},${lon}`
    };
    return this.http.get(url, { params });
  }




  getDates(): Observable<Date[]> {
    return this.http.get<Date[]>(`${this.API_URI}/dates`).pipe(
      tap(dates => console.log('Fechas obtenidas:', dates)),
      catchError(this.handleError)
    );
  }

  getDate(id: string): Observable<Date> {
    return this.http.get<Date>(`${this.API_URI}/dates/${id}`).pipe(
      tap(date => console.log('Fecha obtenida:', date)),
      catchError(this.handleError)
    );
  }

  saveDate(date: User): Observable<any> {
    console.log('Enviando solicitud de registro:', date);
    return this.http.post(`${this.API_URI}/register`, date).pipe(
      catchError(this.handleError)
    );
  }

  register(user: any): Observable<any> {
    return this.http.post(`${this.API_URI}/register`, user).pipe(
      catchError(this.handleError)
    );
  }

  login(credentials: { correo: string; contrase: string }): Observable<any> {
    return this.http.post(`${this.API_URI}/login`, credentials).pipe(
      catchError(this.handleError)
    );
  }

  authenticate(correo: string, contrase: string): Observable<{ isAuthenticated: boolean; userId?: string; userName?: string }> {
    return this.http.post<{ isAuthenticated: boolean; userId?: string; userName?: string }>(`${this.API_URI}/auth`, { correo, contrase }).pipe(
      tap(response => console.log('Autenticación:', response)),
      catchError(this.handleError)
    );
  }

  saveCita(cita: Citas): Observable<any> {
    return this.http.post(`${this.API_URI}/citas`, cita);
  }

  getAllCitas(): Observable<Citas[]> {
    return this.http.get<Citas[]>(`${this.API_URI}/citas`);
  }

  downloadCitasAsJson(citas: Citas[]): void {
    const data = JSON.stringify(citas, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'citas.xls';
    link.click();
    window.URL.revokeObjectURL(url);
  }


  // Para ver las citas médicas y el historial de citas
  registrarCita(cita: any): Observable<any> {
    return this.http.post(`${this.API_URI}/citas`, cita);
  }

  getCitasPaciente(idPaciente: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URI}/citas/${idPaciente}`);
  }

  getCitasByPaciente(idPaciente: string): Observable<Citas[]> {
    return this.http.get<Citas[]>(`${this.API_URI}/citas/${idPaciente}`).pipe(
      map(citas => citas.map(cita => ({
        ...cita,
        especialidad: cita.especialidad || 'No especificada',
        hospital: cita.hospital || 'No especificada',
        duracionEstimada: cita.duracionEstimada || '30 minutos',
        telefonoMedico: cita.telefonoMedico || 'No disponible',
        correoMedico: cita.correoMedico || 'No disponible',
        puedeModificar: cita.estado === 'pendiente',
        estaFinalizada: cita.estado === 'finalizada'
      })))
    );
  }

  // Modificación de citas y cancelaciones por parte de los pacientes
  updateCita(cita: Citas): Observable<any> {
    return this.http.put(`${this.API_URI}/citas/${cita.idcita}`, cita);
  }

  deleteCita(idCita: number): Observable<any> {
    return this.http.delete(`${this.API_URI}/citas/${idCita}`);
  }

  // Métodos para médicos
  medicoLogin(correo: string, id: string): Observable<any> {
    return this.http.post(`${this.API_URI}/medico-login`, { correo, id }).pipe(
      tap(response => console.log('Login de médico:', response)),
      catchError(this.handleError)
    );
  }


  // Para confirmar citas y enviar historial médico
  confirmarCita(idCita: number): Observable<any> {
    return this.http.put(`${this.API_URI}/citas/${idCita}/confirmar`, {});
  }

  finalizarCita(idCita: number, historialMedico: any): Observable<any> {
    return this.http.post(`${this.API_URI}/citas/${idCita}/finalizar`, historialMedico);
  }




  // Obtener historial médico de un paciente
 

  getCitasByMedico(medicoId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URI}/citas-medico/${medicoId}`).pipe(
      tap(citas => console.log('Citas obtenidas:', citas)),
      catchError(this.handleError)
    );
  }
  getHistorialMedico(idPaciente: string): Observable<any> {
    console.log('Solicitando historial médico para el paciente:', idPaciente);
    return this.http.get(`${this.API_URI}/historial-medico/${idPaciente}`).pipe(
      tap(historial => console.log('Historial médico obtenido:', historial)),
      catchError(this.handleError)
    );
  }

  actualizarHistorial(idHistorial: string, historial: any): Observable<any> {
    return this.http.put(`${this.API_URI}/historial-medico/${idHistorial}`, historial).pipe(
      catchError(this.handleError)
    );
  }

  eliminarHistorial(idHistorial: string): Observable<any> {
    return this.http.delete(`${this.API_URI}/historial-medico/${idHistorial}`).pipe(
      catchError(this.handleError)
    );
  }

}
