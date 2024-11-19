import { Component, OnInit } from '@angular/core';
import { DatesService } from '../../services/dates.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-historial-medico',
  templateUrl: './historial-medico.component.html',
  styleUrls: ['./historial-medico.component.css']
})
export class HistorialMedicoComponent implements OnInit {
  historialMedico: any[] = [];
  idPaciente: string = '';
  nombrePaciente: string = '';
  errorMessage: string = '';

  constructor(private datesService: DatesService, private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation && navigation.extras && navigation.extras.state) {
      this.idPaciente = navigation.extras.state['pacienteId'];
      this.nombrePaciente = navigation.extras.state['pacienteNombre'];
    }
  }

  ngOnInit() {
    console.log('ID del paciente:', this.idPaciente);
    console.log('Nombre del paciente:', this.nombrePaciente);
    if (this.idPaciente) {
      this.cargarHistorialMedico();
    } else {
      console.error('No se encontró ID de paciente');
    }
  }

  cargarHistorialMedico() {
    this.datesService.getHistorialMedico(this.idPaciente).subscribe(
      (historial) => {
        console.log('Historial médico recibido:', historial);
        this.historialMedico = historial.map((registro: { fecha_cita: string; hora_cita: string; }) => ({
          ...registro,
          fechaFormateada: this.formatearFecha(registro.fecha_cita),
          horaFormateada: this.formatearHora(registro.hora_cita),
          editing: false
        }));
        console.log('Historial médico formateado:', this.historialMedico);
        if (this.historialMedico.length === 0) {
          this.errorMessage = 'No se encontraron registros en el historial médico.';
        }
      },
      error => {
        this.errorMessage = 'Error al cargar el historial médico';
        console.error('Error al cargar el historial médico:', error);
      }
    );
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  }

  formatearHora(hora: string): string {
    return hora.substring(0, 5);
  }

  modificarRegistro(registro: any): void {
    registro.editing = true; 
  }

  guardarCambios(registro: any): void {
    registro.editing = false; 


    this.datesService.actualizarHistorial(registro.id, {
      diagnostico: registro.diagnostico,
      tratamiento: registro.tratamiento,
      observaciones: registro.observaciones
    }).subscribe(
      response => {
        alert('Registro actualizado con éxito');
        console.log('Registro actualizado:', response);
      },
      error => {
        console.error('Error al actualizar el registro:', error);
        alert('Hubo un error al actualizar el registro');
      }
    );
  }

  cancelarEdicion(registro: any): void {
    registro.editing = false; // Deshabilita el modo de edición sin guardar cambios

    this.cargarHistorialMedico();
  }

  eliminarRegistro(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este registro?')) {
      this.datesService.eliminarHistorial(id).subscribe(
        () => {
          this.historialMedico = this.historialMedico.filter(registro => registro.id !== id);
          alert('Registro eliminado correctamente');
        },
        error => {
          console.error('Error al eliminar el registro:', error);
          alert('Hubo un error al eliminar el registro');
        }
      );
    }
  }
  
  volverADashboard() {
    this.router.navigate(['/medico-dashboard']);
  }
}