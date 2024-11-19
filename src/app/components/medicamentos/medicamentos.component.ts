import { Component } from '@angular/core';
import { DatesService } from 'src/app/services/dates.service';

@Component({
  selector: 'app-medicamentos',
  templateUrl: './medicamentos.component.html',
  styleUrls: ['./medicamentos.component.css']
})
export class MedicamentosComponent {
  medicamentos: any[] = [];
  nombreMedicamento: string = '';
  loading: boolean = false;
  errorMessage: string = '';

  constructor(private datesService: DatesService) {}

  buscarMedicamentos() {
    if (!this.nombreMedicamento.trim()) {
      this.errorMessage = 'Por favor, ingrese un nombre de medicamento.';
      return;
    }

    this.loading = true;
    this.datesService.buscarMedicamentos(this.nombreMedicamento).subscribe(
      (response) => {
        this.medicamentos = response || []; // Ajusta esto según la estructura de la respuesta
        this.loading = false;
        this.errorMessage = '';
      },
      (error) => {
        console.error('Error al buscar medicamentos', error);
        this.loading = false;
        this.errorMessage = 'Error al buscar medicamentos. Intenta de nuevo más tarde.';
      }
    );
  }
}
