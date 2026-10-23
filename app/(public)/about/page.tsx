import { FaTooth, FaAward, FaUserMd, FaHeart } from 'react-icons/fa';

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-6 text-center">
        <FaTooth className="text-5xl mx-auto mb-4 text-yellow-300" />
        <h1 className="text-4xl font-bold mb-3">About DentalCare</h1>
        <p className="text-blue-100 max-w-2xl mx-auto text-lg">
          Bengaluru&apos;s most trusted dental clinic since 2010. We combine cutting-edge technology with compassionate care to give you the best dental experience.
        </p>
      </section>

      {/* Mission */}
      <section className="max-w-5xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: <FaHeart className="text-red-500 text-3xl" />, title: 'Our Mission', desc: 'To provide world-class dental care that is accessible, compassionate, and delivered with a smile.' },
          { icon: <FaAward className="text-yellow-500 text-3xl" />, title: 'Our Vision', desc: 'To be the most trusted dental care provider in Karnataka, known for excellence and patient satisfaction.' },
          { icon: <FaUserMd className="text-blue-500 text-3xl" />, title: 'Our Values', desc: 'Integrity, excellence, innovation, and patient-first approach guide everything we do at DentalCare.' },
        ].map(v => (
          <div key={v.title} className="text-center bg-white rounded-2xl shadow-sm border p-6">
            <div className="flex justify-center mb-3">{v.icon}</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{v.title}</h3>
            <p className="text-gray-500 text-sm">{v.desc}</p>
          </div>
        ))}
      </section>

      {/* Story */}
      <section className="bg-blue-50 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Story</h2>
          <p className="text-gray-600 mb-4">Founded in 2010 by Dr. Priya Sharma, DentalCare started as a small single-room clinic in Koramangala with a simple goal: make quality dental care accessible to everyone in Bengaluru.</p>
          <p className="text-gray-600 mb-4">Over 15 years, we have grown into a full-fledged multi-specialty dental center with state-of-the-art equipment, digital X-rays, 3D scanning, and a team of four highly specialized doctors.</p>
          <p className="text-gray-600">Today, we have served over 10,000 patients and continue to grow, driven by the trust our community has placed in us.</p>
        </div>
      </section>

      {/* Doctors
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Meet Our Doctors</h2>
        <p className="text-center text-gray-500 mb-10">Experienced specialists dedicated to your oral health</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {doctors.map(d => (
            <div key={d.name} className="bg-white rounded-2xl shadow-md border p-6 text-center hover:shadow-xl transition">
              <div className="text-6xl mb-4">{d.emoji}</div>
              <h3 className="font-bold text-gray-800 text-lg">{d.name}</h3>
              <p className="text-blue-600 text-sm font-medium mb-2">{d.role}</p>
              <p className="text-gray-500 text-xs mb-1">{d.qual}</p>
              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">{d.exp} Experience</span>
            </div>
          ))}
        </div>
      </section> */}

      {/* Facilities */}
      <section className="bg-gray-50 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">Our Facilities</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Digital X-Ray', '3D CT Scanner', 'Laser Dentistry', 'Sterilization Unit', 'OPG Machine', 'Intraoral Camera', 'Air Abrasion', 'Nitrous Oxide Sedation'].map(f => (
              <div key={f} className="bg-white rounded-xl p-4 text-center shadow-sm border">
                <FaTooth className="text-2xl mb-2 mx-auto text-blue-500" />
                <p className="text-sm font-medium text-gray-700">{f}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
