import { Component, OnInit, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DatesService } from 'src/app/services/dates.service';

@Component({
  selector: 'app-hospital',
  templateUrl: './hospital.component.html',
  styleUrls: ['./hospital.component.css']
})
export class HospitalComponent implements OnInit {
  hospital = {
    idHospital: '',
    nombreHospital: '',
    direccion: '',
    estado: '',
    municipio: '',
    numSucursal: 0,
    telefono: '',
    nomRepresHospital: '',
    rfcHospital: '',
    monto: 0,
    correo: ''
  };
  modalVisible = false;
  mensaje = '';
  telefonoInvalido = false;
  numSucursalInvalido = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private datesService: DatesService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const monto = params['monto'];
      if (monto) {
        this.hospital.monto = Number(monto);
      }
    });
  }

  formularioValido(): boolean {
    return !!(this.hospital.nombreHospital &&
      this.hospital.direccion &&
      this.hospital.estado &&
      this.hospital.municipio &&
      this.hospital.telefono.match(/^\d{10}$/) &&
      this.hospital.nomRepresHospital &&
      this.hospital.rfcHospital.match(/^[A-Z0-9]{13}$/) &&
      this.hospital.monto > 0 &&
      this.hospital.numSucursal >= 0 &&
      this.hospital.correo.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/));
  }

  procesarFormulario(): void {
    if (!this.formularioValido()) {
      this.mensaje = 'Por favor, complete todos los campos obligatorios correctamente.';
      this.modalVisible = true;
      return;
    }

    this.datesService.guardarHospital(this.hospital).subscribe({
      next: (response) => {
        if (response.idHospital) {
          this.hospital.idHospital = response.idHospital;
          this.mensaje = 'Hospital registrado exitosamente. Redirigiendo al método de pago...';
          this.modalVisible = true;
          setTimeout(() => {
            this.ngZone.run(() => {
              this.router.navigate(['/metodo-pago'], { 
                queryParams: { 
                  monto: this.hospital.monto, 
                  idHospital: this.hospital.idHospital 
                }
              });
            });
          }, 2000);
        } else {
          this.mensaje = 'Error al registrar el hospital. Inténtelo de nuevo más tarde.';
          this.modalVisible = true;
        }
      },
      error: (err) => {
        console.error('Error al guardar el hospital:', err);
        this.mensaje = 'Error al guardar la información del hospital. Inténtelo de nuevo más tarde.';
        this.modalVisible = true;
      }
    });
  }

  cerrarModal() {
    this.modalVisible = false;
  }
}