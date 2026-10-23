// scripts/seed.ts
import * as dotenv from 'dotenv';
import * as path   from 'path';
import mongoose    from 'mongoose';
import dns         from 'dns';

// Fix for Node 22+ SRV DNS bug on Windows
dns.setDefaultResultOrder('ipv4first');

// Load .env.local from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not defined in .env.local');
    process.exit(1);
  }

  console.log('🔌 Connecting to MongoDB…');
  await mongoose.connect(uri, {
    family: 4,
    tls: true,
    tlsAllowInvalidCertificates: false,
    serverSelectionTimeoutMS: 10000,
    bufferCommands: false,
  });
  console.log('✅ Connected!\n');

  // ── Models (inline schemas to avoid path issues) ─────────
  const bcrypt = await import('bcryptjs');

  // User schema
  const UserSchema = new mongoose.Schema({
    name:      { type: String, required: true },
    email:     { type: String, required: true, unique: true, lowercase: true },
    password:  { type: String, required: true },
    role:      { type: String, enum: ['admin','doctor','patient','staff'], default: 'patient' },
    phone:     String,
    isActive:  { type: Boolean, default: true },
  }, { timestamps: true });

  UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.default.hash(this.password as string, 12);
    next();
  });

  const User = mongoose.models.User
    || mongoose.model('User', UserSchema);

  // Doctor schema
  const DoctorSchema = new mongoose.Schema({
    userId:          { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name:            { type: String, required: true },
    specialization:  { type: String, required: true },
    qualification:   String,
    experience:      Number,
    bio:             String,
    consultationFee: { type: Number, default: 500 },
    availableDays:   [String],
    availableSlots:  [{ day: String, slots: [String] }],
    rating:          { type: Number, default: 4.5 },
    image:           String,
    email:           String,
    phone:           String,
    isActive:        { type: Boolean, default: true },
  }, { timestamps: true });

  const Doctor = mongoose.models.Doctor
    || mongoose.model('Doctor', DoctorSchema);

  // Clinic schema
  const ClinicSchema = new mongoose.Schema({
    name:      { type: String, default: 'DentalCare Dental Clinic' },
    address:   String,
    phone:     String,
    email:     String,
    openDays:  [String],
    openTime:  String,
    closeTime: String,
    about:     String,
    logo:      String,
    socialLinks: {
      facebook:  String,
      instagram: String,
      twitter:   String,
    },
  }, { timestamps: true });

  const Clinic = mongoose.models.Clinic
    || mongoose.model('Clinic', ClinicSchema);

  // ── Seed: Admin user ──────────────────────────────────────
  const adminEmail = 'admin@dentalcare.com';
  const previousAdminEmail = 'admin@dentalcare.in';
  const existing   = await User.findOne({
    email: { $in: [adminEmail, previousAdminEmail] },
  });

  if (existing) {
    if (existing.email !== adminEmail) {
      existing.email = adminEmail;
      await existing.save();
      console.log(`✓ Admin email updated to ${adminEmail}`);
    } else {
      console.log('ℹ️  Admin already exists — skipping user seed.');
    }
  } else {
    await User.create({
      name:     'Admin User',
      email:    adminEmail,
      password: 'Admin@1234',
      role:     'admin',
      isActive: true,
    });
    console.log('✓ Admin user created');
    console.log('  Email    : admin@dentalcare.com');
    console.log('  Password : Admin@1234\n');
  }

  // ── Seed: Doctors ─────────────────────────────────────────
  const admin = await User.findOne({ email: adminEmail });
  if (admin) {
    admin.name = 'Admin User';
    admin.password = 'Admin@1234';
    admin.role = 'admin';
    admin.isActive = true;
    await admin.save();
    console.log('Admin login refreshed: admin@dentalcare.com / Admin@1234\n');
  }

  const seededDoctorPassword = 'Doctor@2026';
  const DOCTORS = [
    {
      name:            'Dr. Priya Sharma',
      email:           'priya.sharma@dentalcare.com',
      phone:           '+91 90000 10001',
      specialization:  'General & Cosmetic Dentistry',
      qualification:   'BDS, MDS – Prosthodontics',
      experience:      12,
      consultationFee: 500,
      rating:          4.8,
      availableDays:   ['Monday', 'Wednesday', 'Friday'],
      availableSlots: [
        { day: 'Monday',    slots: ['9:00 AM','10:00 AM','11:00 AM','2:00 PM','3:00 PM','4:00 PM'] },
        { day: 'Wednesday', slots: ['9:00 AM','10:00 AM','11:00 AM','2:00 PM','3:00 PM','4:00 PM'] },
        { day: 'Friday',    slots: ['9:00 AM','10:00 AM','11:00 AM','2:00 PM','3:00 PM']           },
      ],
      bio: 'Dr. Priya Sharma is a highly experienced general and cosmetic dentist with over 12 years of practice. She specialises in smile makeovers and restorative dentistry.',
    },
    {
      name:            'Dr. Arjun Mehta',
      email:           'arjun.mehta@dentalcare.com',
      phone:           '+91 90000 10002',
      specialization:  'Orthodontics',
      qualification:   'BDS, MDS – Orthodontics',
      experience:      8,
      consultationFee: 700,
      rating:          4.7,
      availableDays:   ['Tuesday', 'Thursday', 'Saturday'],
      availableSlots: [
        { day: 'Tuesday',  slots: ['10:00 AM','11:00 AM','2:00 PM','3:00 PM','5:00 PM'] },
        { day: 'Thursday', slots: ['10:00 AM','11:00 AM','2:00 PM','3:00 PM','5:00 PM'] },
        { day: 'Saturday', slots: ['9:00 AM','10:00 AM','11:00 AM','12:00 PM']          },
      ],
      bio: 'Dr. Arjun Mehta is an orthodontic specialist with expertise in metal braces, ceramic braces and clear aligners for patients of all ages.',
    },
    {
      name:            'Dr. Sneha Rao',
      email:           'sneha.rao@dentalcare.com',
      phone:           '+91 90000 10003',
      specialization:  'Oral Surgery & Implants',
      qualification:   'BDS, MDS – Oral & Maxillofacial Surgery',
      experience:      15,
      consultationFee: 800,
      rating:          4.9,
      availableDays:   ['Monday', 'Tuesday', 'Thursday'],
      availableSlots: [
        { day: 'Monday',   slots: ['9:00 AM','10:00 AM','3:00 PM','4:00 PM','5:00 PM'] },
        { day: 'Tuesday',  slots: ['9:00 AM','10:00 AM','3:00 PM','4:00 PM']           },
        { day: 'Thursday', slots: ['10:00 AM','11:00 AM','3:00 PM','4:00 PM','5:00 PM'] },
      ],
      bio: 'Dr. Sneha Rao is a veteran oral surgeon with 15 years of experience in dental implants, wisdom tooth extractions and complex surgical procedures.',
    },
    {
      name:            'Dr. Rohan Patel',
      email:           'rohan.patel@dentalcare.com',
      phone:           '+91 90000 10004',
      specialization:  'Pediatric Dentistry',
      qualification:   'BDS, MDS – Pedodontics',
      experience:      6,
      consultationFee: 400,
      rating:          4.6,
      availableDays:   ['Wednesday', 'Friday', 'Saturday'],
      availableSlots: [
        { day: 'Wednesday', slots: ['9:00 AM','10:00 AM','11:00 AM','2:00 PM','3:00 PM'] },
        { day: 'Friday',    slots: ['9:00 AM','10:00 AM','11:00 AM','2:00 PM','3:00 PM'] },
        { day: 'Saturday',  slots: ['9:00 AM','10:00 AM','11:00 AM']                      },
      ],
      bio: 'Dr. Rohan Patel specialises in paediatric dentistry, creating a gentle and friendly environment for young patients to ensure a positive dental experience.',
    },
  ];

  let doctorsCreated = 0;
  for (const doc of DOCTORS) {
    const email = doc.email.toLowerCase();
    let doctorUser = await User.findOne({ email });

    if (!doctorUser) {
      doctorUser = await User.create({
        name:     doc.name,
        email,
        password: seededDoctorPassword,
        phone:    doc.phone,
        role:     'doctor',
        isActive: true,
      });
    } else {
      doctorUser.name = doc.name;
      doctorUser.phone = doc.phone;
      doctorUser.role = 'doctor';
      doctorUser.password = seededDoctorPassword;
      doctorUser.isActive = true;
      await doctorUser.save();
    }

    const exists = await Doctor.findOne({ name: doc.name });
    if (!exists) {
      await Doctor.create({
        ...doc,
        email,
        userId: doctorUser._id,
        isActive: true,
      });
      console.log(`✓ Doctor: ${doc.name}`);
      doctorsCreated++;
    } else {
      await Doctor.findByIdAndUpdate(exists._id, {
        ...doc,
        email,
        userId: doctorUser._id,
        isActive: true,
      });
      console.log(`ℹ️  Doctor already exists: ${doc.name}`);
    }
  }
  if (doctorsCreated > 0) console.log(`\n✓ ${doctorsCreated} doctor(s) created.\n`);

  // ── Seed: Clinic ──────────────────────────────────────────
  console.log('Doctor logins:');
  for (const doc of DOCTORS) {
    console.log(`  ${doc.name}: ${doc.email} / ${seededDoctorPassword}`);
  }
  console.log('');

  const clinicExists = await Clinic.findOne({});
  if (!clinicExists) {
    await Clinic.create({
      name:     'DentalCare Dental Clinic',
      address:  '123 Health Street, Koramangala, Bengaluru 560034',
      phone:    '+91-80-1234-5678',
      email:    'info@dentalcare.in',
      openDays: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
      openTime: '09:00',
      closeTime:'19:00',
      about:    "DentalCare Dental Clinic has been Bengaluru's most trusted dental care provider since 2010. We combine advanced technology with compassionate care.",
      socialLinks: {
        facebook:  'https://facebook.com/dentalcare',
        instagram: 'https://instagram.com/dentalcare',
        twitter:   'https://twitter.com/dentalcare',
      },
    });
    console.log('✓ Clinic settings created.\n');
  } else {
    console.log('ℹ️  Clinic already exists — skipping.\n');
  }

  // ── Done ──────────────────────────────────────────────────
  console.log('══════════════════════════════════════');
  console.log('  ✅  Seed complete!');
  console.log('══════════════════════════════════════');
  console.log('  Admin login:');
  console.log('  URL      → http://localhost:3000/login');
  console.log('  Email    → admin@dentalcare.com');
  console.log('  Password → Admin@1234');
  console.log('══════════════════════════════════════\n');

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('\n❌ Seed failed:', err.message);
  mongoose.disconnect();
  process.exit(1);
});


// Email: priya.sharma@dentalcare.com
// Password: Priya@2026


// I need to address the user's issue regarding SMS or WhatsApp notifications not being sent after admin approval.
// patient can also view the record is generated by the doctor