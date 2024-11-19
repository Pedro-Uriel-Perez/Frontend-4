import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DatesService } from '../../services/dates.service';
import { User } from 'src/app/models/User';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  date: User = {
    nombre: '',
    apePaterno: '',
    apeMaterno: '',
    correo: '',
    contrase: '',
    edad: null,
    tipoSangre: '',
    genero: ''
  };

  confirmarContrase: string = '';
  errorMessage: string = '';

  constructor(private datesService: DatesService, private router: Router) { }

  saveNewDate() {
    if (this.date.contrase !== this.confirmarContrase) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    console.log('Datos a enviar:', JSON.stringify(this.date));
    this.datesService.saveDate(this.date).subscribe(
      (resp) => {
        console.log('Respuesta completa del servidor:', resp);
        alert('Te has registrado exitosamente');
        this.router.navigate(['/login']);
        this.date = {
          nombre: '',
          apePaterno: '',
          apeMaterno: '',
          correo: '',
          contrase: '',
          edad: null,
          tipoSangre: '',
          genero: ''
        };
        this.confirmarContrase = '';
      },
      (err) => {
        console.error('Error completo:', err);
        if (err.error && err.error.error) {
          this.errorMessage = err.error.error;
        } else {
          this.errorMessage = 'Error al registrar usuario. Por favor, intenta nuevamente.';
        }
      }
    );
  }
}