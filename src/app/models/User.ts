export interface User {
    id?: number;
    nombre?: string;
    apePaterno?: string;
    apeMaterno?: string;
    description?: string;
    correo?: string;
    contrase?: string;
    edad: number | null;
    tipoSangre?: string;
    genero?: string;
    github_id?: number;
    google_id?: number;
    twitter_id?: String;   // Asegúrate de que este nombre coincida con el que usas
    twitter_token?: string;
    twitter_token_secret?: string;
  }
  
  declare global {
    namespace Express {
      interface Request {
        user?: User;
      }
    }
  }
