import { FaShieldAlt, FaUserMd, FaCalendarCheck, FaMedkit, FaSmile, FaClock } from 'react-icons/fa';

const features = [
  { icon: <FaShieldAlt />,      title: 'ISO Certified',         desc: 'Highest sterilization standards with ISO-certified equipment and procedures.' },
  { icon: <FaUserMd />,         title: 'Expert Specialists',    desc: '4 highly qualified specialists with 40+ combined years of dental experience.' },
  { icon: <FaCalendarCheck />,  title: 'Easy Online Booking',   desc: 'Book appointments 24/7 via website or AI chatbot with admin-confirmed slots.' },
  { icon: <FaMedkit />,         title: 'Emergency Care',        desc: 'Same-day emergency appointments available. Call our helpline anytime.' },
  { icon: <FaSmile />,          title: 'Painless Treatments',   desc: 'Modern anaesthesia and sedation techniques ensure a comfortable experience.' },
  { icon: <FaClock />,          title: 'Flexible Hours',        desc: 'Open 7 days a week including Sundays with extended evening hours.' },
];

export default function WhyChooseUs() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="section-eyebrow mb-2">
            Why DentalCare
          </p>
          <h2 className="text-4xl font-bold text-slate-900 mb-3">Why Choose Us?</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            We combine advanced dental technology with compassionate care.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(f => (
            <div key={f.title}
              className="flex gap-4 rounded-lg border border-brand-100 bg-brand-50/60 p-6 transition hover:border-mint-300 hover:bg-white hover:shadow-[0_14px_34px_rgba(1,37,125,0.12)]">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-white text-xl text-brand-900 ring-1 ring-mint-300">
                {f.icon}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
