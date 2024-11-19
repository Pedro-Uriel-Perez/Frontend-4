import { Component, OnInit } from '@angular/core';
import { DatesService } from '../../services/dates.service';

@Component({
  selector: 'app-historial-paciente',
  templateUrl: './historial-paciente.component.html',
  styleUrls: ['./historial-paciente.component.css']
})
export class HistorialPacienteComponent implements OnInit {
  historialMedico: any[] = [];
  idPaciente: string = '';
  nombrePaciente: string = '';
  errorMessage: string = '';
  registroActual: any = null; // Registro actualmente en edición

  constructor(private datesService: DatesService) { }

  ngOnInit(): void {
    this.idPaciente = localStorage.getItem('userId') || '';
    this.nombrePaciente = localStorage.getItem('userName') || '';
    if (this.idPaciente) {
      this.cargarHistorialMedico();
    } else {
      this.errorMessage = 'No se encontró ID de paciente';
    }
  }

  cargarHistorialMedico(): void {
    this.datesService.getHistorialMedico(this.idPaciente).subscribe(
      (historial: any[]) => {
        this.historialMedico = historial.map(registro => ({
          ...registro,
          fechaFormateada: this.formatearFecha(registro.fecha_cita),
          horaFormateada: this.formatearHora(registro.hora_cita)
        }));
        if (this.historialMedico.length === 0) {
          this.errorMessage = 'No se encontraron registros en el historial médico.';
        }
      },
      error => {
        this.errorMessage = 'No se encontraron registros en el historial médico.';
      }
    );
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  }

  formatearHora(hora: string): string {
    return hora.substring(0, 5); // Asumiendo que la hora viene en formato HH:MM:SS
  }

  editarRegistro(registro: any): void {
    this.registroActual = { ...registro }; // Clonar el registro para edición
  }

}
