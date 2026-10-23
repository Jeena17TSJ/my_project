// dental-clinic\models\Appointment.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  patientId?:   mongoose.Types.ObjectId;
  patientUserId?: mongoose.Types.ObjectId;
  doctorId?:    mongoose.Types.ObjectId;
  patientName:  string;
  doctorName:   string;
  service:      string;
  date:         Date;
  timeSlot:     string;
  status:       'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?:       string;
  fee?:         number;
  email?:       string;
  phone?:       string;
  bookedVia:    'website' | 'chatbot' | 'admin' | 'patient';
  reminderSent: boolean;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    patientId:    { type: Schema.Types.ObjectId, ref: 'Patient' },
    patientUserId:{ type: Schema.Types.ObjectId, ref: 'User' },
    doctorId:     { type: Schema.Types.ObjectId, ref: 'Doctor'  },
    patientName:  { type: String, required: true },
    doctorName:   { type: String, default: ''    },
    service:      { type: String, required: true },
    date:         { type: Date,   required: true  },
    timeSlot:     { type: String, required: true  },
    status: {
      type:    String,
      enum:    ['pending','confirmed','completed','cancelled'],
      default: 'pending',
    },
    notes:        { type: String, default: '' },
    fee:          { type: Number, default: 0  },
    email:        { type: String, default: '' },
    phone:        { type: String, default: '' },
    bookedVia:    { type: String, default: 'website' },
    reminderSent: { type: Boolean, default: false    },
  },
  { timestamps: true }
);

// One active booking per doctor per slot per day.
// App routes check first for friendly errors; these indexes are the race-condition safety net.
AppointmentSchema.index(
  { doctorId: 1, date: 1, timeSlot: 1 },
  {
    name: 'unique_active_doctor_slot_by_id',
    unique: true,
    partialFilterExpression: {
      doctorId: { $exists: true },
      status: { $in: ['pending', 'confirmed', 'completed'] },
    },
  }
);

AppointmentSchema.index(
  { doctorName: 1, date: 1, timeSlot: 1 },
  {
    name: 'unique_active_doctor_slot_by_name',
    unique: true,
    partialFilterExpression: {
      doctorName: { $exists: true },
      status: { $in: ['pending', 'confirmed', 'completed'] },
    },
  }
);

export default mongoose.models.Appointment
  || mongoose.model<IAppointment>('Appointment', AppointmentSchema);
