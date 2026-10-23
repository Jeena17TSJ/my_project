import Link from 'next/link';
import { SERVICE_CARDS } from '@/lib/constants';

export default function ServicesSection() {
  return (
    <section className="py-20 px-6 bg-[linear-gradient(180deg,#ffffff_0%,#f4f8ff_100%)]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="section-eyebrow mb-2">
            What We Offer
          </p>
          <h2 className="text-4xl font-bold text-slate-900 mb-3">Our Dental Services</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Comprehensive dental care for the whole family, using the latest technology.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICE_CARDS.map(s => (
            <div key={s.slug}
              className="group rounded-lg border border-brand-100 bg-white p-6
                         shadow-[0_10px_28px_rgba(1,37,125,0.08)]
                         transition-all duration-200 hover:-translate-y-1 hover:border-mint-300 hover:shadow-[0_18px_40px_rgba(1,37,125,0.15)]">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-mint-50 text-3xl ring-1 ring-mint-300 transition group-hover:bg-mint-100">{s.icon}</div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">{s.title}</h3>
              <p className="text-gray-500 text-sm mb-3">{s.desc}</p>
              <p className="text-brand-900 font-semibold text-sm mb-4">{s.price}</p>
              <div className="flex gap-2">
                <Link href={`/services/${s.slug}`}
                  className="flex-1 text-center border border-brand-200 text-brand-900 py-2
                             rounded-lg hover:border-mint-300 hover:bg-mint-50 text-sm font-medium transition">
                  Learn More
                </Link>
                <Link href="/appointment"
                  className="flex-1 text-center bg-brand-900 text-white py-2 rounded-lg
                             hover:bg-brand-800 text-sm font-medium transition">
                  Book
                </Link>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/services"
            className="inline-flex items-center gap-2 rounded-lg border border-brand-200 bg-white
                       px-8 py-3 font-semibold text-brand-900 shadow-sm hover:border-mint-300 hover:bg-mint-50 transition">
            View All Services →
          </Link>
        </div>
      </div>
    </section>
  );
}
