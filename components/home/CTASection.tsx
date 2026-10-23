import Link from 'next/link';
import { FaCalendarCheck, FaPhone } from 'react-icons/fa';

export default function CTASection() {
  return (
    <section className="py-20 px-6 bg-gradient-to-br from-blue-700 to-blue-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2" />
      </div>
      <div className="max-w-3xl mx-auto text-center relative z-10">
        <div className="text-5xl mb-4">😁</div>
        <h2 className="text-4xl font-extrabold mb-4">
          Ready for a Beautiful Smile?
        </h2>
        <p className="text-blue-200 text-lg mb-8 max-w-xl mx-auto">
          Book your appointment today.
          Your dream smile is one click away.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/appointment"
            className="flex items-center justify-center gap-2 bg-yellow-400 text-gray-900
                       px-10 py-4 rounded-full font-bold text-lg hover:bg-yellow-300 transition
                       shadow-xl shadow-yellow-500/30">
            <FaCalendarCheck /> Book Appointment
          </Link>
          <a href="tel:+918012345678"
            className="flex items-center justify-center gap-2 border-2 border-white/50
                       text-white px-10 py-4 rounded-full font-bold text-lg
                       hover:bg-white/10 transition">
            <FaPhone /> Call Us Now
          </a>
        </div>
        <p className="text-blue-300 text-sm mt-6">
          📍 123 Health Street, Koramangala, Bengaluru · Mon–Sat 9AM–7PM
        </p>
      </div>
    </section>
  );
}
