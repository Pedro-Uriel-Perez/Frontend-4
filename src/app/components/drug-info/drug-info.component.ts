import { Component, OnInit } from '@angular/core';
import { DatesService } from '../../services/dates.service';

@Component({
  selector: 'app-drug-info',
  templateUrl: './drug-info.component.html',
  styleUrls: ['./drug-info.component.css']
})
export class DrugInfoComponent implements OnInit {
  searchTerm: string = '';
  drugInfo: any = null;
  availableDrugs: any[] = [];
  loading: boolean = false;
  error: string = '';

  constructor(private datesService: DatesService) {}

  ngOnInit() {
    this.loadAvailableDrugs();
  }

  // Añadir este método
  clearSearch() {
    this.searchTerm = '';
    this.drugInfo = null;
    this.error = '';
  }


  loadAvailableDrugs() {
    this.loading = true;
    this.datesService.getAvailableDrugs().subscribe({
      next: (drugs) => {
        this.availableDrugs = drugs;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar la lista de medicamentos';
        this.loading = false;
      }
    });
  }

  searchDrug() {
    if (!this.searchTerm) {
      this.error = 'Por favor ingrese un nombre de medicamento';
      return;
    }

    this.loading = true;
    this.error = '';
    this.drugInfo = null;

    this.datesService.searchDrug(this.searchTerm).subscribe({
      next: (data) => {
        if (data.results && data.results.length > 0) {
          const result = data.results[0];
          this.drugInfo = {
            brandName: result.openfda?.brand_name?.[0] || 'N/A',
            genericName: result.openfda?.generic_name?.[0] || 'N/A',
            manufacturer: result.openfda?.manufacturer_name?.[0] || 'N/A',
            indications: result.indications_and_usage || [],
            warnings: result.warnings || [],
            dosage: result.dosage_and_administration || []
          };
        } else {
          this.error = 'No se encontró información para este medicamento';
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = error;
        this.loading = false;
      }
    });
  }
}