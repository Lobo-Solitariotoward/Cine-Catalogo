import mongoose, { Document, Schema } from 'mongoose'

export interface IActivityLog extends Document {
    usuario_id: number
    accion: string
    detalle: any
    timestamp: Date
}

const activityLogSchema = new Schema<IActivityLog>({
    usuario_id: { type: Number, required: true },
    accion: { type: String, required: true },
    detalle: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now }
})

export default mongoose.model<IActivityLog>('ActivityLog', activityLogSchema)
