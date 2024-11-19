// models/chat.model.ts

export interface IMensaje {
  id?: string;
  emisor_id: string;
  receptor_id: string;
  contenido: string;
  fecha: Date | string;
  tipo_emisor: 'medico' | 'paciente';
  leido?: boolean;
  estado?: 'enviado' | 'recibido' | 'leido';
  nombreRemitente?: string;

}

export interface IPaciente {
  id: string;
  nombre: string;
  imagen?: string;
}

export interface IultimoMensaje {
  contenido: string;
  fecha: Date;
  
}


export interface IChatActivo {
  id: string;
  paciente: {
    id: string;
    nombre: any;
  };
  ultimoMensaje?: {
    contenido: string;
    fecha: Date;
  };
}