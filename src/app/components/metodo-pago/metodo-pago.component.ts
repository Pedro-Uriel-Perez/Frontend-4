import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DatesService } from 'src/app/services/dates.service';

declare var paypal: any;

interface PayPalOrder {
  purchase_units: Array<{
    amount: {
      value: string;
    };
  }>;
}

interface PayPalDetails {
  payer: {
    name: {
      given_name: string;
      surname: string;
    };
  };
  id: string; // Asegúrate de que la propiedad id esté definida aquí
}

@Component({
  selector: 'app-metodo-pago',
  templateUrl: './metodo-pago.component.html',
  styleUrls: ['./metodo-pago.component.css']
})
export class MetodoPagoComponent implements OnInit {
  @ViewChild('paypalButton') paypalButton!: ElementRef;
  
  pago = {
    numeroTarjeta: '',
    nombreTitular: '',
    fechaExpiracion: '',
    codigoSeguridad: '',
    monto: 0,
    idHospital: 0,
    fechaPago: new Date()
  };

  mensaje: string = '';
  modalVisible: boolean = false;

  mensajeExito: string = '';
  mostrarModalExito: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private datesService: DatesService,
    private ngZone: NgZone  // Asegúrate de que esto esté aquí

  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.pago.monto = +params['monto'] || 0;
      this.pago.idHospital = +params['idHospital'] || 0;
    });
  }

  ngAfterViewInit() {
    this.initPayPalButton();
  }

  initPayPalButton() {
    paypal.Buttons({
      createOrder: (data: any, actions: any) => {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: this.pago.monto.toString()
            }
          }]
        });
      },
      onApprove: (data: any, actions: any) => {
        return actions.order.capture().then((details: PayPalDetails) => {
          this.procesarPagoPayPal(details);
        });
      }
    }).render(this.paypalButton.nativeElement);
  }


  procesarPagoPayPal(details: PayPalDetails) {
    console.log('Iniciando procesamiento de pago PayPal');
    
    const pagoPayPal = {
        idHospital: this.pago.idHospital,
        monto: this.pago.monto,
        detallesPago: { id: details.id }
    };
  
    this.datesService.procesarPagoPayPal(pagoPayPal).subscribe({
      next: (response: any) => {
          console.log('Respuesta del servidor:', response);
          
          let mensajeCompleto = '¡Pago realizado con éxito!\n\n';
          mensajeCompleto += `Monto: $${this.pago.monto}\n`;
          mensajeCompleto += `ID de Transacción: ${response.transactionID}\n\n`;
          
          if (response.comprobante_enviado) {
              mensajeCompleto += '✉️ Se ha enviado un comprobante de pago al correo del hospital.\n';
              mensajeCompleto += 'Por favor, verifica tu correo.';
          }

          this.mostrarModalExito = true;
          this.mensajeExito = mensajeCompleto;

          // Ya no necesitamos el timeout aquí
      },
      error: (error) => {
          console.error('Error en el pago:', error);
          this.mensaje = 'Ocurrió un error al procesar el pago con PayPal. Por favor, inténtelo de nuevo.';
          this.modalVisible = true;
      }
  });
}

salir() {
  // Navegar a la página de inicio
  this.router.navigate(['/home']).then(() => {
      // Opcional: recargar la página para asegurar un estado limpio
      window.location.reload();
  });
}

  procesarPago(): void {
    if (this.validarTarjeta()) {
      this.pago.fechaPago = new Date();
      this.datesService.procesarPago(this.pago).subscribe(
        response => {
          this.mensaje = 'Pago realizado con éxito.';
          this.modalVisible = true;
          setTimeout(() => {
            this.router.navigate(['/home']);
          }, 2000);
        },
        error => {
          this.mensaje = 'Ocurrió un error al procesar el pago. Por favor, inténtelo de nuevo.';
          this.modalVisible = true;
        }
      );
    } else {
      this.mensaje = 'Por favor, corrige los errores en el formulario.';
      this.modalVisible = true;
    }
  }

  validarTarjeta(): boolean {
    // Implementa la lógica de validación de tarjeta aquí
    return true; // Cambia esto por tu lógica real de validación
  }

  cerrarModal(): void {
    this.modalVisible = false;
  }
}