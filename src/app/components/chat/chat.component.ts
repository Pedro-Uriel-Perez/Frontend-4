import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { DatesService } from 'src/app/services/dates.service';
import { IMensaje } from 'src/app/models/chat.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-chat',
  template: `
    <div class="chat-window" [class.minimized]="minimized">
      <div class="chat-header">
        <div class="user-info">
          <img [src]="receptorImagen || 'assets/default-avatar.png' " alt="Usuario" class="avatar">
          <span>{{receptorNombre}}</span>
        </div>
        <div class="header-actions">
          <button (click)="onMinimize.emit()" class="btn-action">
            <i class="fas" [class.fa-window-minimize]="!minimized" [class.fa-window-maximize]="minimized"></i>
          </button>
          <button (click)="onClose.emit()" class="btn-action">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
      
      <div class="chat-body" *ngIf="!minimized">
        <div #messagesContainer class="messages-container">
          <div *ngFor="let mensaje of mensajes" 
               [class.message-sent]="mensaje.emisor_id === emisorId"
               [class.message-received]="mensaje.emisor_id !== emisorId"
               class="message">
            <div class="message-content">
              
              <p>{{mensaje.contenido}}</p>
              <small class="message-time">{{mensaje.fecha | date:'short'}}</small>
              <span *ngIf="mensaje.leido && mensaje.emisor_id === emisorId" 
                    class="message-status">
                <i class="fas fa-check-double"></i>
              </span>
            </div>
          </div>
          <div *ngIf="escribiendo" class="typing-indicator">
            {{receptorNombre}} está escribiendo...
          </div>
        </div>
        
        <div class="input-container">
          <textarea
            [(ngModel)]="nuevoMensaje"
            (keyup.enter)="enviarMensaje()"
            (input)="ajustarAltura($event)"
            placeholder="Escribe un mensaje..."
            class="message-input"
            #messageInput
            rows="1">
          </textarea>
          <button (click)="enviarMensaje()" 
                  [disabled]="!nuevoMensaje.trim()"
                  class="send-button">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chat-window {
      width: 320px;
      position: fixed;
      bottom: 0;
      right: 20px;
      background: white;
      border-radius: 8px 8px 0 0;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
      z-index: 1000;
      border: 1px solid #e1e1e1;
    }

    .chat-window.minimized {
      height: 48px;
    }

    .chat-header {
      padding: 10px 15px;
      background: #007bff;
      color: white;
      border-radius: 8px 8px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .avatar {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      object-fit: cover;
    }

    .header-actions {
      display: flex;
      gap: 5px;
    }

    .btn-action {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 5px;
    }

    .chat-body {
      height: 400px;
      display: flex;
      flex-direction: column;
    }

    .messages-container {
      flex: 1;
      overflow-y: auto;
      padding: 15px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .message {
      max-width: 80%;
      padding: 8px 12px;
      border-radius: 15px;
      position: relative;
    }

    .message-sent {
      align-self: flex-end;
      background: #007bff;
      color: white;
      border-bottom-right-radius: 5px;
    }

    .message-received {
      align-self: flex-start;
      background: #f1f1f1;
      border-bottom-left-radius: 5px;
    }

    .message-time {
      font-size: 0.7em;
      opacity: 0.7;
      margin-top: 4px;
      display: block;
    }

    .message-status {
      position: absolute;
      right: 5px;
      bottom: -15px;
      font-size: 0.7em;
      color: #007bff;
    }

    .typing-indicator {
      font-size: 0.8em;
      color: #666;
      padding: 5px 15px;
      font-style: italic;
    }

    .input-container {
      padding: 10px;
      border-top: 1px solid #e1e1e1;
      display: flex;
      gap: 10px;
      background: white;
    }

    .message-input {
      flex: 1;
      border: 1px solid #e1e1e1;
      border-radius: 20px;
      padding: 8px 15px;
      resize: none;
      max-height: 100px;
      font-family: inherit;
    }

    .send-button {
      background: #007bff;
      color: white;
      border: none;
      border-radius: 50%;
      width: 35px;
      height: 35px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .send-button:disabled {
      background: #cccccc;
      cursor: not-allowed;
    }

    .message-sender {
      font-size: 0.8em;
      color: #666;
      margin-bottom: 4px;
      display: block;
    }

    .message-received .message-sender {
      color: #007bff;
      font-weight: 500;
    }

    .message-content {
      display: flex;
      flex-direction: column;
    }

    .message-sent .message-content {
      align-items: flex-end;
    }

    .message-received .message-content {
      align-items: flex-start;
    }

  `]
})
export class ChatComponent implements OnInit, OnDestroy {
  @Input() emisorId!: string;
  @Input() receptorId!: string;
  @Input() receptorNombre!: string;
  @Input() receptorImagen?: string;
  @Input() tipoEmisor!: 'medico' | 'paciente';
  @Input() minimized: boolean = false;

  @Output() onClose = new EventEmitter<void>();
  @Output() onMinimize = new EventEmitter<void>();
  @Output() onMensajeEnviado = new EventEmitter<IMensaje>();

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @ViewChild('messageInput') private messageInput!: ElementRef;

  mensajes: IMensaje[] = [];
  nuevoMensaje: string = '';
  escribiendo: boolean = false;
  private destroy$ = new Subject<void>();
  private typingTimeout: any;

  constructor(private datesService: DatesService) {}

  ngOnInit() {
    this.cargarMensajes();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
  }

  private cargarMensajes() {
    this.datesService.getMensajesChat(this.emisorId, this.receptorId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (mensajes) => {
          this.mensajes = mensajes;
          this.scrollToBottom();
          if (this.tipoEmisor === 'medico') {
            this.marcarMensajesComoLeidos();
          }
        },
        error: (error) => console.error('Error al cargar mensajes:', error)
      });
  }

  enviarMensaje() {
    if (!this.nuevoMensaje.trim()) return;

    const mensaje: IMensaje = {
      emisor_id: this.emisorId,
      receptor_id: this.receptorId,
      contenido: this.nuevoMensaje.trim(),
      fecha: new Date().toISOString(),
      tipo_emisor: this.tipoEmisor,
      leido: false
    };

    this.datesService.enviarMensaje(mensaje);
    this.nuevoMensaje = '';
    this.ajustarAltura();
    this.onMensajeEnviado.emit(mensaje);
  }

  private marcarMensajesComoLeidos() {
    const chatId = `chat_${this.emisorId}_${this.receptorId}`;
    this.datesService.marcarMensajesComoLeidos(chatId, this.emisorId)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  ajustarAltura(event?: any) {
    if (!this.messageInput) return;
    
    const textarea = this.messageInput.nativeElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
    
    if (event) {
      if (this.typingTimeout) {
        clearTimeout(this.typingTimeout);
      }
      // Aquí podrías implementar la lógica para indicar que el usuario está escribiendo
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.messagesContainer) {
        const element = this.messagesContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    }, 100);
  }
}