import Link from 'next/link';
import { FiShield, FiClock, FiHeart, FiAperture } from 'react-icons/fi';

const pillars = [
  { icon: FiShield,   title: 'Certified specialists', sub: 'MDS-qualified doctors' },
  { icon: FiAperture, title: 'Advanced technology',   sub: 'Digital X-ray & 3D scans' },
  { icon: FiHeart,    title: 'Pain-free care',         sub: 'Gentle, anxiety-free' },
  { icon: FiClock,    title: 'Flexible timings',       sub: 'Mon–Sat, 9AM–7PM' },
];

export default function AboutSection() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-14 items-center">

        {/* Image stack */}
        <div className="relative h-[420px]">
          <img
            src="/about/clinic-interior.webp"
            alt="DentalCare clinic interior"
            className="absolute top-0 left-0 w-[72%] h-[340px] object-cover rounded-2xl"
          />
          <img
            src="/about/Cosmetic-Dentistry.webp"
            alt="Modern dental equipment"
            className="absolute bottom-0 right-0 w-[52%] h-[200px] object-cover rounded-2xl
                       border-4 border-white"
          />
          {/* Founded badge */}
          <div className="absolute top-6 right-0 bg-blue-600 text-white text-center
                          px-4 py-3 rounded-xl leading-tight">
            <span className="block text-2xl font-bold">2008</span>
            <span className="text-xs font-medium">Est. since</span>
          </div>
        </div>

        {/* Text */}
        <div>
          <p className="text-blue-600 text-xs font-semibold uppercase tracking-widest mb-3">
            About us
          </p>
          <h2 className="text-3xl font-bold text-gray-800 leading-snug mb-4">
            Your trusted dental home<br />in Koramangala
          </h2>
          <p className="text-gray-500 text-[15px] leading-relaxed mb-7">
            For over 15 years, DentalCare Dental has been Bengaluru&apos;s go-to clinic for
            families and professionals alike. We combine the latest technology with a
            warm, patient-first approach — so every visit feels less like a chore and
            more like a step toward your best smile.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            {pillars.map(({ icon: Icon, title, sub }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center
                                flex-shrink-0 text-blue-600">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/about"
            className="inline-flex items-center gap-2 bg-blue-600 text-white
                       px-6 py-3 rounded-full text-sm font-semibold hover:bg-blue-700 transition"
          >
            Learn more about us →
          </Link>
        </div>

      </div>
    </section>
  );
}
