// import { ITemporada } from "../model/temporada";
// import { IClub } from "../model/club";

export interface ICategoria {
  id: number
  nombre: string
  temporada: ITemporada
  equipos: number
}

export interface ITemporada {
  id: number
  descripcion: string
  club: IClub
  categorias: number
}

export interface IClub {
  id: number
  nombre: string
  direccion: string
  telefono: string
  fechaAlta: string
  imagen: any
  temporadas: number
  noticias: number
  tipoarticulos: number
  usuarios: number
}
