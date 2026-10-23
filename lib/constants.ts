// export const SERVICES = [
//   'Dental Cleaning',
//   'Teeth Whitening',
//   'Root Canal Treatment',
//   'Dental Implants',
//   'Orthodontics',
//   'Tooth Extraction',
//   'Cavity Filling',
//   'Dental Crown',
//   'Dental Veneer',
//   'Gum Treatment',
//   'Pediatric Checkup',
//   'Dental X-Ray',
//   'Cosmetic Dentistry',
//   'Smile Makeover',
//   'Dental Bonding',
// ];

export const SERVICE_CARDS = [
  {
    slug: 'teeth-whitening',
    icon: '',
    title: 'Teeth Whitening',
    price: 'Rs. 3,000-6,000',
    duration: '60-90 min',
    desc: 'Brighten your smile with our professional-grade whitening treatments.',
  },
  {
    slug: 'orthodontics',
    icon: '',
    title: 'Orthodontics',
    price: 'Rs. 25,000-60,000',
    duration: '12-24 months',
    desc: 'Correct misaligned teeth and bite issues with braces or clear aligners.',
  },
  {
    slug: 'dental-implants',
    icon: '',
    title: 'Dental Implants',
    price: 'Rs. 25,000-40,000',
    duration: '3-6 months',
    desc: 'Replace missing teeth with permanent, natural-looking implants.',
  },
  {
    slug: 'root-canal',
    icon: '',
    title: 'Root Canal Treatment',
    price: 'Rs. 5,000-12,000',
    duration: '1-2 sessions',
    desc: 'Save your infected tooth with our painless root canal procedure.',
  },
  {
    slug: 'dental-cleaning',
    icon: '',
    title: 'Dental Cleaning',
    price: 'Rs. 800-1,200',
    duration: '30-45 min',
    desc: 'Professional scaling and polishing for a fresh, plaque-free smile.',
  },
  {
    slug: 'cosmetic-dentistry',
    icon: '',
    title: 'Cosmetic Dentistry',
    price: 'Rs. 4,000-15,000',
    duration: 'Varies',
    desc: 'Veneers, bonding, and smile makeovers to enhance your appearance.',
  },
];

export const SERVICE_IMAGES: Record<string, string> = {
  'teeth-whitening': '/services/teeth-whitening.jpg',
  orthodontics: '/services/Orthodontics.jpg',
  'dental-implants': '/services/Dental%20Implants.jpg',
  'root-canal': '/services/Root%20Canal%20Treatment.jpeg',
  'dental-cleaning': '/services/Dental%20Cleaning.jpg',
  'cosmetic-dentistry': '/services/Cosmetic%20Dentistry.jpg',
};

export const SERVICE_OPTIONS = SERVICE_CARDS.map(s => s.title);

export const SERVICE_PRICES: Record<string, { min: number; max: number }> = {
  'Dental Cleaning':        { min: 800,   max: 1200  },
  'Teeth Whitening':        { min: 3000,  max: 6000  },
  'Root Canal Treatment':   { min: 5000,  max: 12000 },
  'Dental Implants':        { min: 25000, max: 40000 },
  'Orthodontics':           { min: 25000, max: 60000 },
  'Tooth Extraction':       { min: 500,   max: 2000  },
  'Cavity Filling':         { min: 800,   max: 2500  },
  'Dental Crown':           { min: 4000,  max: 8000  },
  'Dental Veneer':          { min: 8000,  max: 15000 },
  'Gum Treatment':          { min: 2000,  max: 8000  },
  'Pediatric Checkup':      { min: 400,   max: 800   },
  'Dental X-Ray':           { min: 300,   max: 600   },
  'Cosmetic Dentistry':     { min: 4000,  max: 15000 },
  'Smile Makeover':         { min: 20000, max: 80000 },
  'Dental Bonding':         { min: 2000,  max: 5000  },
};

export const TIME_SLOTS = [
  '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '2:00 PM',  '3:00 PM',
  '4:00 PM',  '5:00 PM',  '6:00 PM',
];

export const DAYS_OF_WEEK = [
  'Monday','Tuesday','Wednesday',
  'Thursday','Friday','Saturday','Sunday',
];

export const BLOOD_GROUPS = ['A+','A-','B+','B-','O+','O-','AB+','AB-'];

export const ROLES = ['admin','doctor','patient','staff'] as const;
export type Role = typeof ROLES[number];

export const APPOINTMENT_STATUSES = [
  'pending','confirmed','completed','cancelled',
] as const;
export type AppointmentStatus = typeof APPOINTMENT_STATUSES[number];

export const NOTIFICATION_TYPES = [
  'appointment','reminder','general',
] as const;

export const DOCTORS_SEED = [
  {
    name:            'Dr. Priya Sharma',
    specialization:  'General & Cosmetic Dentistry',
    qualification:   'BDS, MDS - Prosthodontics',
    experience:      12,
    consultationFee: 500,
    rating:          4.8,
    availableDays:   ['Monday','Wednesday','Friday'],
    bio: 'Dr. Priya Sharma is a highly experienced general and cosmetic dentist with over 12 years of practice. She specialises in smile makeovers and restorative dentistry.',
  },
  {
    name:            'Dr. Arjun Mehta',
    specialization:  'Orthodontics',
    qualification:   'BDS, MDS - Orthodontics',
    experience:      8,
    consultationFee: 700,
    rating:          4.7,
    availableDays:   ['Tuesday','Thursday','Saturday'],
    bio: 'Dr. Arjun Mehta is an orthodontic specialist with expertise in metal braces, ceramic braces and clear aligners for patients of all ages.',
  },
  {
    name:            'Dr. Sneha Rao',
    specialization:  'Oral Surgery & Implants',
    qualification:   'BDS, MDS - Oral & Maxillofacial Surgery',
    experience:      15,
    consultationFee: 800,
    rating:          4.9,
    availableDays:   ['Monday','Tuesday','Thursday'],
    bio: 'Dr. Sneha Rao is a veteran oral surgeon with 15 years of experience in dental implants, wisdom tooth extractions and complex surgical procedures.',
  },
  {
    name:            'Dr. Rohan Patel',
    specialization:  'Pediatric Dentistry',
    qualification:   'BDS, MDS - Pedodontics',
    experience:      6,
    consultationFee: 400,
    rating:          4.6,
    availableDays:   ['Wednesday','Friday','Saturday'],
    bio: 'Dr. Rohan Patel specialises in paediatric dentistry, creating a gentle and friendly environment for young patients to ensure a positive dental experience.',
  },
];

export const CLINIC_INFO = {
  name:    'DentalCare Dental Clinic',
  address: '123 Health Street, Koramangala, Bengaluru 560034',
  phone:   '+91 83108 97655',
  email:   'info@dentalcare.in',
  hours:   'Mon-Sat: 9AM-7PM | Sunday: 10AM-2PM',
  emergency: '+91-80-9999-0000',
};

export const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-700 border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};

export const ROLE_COLORS: Record<string, string> = {
  admin:   'bg-purple-100 text-purple-700',
  doctor:  'bg-blue-100 text-blue-700',
  patient: 'bg-green-100 text-green-700',
  staff:   'bg-yellow-100 text-yellow-700',
};
