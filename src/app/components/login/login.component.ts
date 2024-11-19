import { Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DatesService } from '../../services/dates.service';
import { SocialAuthService } from "@abacritt/angularx-social-login";
import { FacebookLoginProvider, GoogleLoginProvider } from "@abacritt/angularx-social-login";


declare var google: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  correo: string = '';
  contrase: string = '';
  errorMessage: string = '';
  user: any;
  loggedIn: any;


  constructor(
    private datesService: DatesService, 
    private router: Router, 
    private ngZone: NgZone,
    private authService: SocialAuthService
  ) { }



  signInWithFB(): void {
    this.authService.signIn(FacebookLoginProvider.PROVIDER_ID).then(
      (userData) => {
        console.log('FB user: ', userData);
        const fbUser = {
          ...userData,
          provider: 'FACEBOOK'
        };
        this.datesService.setCurrentUser(fbUser);
        this.datesService.procesarLoginFacebook(fbUser).subscribe(
          response => {
            if (response.emailSent) {
              this.mostrarMensaje('Inicio de sesión exitoso.');
            } else {
              this.mostrarMensaje('Inicio de sesión exitoso, pero hubo un problema al enviar el correo de notificación.');
            }
            // Modificar esta línea para incluir los parámetros en la URL
            this.router.navigate(['/citas', userData.id, encodeURIComponent(userData.name)]);
          },
          error => {
            console.error('Error en el login de Facebook:', error);
            this.mostrarMensaje('Error al procesar el inicio de sesión con Facebook.');
          }
        );  
      }
    ).catch(
      error => {
        console.error('Error en el login de Facebook:', error);
        this.mostrarMensaje('Error al iniciar sesión con Facebook.');
      }
    );
  }
  
  mostrarMensaje(mensaje: string) {
    // Implementa esto según cómo quieras mostrar los mensajes en tu interfaz
    // Podría ser un alert, un snackbar, un modal, etc.
    alert(mensaje);
  }

  private handleFacebookLogin(userData: any) {
    // Aquí procesamos los datos del usuario de Facebook
    const userInfo = {
      id: userData.id,
      nombre: userData.name,
      correo: userData.email,
      // Puedes agregar más campos según lo que necesites
    };

    // Guardamos la información del usuario en el servicio o localStorage
    this.datesService.setCurrentUser(userInfo);

    // Redirigimos al usuario a la página de citas
    this.router.navigate(['/citas']);
  }


 

  

  ngOnInit(){
    this.authService.authState.subscribe((user) => {
      this.user = user;
      this.loggedIn = (user != null);
      console.log(this.user);
    });
  }


  

  onLogin(): void {
    this.datesService.login({ correo: this.correo, contrase: this.contrase }).subscribe(
      (response: any) => {
        if (response.isAuthenticated) {
          this.handleSuccessfulLogin(response);
        } else {
          this.errorMessage = 'Correo o contraseña incorrectos';
        }
      },
      (error) => {
        console.error('Error al autenticar usuario:', error);
        this.errorMessage = 'Error al autenticar usuario: ' + error.message;
      }
    );
  }

  loginWithGitHub(): void {
    this.datesService.loginWithGitHub();
  }

  private handleSuccessfulLogin(response: any): void {
    console.log('Usuario autenticado exitosamente');
    localStorage.setItem('userId', response.userId);
    localStorage.setItem('userName', response.userName);
    this.ngZone.run(() => {
      this.router.navigate(['/citas', { userId: response.userId, userName: response.userName }]);
    });
  }

//para facebok

signOut(): void {
  this.authService.signOut();
}
}


