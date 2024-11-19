import { Component, OnInit } from '@angular/core';
import { DatesService } from '../../services/dates.service';

@Component({
  selector: 'app-mis-citas',
  templateUrl: './mis-citas.component.html',
  styleUrls: ['./mis-citas.component.css']
})
export class MisCitasComponent implements OnInit {
  citas: any[] = [];
  idPaciente: string = '';

  constructor(private datesService: DatesService) { }

  ngOnInit(): void {
    this.idPaciente = localStorage.getItem('userId') || '';
    this.cargarCitas();
  }

  cargarCitas(): void {
    if (this.idPaciente) {
      this.datesService.getCitasPaciente(this.idPaciente).subscribe(
        (data) => {
          this.citas = data.map(cita => ({
            ...cita,
            fechaFormateada: this.formatearFecha(cita.fecha),
            horaFormateada: this.formatearHora(cita.hora)
          }));
        },
        (error) => {
          console.error('Error al cargar citas:', error);
        }
      );
    }
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  }

  formatearHora(hora: string): string {
    return hora.substring(0, 5); // Asumiendo que la hora viene en formato HH:MM:SS
  }
}