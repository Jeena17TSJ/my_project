import { FaStar, FaQuoteLeft } from 'react-icons/fa';

const testimonials = [
  { name: 'Rahul Sharma',   city: 'Koramangala', rating: 5, text: 'Dr. Priya did an amazing job on my teeth whitening. The results exceeded my expectations. Professional, friendly and absolutely painless!' },
  { name: 'Ananya Reddy',   city: 'Indiranagar',  rating: 5, text: 'Had my root canal here. I was terrified but the team made me so comfortable. Completely painless! Highly recommend DentalCare.' },
  { name: 'Vikram Nair',    city: 'HSR Layout',    rating: 5, text: 'Best dental clinic in Bengaluru. Clean, modern equipment and very friendly staff. The chatbot was super helpful for booking!' },
  { name: 'Deepa Krishnan', city: 'Whitefield',    rating: 5, text: 'Got braces for my daughter. Dr. Arjun is excellent with kids. She actually looks forward to her monthly visits now!' },
  { name: 'Suresh Iyer',    city: 'JP Nagar',      rating: 5, text: 'Dental implant procedure was smooth and professional. Dr. Sneha is fantastic. Worth every rupee. My smile has transformed!' },
  { name: 'Preethi K.',     city: 'Jayanagar',     rating: 5, text: 'The appointment system and reminders are so convenient. Great clinic with modern facilities and caring doctors.' },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 px-6 bg-blue-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-2">
            Testimonials
          </p>
          <h2 className="text-4xl font-bold text-gray-800 mb-3">What Patients Say</h2>
          <p className="text-gray-500">Real stories from real patients</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map(t => (
            <div key={t.name}
              className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100 relative">
              <FaQuoteLeft className="text-blue-100 text-4xl absolute top-4 right-4" />
              <div className="flex gap-0.5 mb-3">
                {[...Array(t.rating)].map((_, i) => (
                  <FaStar key={i} className="text-yellow-400 text-sm" />
                ))}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4 italic">
                &quot;{t.text}&quot;
              </p>
              <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center
                                text-white text-sm font-bold">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{t.name}</p>
                  <p className="text-gray-400 text-xs">{t.city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
