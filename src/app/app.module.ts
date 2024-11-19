import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavigationComponent } from './components/navigation/navigation.component';
import { DateListComponent } from './components/date-list/date-list.component';
import { LoginComponent } from './components/login/login.component';
import { ServicesComponent } from './components/services/services.component';
import { HomeComponent } from './components/home/home.component';
import { SignupComponent } from './components/signup/signup.component';
import { ContactComponent } from './components/contact/contact.component';
import { SpecialtiesComponent } from './components/specialties/specialties.component';
import { PatientsComponent } from './components/patients/patients.component';
import { MedicoComponent } from './components/medico/medico.component';
import { MedicoLoginComponent } from './components/medico-login/medico-login.component';
import { CitasComponent } from './components/citas/citas.component';
import { MisCitasComponent } from './components/mis-citas/mis-citas.component';
import { HistorialMedicoComponent } from './components/historial-medico/historial-medico.component';
import { VerCitasComponent } from './components/ver-citas/ver-citas.component';
import { MedicoDashboardComponent } from './components/medico-dashboard/medico-dashboard.component';
import { PagoComponent } from './components/pago/pago.component';
import { MetodoPagoComponent } from './components/metodo-pago/metodo-pago.component';
import { HospitalComponent } from './components/hospital/hospital.component';
import { HistorialPacienteComponent } from './components/historial-paciente/historial-paciente.component';
import { GeolocalizacionComponent } from './components/geolocalizacion/geolocalizacion.component';

import { DatesService } from './services/dates.service';
import { AuthCallbackComponent } from './components/auth-callback/auth-callback.component';

import { SocialLoginModule, SocialAuthServiceConfig } from '@abacritt/angularx-social-login';
import {GoogleLoginProvider,FacebookLoginProvider} from '@abacritt/angularx-social-login';

import { DrugInfoComponent } from './components/drug-info/drug-info.component';
import { MedicamentosComponent } from './components/medicamentos/medicamentos.component';
import { SpotifyCallbackComponent } from './components/spotify-callback/spotify-callback.component';
import { WaitingRoomMusicComponent } from './components/waiting-room-music/waiting-room-music.component';
import { ChatComponent } from './components/chat/chat.component';
import { BuscadorComponent } from './components/buscador/buscador.component';


@NgModule({
  declarations: [

    AppComponent,
    NavigationComponent,
    DateListComponent,
    LoginComponent,
    ServicesComponent,
    HomeComponent,
    SignupComponent,
    ContactComponent,
    SpecialtiesComponent,
    PatientsComponent,
    MedicoComponent,
    MedicoLoginComponent,
    CitasComponent,
    MisCitasComponent,
    HistorialMedicoComponent,
    VerCitasComponent,
    MedicoDashboardComponent,
    PagoComponent,
    MetodoPagoComponent,
    HospitalComponent,
    HistorialPacienteComponent,
    GeolocalizacionComponent,
    AuthCallbackComponent,
    DrugInfoComponent,
    MedicamentosComponent,
    SpotifyCallbackComponent,
    WaitingRoomMusicComponent,
    ChatComponent,
    BuscadorComponent,
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    IonicModule.forRoot(),
    SocialLoginModule,
  ],
  providers: [
    DatesService,
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              'clientId'
            )
          },
          {
            id: FacebookLoginProvider.PROVIDER_ID,
            provider: new FacebookLoginProvider('1053805465895871')
          }
        ],
        onError: (err) => {
          console.error(err);
        }
      } as SocialAuthServiceConfig,
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }