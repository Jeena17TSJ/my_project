import Link from 'next/link';
import { FaTooth, FaCalendarCheck, FaPhone } from 'react-icons/fa';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_78%_18%,rgba(0,255,255,0.24),transparent_28%),linear-gradient(180deg,#f4f8ff_0%,#ecffff_48%,#ffffff_100%)] px-6 py-20 text-slate-900">
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="flex flex-col items-center gap-12 md:flex-row">
          <div className="flex-1">
            <div className="mb-6 inline-flex items-center gap-2 rounded-lg border border-mint-200 bg-white/90 px-4 py-2 text-sm font-semibold text-brand-900 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-mint-400" />
              Now Accepting New Patients
            </div>
            <h1 className="mb-4 text-5xl font-extrabold leading-tight text-slate-950 md:text-6xl">
              Your Smile is Our
              <span className="block text-brand-900">Priority</span>
            </h1>
            <p className="mb-8 max-w-lg text-lg leading-relaxed text-slate-600">
              World-class dental care with the latest technology. Book your
              appointment today and experience painless, professional treatment.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/appointment" className="clinic-button px-8 py-3.5 text-base">
                <FaCalendarCheck /> Book Appointment
              </Link>
              <Link href="/services" className="clinic-button-outline px-8 py-3.5 text-base">
                Our Services
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-2 text-sm text-brand-900">
              <FaPhone size={13} />
              <span>
                Emergency: <strong className="text-brand-900">+91-80-9999-0000</strong>
              </span>
            </div>
          </div>

          <div className="flex flex-1 justify-center">
            <div className="relative w-full max-w-md pb-8">
              <div className="overflow-hidden rounded-lg border border-brand-100 bg-white p-2 shadow-[0_24px_70px_rgba(1,37,125,0.20)]">
                <img
                  src="/herosection/dentalsmile.jpg"
                  alt="DentalCare clinic reception"
                  className="h-[360px] w-full rounded-lg object-cover"
                />
              </div>
              <div className="absolute bottom-0 left-5 right-5 rounded-lg border border-mint-300 bg-white/95 p-4 shadow-[0_16px_40px_rgba(1,37,125,0.18)] backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-900 text-white ring-2 ring-mint-300">
                    <FaTooth />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">10,000+ patients treated</p>
                    <p className="text-sm text-slate-500">Trusted family dental care since 2010</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
