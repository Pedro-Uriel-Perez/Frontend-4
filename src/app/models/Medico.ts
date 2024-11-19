export interface Medico {
  apellido: any;
  id: number;
  nombre: string;
  hospital: string;
  ciudad: string;
  especialidad: string;
  disponibilidad: boolean; // un booleano para disponibilidad
  image: string;
  imagen_url: string | null;
  latitud: number; // Asegúrate de que latitud es opcional o tiene un valor por defecto
  longitud?: number;
}
