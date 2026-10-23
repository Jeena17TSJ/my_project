import mongoose, { Schema } from 'mongoose';

const ClinicSchema = new Schema({
  name: { type: String, default: 'DentalCare Dental Clinic' },
  address: String,
  phone: String,
  email: String,
  openDays: [String],
  openTime: String,
  closeTime: String,
  about: String,
  logo: String,
  socialLinks: {
    facebook: String,
    instagram: String,
    twitter: String,
  },
}, { timestamps: true });

export default mongoose.models.Clinic || mongoose.model('Clinic', ClinicSchema);
