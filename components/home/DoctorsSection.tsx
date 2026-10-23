import Link from 'next/link';
import { FaStar } from 'react-icons/fa';
import { FiCalendar } from 'react-icons/fi';

interface DoctorCard {
  _id: string;
  name: string;
  specialization: string;
  qualification?: string;
  experience?: number;
  bio?: string;
  consultationFee?: number;
  availableDays?: string[];
  rating?: number;
  image?: string;
}

interface DoctorsSectionProps {
  doctors: DoctorCard[];
}

export default function DoctorsSection({ doctors }: DoctorsSectionProps) {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-blue-600 font-semibold text-xs uppercase tracking-widest mb-2">
            Our Team
          </p>
          <h2 className="text-4xl font-bold text-gray-800 mb-3">Meet our doctors</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Highly qualified specialists committed to your oral health.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {doctors.map(d => {
            const badgeText = d.specialization || 'Dentist';
            const subtitle  = d.qualification ? `${badgeText} · ${d.qualification}` : badgeText;
            const days      = d.availableDays?.join(', ') || 'Mon–Sat';
            const expLabel  = typeof d.experience === 'number' ? `${d.experience} yrs` : 'Experienced';
            const rating    = d.rating?.toFixed(1) || '4.5';

            return (
              <div
                key={d._id}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden
                           hover:-translate-y-1 transition-all duration-200 flex flex-col"
              >
                <div className="relative h-56 overflow-hidden bg-blue-50 flex items-center justify-center">
                  {d.image ? (
                    <img
                      src={d.image}
                      alt={d.name}
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-blue-100 text-blue-700 text-4xl font-bold">
                      {d.name.split(' ').slice(-2).map(part => part[0]).join('')}
                    </div>
                  )}
                  <span className="absolute bottom-2.5 left-2.5 bg-white/90 text-blue-700
                                    text-xs font-semibold px-3 py-1 rounded-full border border-blue-100">
                    {badgeText}
                  </span>
                </div>

                <div className="p-4 flex flex-col gap-2 flex-1">
                  <h3 className="font-semibold text-gray-800 text-sm">{d.name}</h3>
                  <p className="text-sm text-gray-500">{subtitle}</p>

                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <FaStar className="text-yellow-400" />
                    <span className="font-semibold text-gray-700">{rating}</span>
                    <span>· {expLabel} experience</span>
                  </div>

                  <p className="text-xs text-gray-500 line-clamp-2">{d.bio || 'Dedicated to delivering compassionate dental care.'}</p>

                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <FiCalendar className="text-gray-400" />
                    {days}
                  </div>

                  <Link
                    href={{
                      pathname: '/appointment',
                      query: { doctorId: d._id, doctorName: d.name },
                    }}
                    className="mt-auto block text-center bg-blue-600 text-white py-2.5
                               rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
                  >
                    Book appointment
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
