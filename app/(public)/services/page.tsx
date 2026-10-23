import Link from 'next/link';
import { SERVICE_CARDS, SERVICE_IMAGES } from '@/lib/constants';
import {
  FaArrowRight,
  FaCalendarCheck,
  FaClock,
  FaRupeeSign,
  FaShieldAlt,
  FaStar,
} from 'react-icons/fa';

export default function ServicesPage() {
  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-slate-950 px-6 py-16 text-white">
        <img
          src="/gallery/treatment_room.jpg"
          alt="Modern dental treatment room"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-blue-950/50" />
        <div className="relative mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-blue-100 ring-1 ring-white/15">
              <FaShieldAlt size={12} /> Complete Dental Care
            </p>
            <h1 className="mb-4 text-4xl font-extrabold leading-tight md:text-5xl">
              Treatments designed for healthier, brighter smiles
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-blue-50/90">
              Explore preventive, cosmetic, surgical, and restorative dental services delivered by experienced clinicians.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              {/* <Link
                href="/appointment"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                <FaCalendarCheck size={14} /> Book Appointment
              </Link> */}
              <a
                href="#services-list"
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                View Services <FaArrowRight size={12} />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {[
            { label: 'Expert dentists', value: 'MDS-led care' },
            { label: 'Transparent pricing', value: 'Clear ranges' },
            { label: 'Flexible visits', value: 'Fast booking' },
          ].map(item => (
            <div key={item.label} className="rounded-xl border border-gray-100 bg-gray-50 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">{item.label}</p>
              <p className="mt-1 text-lg font-bold text-gray-800">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="services-list" className="mx-auto max-w-6xl px-6 pb-16">
        <div className="mb-8 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-blue-600">Services</p>
            <h2 className="text-3xl font-bold text-gray-800">Choose the right care for your smile</h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-gray-500">
            Compare treatment options, expected time, and price range before booking your visit.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SERVICE_CARDS.map(s => (
            <article
              key={s.slug}
              className="group flex min-h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative h-52 overflow-hidden bg-blue-50">
                <img
                  src={SERVICE_IMAGES[s.slug]}
                  alt={s.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/70 to-transparent" />
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-blue-700 shadow-sm">
                  <FaStar className="text-yellow-400" size={12} /> Popular care
                </div>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h3 className="mb-2 text-xl font-bold text-gray-800">{s.title}</h3>
                <p className="mb-5 text-sm leading-relaxed text-gray-500">{s.desc}</p>

                <div className="mb-5 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-xl bg-green-50 px-3 py-2 text-green-700">
                    <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-green-600">
                      <FaRupeeSign size={10} /> Price
                    </div>
                    <p className="font-bold">{s.price}</p>
                  </div>
                  <div className="rounded-xl bg-blue-50 px-3 py-2 text-blue-700">
                    <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-blue-600">
                      <FaClock size={10} /> Time
                    </div>
                    <p className="font-bold">{s.duration}</p>
                  </div>
                </div>

                <div className="mt-auto flex gap-2">
                  <Link
                    href={`/services/${s.slug}`}
                    className="flex-1 rounded-lg border border-blue-600 py-2.5 text-center text-sm font-bold text-blue-600 transition hover:bg-blue-50"
                  >
                    Details
                  </Link>
                  <Link
                    href="/appointment"
                    className="flex-1 rounded-lg bg-blue-600 py-2.5 text-center text-sm font-bold text-white transition hover:bg-blue-700"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="flex flex-col items-start justify-between gap-5 rounded-2xl bg-blue-600 px-6 py-7 text-white md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-bold">Not sure which service you need?</h2>
            <p className="mt-1 text-sm text-blue-50">Book a consultation and our dentist will guide you to the right treatment.</p>
          </div>
          <Link
            href="/appointment"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
          >
            Schedule Consultation <FaArrowRight size={12} />
          </Link>
        </div>
      </section>
    </div>
  );
}
