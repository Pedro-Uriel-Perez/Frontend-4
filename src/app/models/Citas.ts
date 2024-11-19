
export interface Citas {
  idcita: number;
  IdMedico: number;  
  idPaciente: string;
  nombrePaciente: string;


  descripcion: string;
  fecha: string;
  hora: string;
  nombreMedico?: string;
  especialidad?: string;
  hospital?: string;
  telefonoMedico?: string;
  correoMedico?: string;
  duracionEstimada?: string;
  imagenMedico?: string;  // imagen dl medcido
  fechaFormateada?: string;  // para la versión formateada de la fecha
  horaFormateada?: string;   // para la versión formateada de la hora
  
  //para las citas
  esPasada?: boolean;
  tieneHistorial?: boolean;
  
  puedeModificar?: boolean;
  estaFinalizada?: boolean;
  estado: 'pendiente' | 'confirmada' | 'finalizada' | 'cancelada';
}




