
import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ServicesComponent } from './components/services/services.component';
import { HomeComponent } from './components/home/home.component';
import { ContactComponent } from './components/contact/contact.component';
import { SpecialtiesComponent } from './components/specialties/specialties.component';
import { SignupComponent } from './components/signup/signup.component';
import { PatientsComponent } from './components/patients/patients.component';
import { MedicoComponent } from './components/medico/medico.component';
import { MedicoLoginComponent } from './components/medico-login/medico-login.component';
import { Citas } from './models/Citas';
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
import { AuthCallbackComponent } from './components/auth-callback/auth-callback.component';
import { DrugInfoComponent } from './components/drug-info/drug-info.component';
import { MedicamentosComponent } from './components/medicamentos/medicamentos.component';
import { SpotifyCallbackComponent } from './components/spotify-callback/spotify-callback.component';
import { WaitingRoomMusicComponent } from './components/waiting-room-music/waiting-room-music.component';
import { User } from './models/User';
import { ChatComponent } from './components/chat/chat.component';
import { BuscadorComponent } from './components/buscador/buscador.component';


const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  
  { path: 'services', component: ServicesComponent },
  
  { path: 'login', component: LoginComponent },
  
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  { path: 'home', component: HomeComponent },

  {path: 'contact', component: ContactComponent},
  
  {path: 'specialties', component: SpecialtiesComponent},
  
  {path:'signup', component: SignupComponent},
  
  {path: 'patients', component: PatientsComponent},
  
  {path: 'medico',component: MedicoComponent},




  //Para las citas medicas     // es lo que va a ver el cliente

  {path:  'citas', component: CitasComponent},

  { path: 'citas/:userId/:userName', component: CitasComponent },


  { path: 'mis-citas', component: MisCitasComponent },
  { path: 'historial-medico', component: HistorialMedicoComponent },
  {path: 'historial-paciente', component: HistorialPacienteComponent},


  { path: 'citas', component: CitasComponent },
  { path: 'ver-citas', component: VerCitasComponent },


  //para los medicos login y ver sus citas

  { path: 'medico-login', component: MedicoLoginComponent },
  { path: 'medico-dashboard', component: MedicoDashboardComponent },


  { path: 'pago', component: PagoComponent },

  { path: 'metodo-pago', component: MetodoPagoComponent},

  { path: 'hospital', component: HospitalComponent},


  { path: 'citas/:userId/:userName', component: CitasComponent },

  { path: 'ver-citas', component: VerCitasComponent },

  {
    path: 'ver-citas/:userId/:userName', component: VerCitasComponent
  },

    { path: 'historial-medico/:idPaciente/:nombrePaciente', component: HistorialMedicoComponent },




    ///para la grolocalizacion

    { path: 'geolocalizacion', component: GeolocalizacionComponent },

    { path: 'auth-callback', component: AuthCallbackComponent },
    

    //informacion de medicinas
    { path: 'drug-info', component: DrugInfoComponent },

    {path: 'medicamentos', component: MedicamentosComponent},

    // para spotyfy
    { path: 'spotify-callback', component: SpotifyCallbackComponent },

    // Para chat

    {path: 'chat', component: ChatComponent},

    { path: 'buscador', component: BuscadorComponent}







  ];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

