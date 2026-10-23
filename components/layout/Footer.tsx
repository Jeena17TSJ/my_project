import Link from 'next/link';
import { FaTooth, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="border-t border-blue-100 bg-blue-950 text-blue-100 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 text-white text-xl font-bold mb-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-blue-700">
              <FaTooth />
            </span>
            DentalCare
          </div>
          <p className="text-sm text-blue-100/80">Your trusted dental care partner in Bengaluru. Providing quality dental services since 2010.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Quick Links</h4>
          {[['/', 'Home'], ['/about', 'About'], ['/services', 'Services'], ['/appointment', 'Book Appointment'], ['/contact', 'Contact']].map(([href, label]) => (
            <Link key={href} href={href} className="block text-sm text-blue-100/80 hover:text-white mb-1">{label}</Link>
          ))}
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Services</h4>
          {['Teeth Whitening', 'Orthodontics', 'Dental Implants', 'Root Canal', 'Dental Cleaning'].map(s => (
            <p key={s} className="text-sm text-blue-100/80 mb-1">{s}</p>
          ))}
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Contact</h4>
          <div className="flex items-center gap-2 text-sm text-blue-100/80 mb-2"><FaMapMarkerAlt className="text-blue-300" /> 123 Health Street, Bengaluru</div>
          <div className="flex items-center gap-2 text-sm text-blue-100/80 mb-2"><FaPhone className="text-blue-300" /> +91-80-1234-5678</div>
          <div className="flex items-center gap-2 text-sm text-blue-100/80"><FaEnvelope className="text-blue-300" /> info@dentalcare.in</div>
        </div>
      </div>
      <div className="text-center text-sm text-blue-100/70 mt-8 border-t border-blue-900 pt-4">
        © 2024 DentalCare Dental Clinic. All rights reserved.
      </div>
    </footer>
  );
}
