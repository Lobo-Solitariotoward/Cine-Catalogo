import mongoose, { Document, Schema } from 'mongoose'

export interface IMovieDetail extends Document {
    imdb_id: string
    titulo: string
    sinopsis: string
    director: string
    reparto: string[]
    duracion: string
    idioma: string
    pais: string
    premios: string
    trailer_url: string
    tags: string[]
    cached_en: Date
}

const movieDetailSchema = new Schema<IMovieDetail>({
    imdb_id: { type: String, required: true, unique: true },
    titulo: String,
    sinopsis: String,
    director: String,
    reparto: [String],
    duracion: String,
    idioma: String,
    pais: String,
    premios: String,
    trailer_url: String,
    tags: [String],
    cached_en: { type: Date, default: Date.now }
})

export default mongoose.model<IMovieDetail>('MovieDetail', movieDetailSchema)
