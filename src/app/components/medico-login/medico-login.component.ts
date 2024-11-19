import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DatesService } from '../../services/dates.service';

@Component({
  selector: 'app-medico-login',
  templateUrl: './medico-login.component.html',
  styleUrls: ['./medico-login.component.css']
})
export class MedicoLoginComponent {
  correo: string = '';
  id: string = '';
  errorMessage: string = '';

  constructor(private datesService: DatesService, private router: Router) { }

  onSubmit() {
    this.datesService.medicoLogin(this.correo, this.id).subscribe(
      (response) => {
        if (response.isAuthenticated) {
          localStorage.setItem('medicoId', response.medicoId);
          localStorage.setItem('medicoNombre', response.medicoNombre);
          localStorage.setItem('medicoApellido', response.medicoApellido);
          localStorage.setItem('medicoEspecialidad', response.especialidad);
          localStorage.setItem('medicoHospital', response.hospital);
          
          this.router.navigate(['/medico-dashboard']);
        } else {
          this.errorMessage = 'Credenciales inválidas';
        }
      },
      (error) => {
        console.error('Error en el login:', error);
        this.errorMessage = 'Error al intentar iniciar sesión';
      }
    );
  }
}