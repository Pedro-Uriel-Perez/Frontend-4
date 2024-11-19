import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { DatesService } from '../../services/dates.service';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { IChatActivo, IMensaje } from 'src/app/models/chat.model';

interface IPaciente {
  id: string;
  nombre: string;
  imagen?: string;
}

interface IMensajeConNombre extends IMensaje {
  nombreRemitente?: string;
}

@Component({
  selector: 'app-medico-dashboard',
  templateUrl: './medico-dashboard.component.html',
  styleUrls: ['./medico-dashboard.component.css']
})
export class MedicoDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  // Propiedades principales
  citas: any[] = [];
  citasFiltradas: any[] = [];
  citaSeleccionada: any = null;
  historialMedico: any = {
    diagnostico: '',
    tratamiento: '',
    observaciones: ''
  };
  fechaInicio: string = '';
  fechaFin: string = '';
  nombreMedico: string = '';
  facebookUser: any = null;
  isConnectedWithFacebook: boolean = false;

  // Propiedades del chat
  chatsActivos: IChatActivo[] = [];
  pacienteSeleccionado: IPaciente | null = null;
  mensajes: IMensaje[] = [];
  nuevoMensaje: string = '';
  medicoId: string = '';
  chatAbierto: boolean = false;
  mensajesNoLeidos: number = 0;
  isMobile: boolean = false;
  showChat: boolean = false;

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  private destroy$ = new Subject<void>();
  private updateInterval: any;

  constructor(
    private datesService: DatesService,
    private router: Router
  ) {
    this.medicoId = localStorage.getItem('medicoId') || '';
    this.facebookUser = this.datesService.getCurrentUser();
    this.isConnectedWithFacebook = this.facebookUser?.provider === 'FACEBOOK';
    this.checkScreenSize();
    this.initializeComponent();

  }

  private initializeComponent() {
    // Obtener datos del médico del localStorage
    this.medicoId = localStorage.getItem('medicoId') || '';
    const nombre = localStorage.getItem('medicoNombre') || '';
    const apellido = localStorage.getItem('medicoApellido') || '';
    this.nombreMedico = `${nombre} ${apellido}`.trim();
    
    // Verificar autenticación
    if (!this.medicoId) {
      console.error('No se encontró ID del médico');
      this.router.navigate(['/login']);
      return;
    }

    this.checkScreenSize();
    this.facebookUser = this.datesService.getCurrentUser();
    this.isConnectedWithFacebook = this.facebookUser?.provider === 'FACEBOOK';
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth <= 1024;
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth <= 1024;
    });
  }

  


  ngOnInit() {
    if (!this.medicoId) {
      this.router.navigate(['/login']);
      return;
    }

    // Iniciar todas las suscripciones
    this.initializeSubscriptions();
  }

  private initializeSubscriptions() {
    // Cargar datos iniciales
    this.cargarCitas();
    this.cargarChatsActivos();
    
    // Suscribirse a actualizaciones
    this.datesService.getChatsActivos(this.medicoId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (chats) => {
          this.chatsActivos = this.ordenarChats(chats);
        },
        error: (error) => console.error('Error al cargar chats:', error)
      });

    this.datesService.getMensajesNoLeidos(this.medicoId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => this.mensajesNoLeidos = count);

    // Configurar actualización periódica
    this.initializePeriodicUpdates();
  }

  private ordenarChats(chats: IChatActivo[]): IChatActivo[] {
    return chats.sort((a, b) => {
      const timeA = a.ultimoMensaje?.fecha || '';
      const timeB = b.ultimoMensaje?.fecha || '';
      return new Date(timeB).getTime() - new Date(timeA).getTime();
    });
  }

  private initializePeriodicUpdates() {
    this.updateInterval = setInterval(() => {
      if (this.medicoId) {
        this.cargarChatsActivos();
        if (this.chatAbierto && this.pacienteSeleccionado) {
          this.cargarMensajes(this.pacienteSeleccionado.id);
        }
      }
    }, 5000);
  }

  
  ngAfterViewInit() {
    // No necesitamos setupTextareaAutoResize() ya que está en el componente de chat
  }

  ngOnDestroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  

  private suscribirseAMensajesNoLeidos() {
    this.datesService.getMensajesNoLeidos(this.medicoId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (count) => {
          this.mensajesNoLeidos = count;
          console.log('Mensajes no leídos:', count);
        },
        error: (error) => console.error('Error al obtener mensajes no leídos:', error)
      });
  }

  private iniciarActualizacionPeriodica() {
    this.updateInterval = setInterval(() => {
      this.cargarChatsActivos();
      if (this.chatAbierto && this.pacienteSeleccionado) {
        this.cargarMensajes(this.pacienteSeleccionado.id);
      }
    }, 5000);
  }

  cargarChatsActivos() {
    this.datesService.getChatsActivos(this.medicoId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (chats) => {
          this.chatsActivos = chats;
          if (this.pacienteSeleccionado) {
            // Mantener la selección actual si existe
            const chatActual = this.chatsActivos.find(
              chat => chat.paciente.id === this.pacienteSeleccionado?.id
            );
            if (chatActual) {
              this.pacienteSeleccionado = chatActual.paciente;
            }
          }
        },
        error: (error) => console.error('Error al cargar chats:', error)
      });
  }


  seleccionarChat(chat: IChatActivo) {
    console.log('Seleccionando chat:', chat);
    this.pacienteSeleccionado = {
      id: chat.paciente.id,
      nombre: chat.paciente.nombre
    };
    this.chatAbierto = true;
  }

  private obtenerNombrePaciente(pacienteId: string): string {
    // Aquí deberías implementar la lógica para obtener el nombre del paciente
    // desde tu base de datos si no viene en el chat
    return `Paciente ${pacienteId}`;
  }



  cargarMensajes(pacienteId: string) {
    if (!this.pacienteSeleccionado) return;

    this.datesService.getMensajesChat(this.medicoId, pacienteId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (mensajes) => {
          this.mensajes = mensajes;
          this.scrollToBottom();
        },
        error: (error) => console.error('Error al cargar mensajes:', error)
      });
  }


  enviarMensaje() {
    if (!this.nuevoMensaje.trim() || !this.pacienteSeleccionado) return;

    const mensaje: IMensaje = {
      emisor_id: this.medicoId,
      receptor_id: this.pacienteSeleccionado.id,
      contenido: this.nuevoMensaje.trim(),
      tipo_emisor: 'medico',
      fecha: new Date().toISOString(),
      leido: false
    };

    this.datesService.enviarMensaje(mensaje)
      .then(() => {
        this.nuevoMensaje = '';
        this.cargarMensajes(this.pacienteSeleccionado!.id);
      })
      .catch(error => console.error('Error al enviar mensaje:', error));
  }

  cerrarChat() {
    this.chatAbierto = false;
    this.pacienteSeleccionado = null;
    this.mensajes = [];
    this.nuevoMensaje = '';
    this.showChat = false;
  }

  toggleChat() {
    this.showChat = !this.showChat;
  }

  onMensajeEnviado(mensaje: IMensaje) {
    this.cargarChatsActivos();
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.messagesContainer) {
        const element = this.messagesContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    }, 100);
  }

  // ... resto de métodos para manejo de citas ...


  

  cargarDatosMedico() {
    const nombre = localStorage.getItem('medicoNombre') || '';
    const apellido = localStorage.getItem('medicoApellido') || '';
    this.nombreMedico = `${nombre} ${apellido}`.trim();
  }

  cargarCitas() {
    const medicoId = localStorage.getItem('medicoId');
    if (medicoId) {
      this.datesService.getCitasByMedico(medicoId).subscribe({
        next: (citas) => {
          console.log('Citas sin procesar:', citas);
          this.citas = citas.map(cita => {
            const esCitaFacebook = cita.idPaciente?.toString().length > 10;
            
            return {
              ...cita,
              nombreCompleto: cita.nombrePaciente || cita.paciente?.nombre || 'No especificado',
              esFacebookUser: esCitaFacebook,
              fechaFormateada: this.formatearFecha(cita.fecha),
              horaFormateada: this.formatearHora(cita.hora),
              edad: cita.paciente?.edad || 'No especificada',
              genero: cita.paciente?.genero || 'No especificado',
              tipoSangre: cita.paciente?.tipoSangre || 'No especificado'
            };
          });
          this.citasFiltradas = [...this.citas];
          console.log('Citas procesadas:', this.citas);
        },
        error: (error) => {
          console.error('Error al cargar citas:', error);
        }
      });
    }
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  }

  formatearHora(hora: string): string {
    return hora.substring(0, 5);
  }

  confirmarCita(idCita: number) {
    this.datesService.confirmarCita(idCita).subscribe({
      next: () => {
        this.cargarCitas();
      },
      error: (error) => console.error('Error al confirmar cita:', error)
    });
  }

  seleccionarCita(cita: any) {
    this.citaSeleccionada = cita;
    this.historialMedico = {
      diagnostico: '',
      tratamiento: '',
      observaciones: ''
    };
    setTimeout(() => this.setupTextareaAutoResize(), 0);
  }

  finalizarCita() {
    if (this.citaSeleccionada) {
      const historialMedico = {
        diagnostico: this.historialMedico.diagnostico || '',
        tratamiento: this.historialMedico.tratamiento || '',
        observaciones: this.historialMedico.observaciones || ''
      };

      this.datesService.finalizarCita(this.citaSeleccionada.idcita, historialMedico).subscribe({
        next: () => {
          this.cargarCitas();
          this.cerrarModal();
        },
        error: (error) => console.error('Error al finalizar cita:', error)
      });
    }
  }

  filtrarPorFechas() {
    if (this.fechaInicio && this.fechaFin) {
      const fechaInicio = new Date(this.fechaInicio);
      const fechaFin = new Date(this.fechaFin);

      if (!isNaN(fechaInicio.getTime()) && !isNaN(fechaFin.getTime())) {
        this.citasFiltradas = this.citas.filter(cita => {
          const fechaCita = new Date(cita.fecha);
          return fechaCita >= fechaInicio && fechaCita <= fechaFin;
        });
      }
    } else {
      this.citasFiltradas = [...this.citas];
    }
  }

  cerrarModal() {
    this.citaSeleccionada = null;
  }

  verHistorialMedico(cita: any) {
    console.log('Viendo historial médico para paciente:', cita.paciente);
    this.router.navigate(['/historial-medico'], { 
      state: { 
        pacienteId: cita.idPaciente,
        pacienteNombre: cita.nombrePaciente
      } 
    });
  }

  setupTextareaAutoResize() {
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
      textarea.addEventListener('input', this.autoResize);
      this.autoResize({ target: textarea } as any);
    });
  }

  autoResize(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }


}

