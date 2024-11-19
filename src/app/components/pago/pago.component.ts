import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pago',
  templateUrl: './pago.component.html',
  styleUrls: ['./pago.component.css']
})
export class PagoComponent {
  constructor(private router: Router) {}

  seleccionarPaquete(monto: number) {
    this.router.navigate(['/hospital'], { queryParams: { monto: monto } });
  }
}