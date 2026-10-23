import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SERVICE_IMAGES } from '@/lib/constants';

const serviceData: Record<string, any> = {
  'teeth-whitening': {
    title: 'Teeth Whitening', icon: '🦷',
    description: 'Our professional teeth whitening treatment uses clinically proven whitening agents to remove deep stains and discoloration, giving you a brighter smile in just one visit.',
    benefits: ['Up to 8 shades whiter', 'Long-lasting results (1–2 years)', 'Safe for enamel', 'Quick 60-minute session'],
    procedure: ['Consultation & shade assessment', 'Gum protection placement', 'Whitening gel application', 'LED light activation', 'Final shade comparison'],
    price: '₹3,000 – ₹6,000',
    duration: '60–90 minutes',
    doctor: 'Dr. Priya Sharma',
    faqs: [
      { q: 'Is teeth whitening safe?', a: 'Yes, professional whitening is completely safe and done under dental supervision.' },
      { q: 'How long do results last?', a: 'Results typically last 1–2 years with proper maintenance.' },
    ],
  },
  'orthodontics': {
    title: 'Orthodontics', icon: '😁',
    description: 'We offer metal braces, ceramic braces, and clear aligners to correct misaligned teeth, crowded teeth, and bite problems for patients of all ages.',
    benefits: ['Improved smile aesthetics', 'Better oral hygiene', 'Corrects bite issues', 'Multiple options available'],
    procedure: ['Comprehensive dental examination', 'X-rays and impressions', 'Custom treatment plan', 'Brace/aligner fitting', 'Regular monthly adjustments', 'Retainer placement'],
    price: '₹25,000 – ₹60,000',
    duration: '12–24 months',
    doctor: 'Dr. Arjun Mehta',
    faqs: [
      { q: 'What age is best for braces?', a: 'Braces can be done at any age. Early treatment (7–14) is ideal but adults benefit too.' },
      { q: 'Are clear aligners better than braces?', a: 'Both are effective. Aligners are less visible; braces are better for complex cases.' },
    ],
  },
  'dental-implants': {
    title: 'Dental Implants', icon: '🔩',
    description: 'Dental implants are the gold standard for replacing missing teeth. Our titanium implants fuse with your jawbone for a permanent, natural-looking solution.',
    benefits: ['Permanent solution', 'Natural look and feel', 'Prevents bone loss', 'Easy maintenance'],
    procedure: ['Initial consultation & CT scan', 'Bone grafting (if needed)', 'Implant post insertion', 'Healing period (3–6 months)', 'Abutment placement', 'Crown fitting'],
    price: '₹25,000 – ₹40,000 per tooth',
    duration: '3–6 months total',
    doctor: 'Dr. Sneha Rao',
    faqs: [
      { q: 'Do dental implants hurt?', a: 'The procedure is done under anesthesia. Post-op discomfort is manageable with medication.' },
      { q: 'How long do implants last?', a: 'With proper care, implants can last a lifetime.' },
    ],
  },
  'root-canal': {
    title: 'Root Canal Treatment', icon: '❤️',
    description: 'Modern root canal treatment is virtually painless. We remove the infected pulp, clean the canal, and seal the tooth to save it from extraction.',
    benefits: ['Saves your natural tooth', 'Eliminates infection & pain', 'Prevents spread of infection', 'Long-lasting results'],
    procedure: ['X-ray to assess infection', 'Local anesthesia', 'Pulp removal', 'Canal cleaning & shaping', 'Canal filling (gutta-percha)', 'Crown placement'],
    price: '₹5,000 – ₹12,000',
    duration: '1–2 sessions',
    doctor: 'Dr. Priya Sharma',
    faqs: [
      { q: 'Is root canal painful?', a: 'Modern RCT is done under anesthesia and is no more painful than a filling.' },
      { q: 'How many sessions are needed?', a: 'Usually 1–2 sessions depending on the severity of infection.' },
    ],
  },
  'dental-cleaning': {
    title: 'Dental Cleaning & Scaling', icon: '✨',
    description: 'Professional dental cleaning removes plaque, tartar, and bacteria that regular brushing misses, preventing gum disease and cavities.',
    benefits: ['Removes stubborn tartar', 'Prevents gum disease', 'Fresh breath', 'Brighter teeth'],
    procedure: ['Oral examination', 'Ultrasonic scaling', 'Hand scaling (deep pockets)', 'Polishing', 'Fluoride application', 'Oral hygiene instructions'],
    price: '₹800 – ₹1,200',
    duration: '30–45 minutes',
    doctor: 'Dr. Priya Sharma',
    faqs: [
      { q: 'How often should I get cleaning?', a: 'Every 6 months is recommended for optimal oral health.' },
      { q: 'Does cleaning hurt?', a: 'Mild sensitivity is normal but the procedure is generally painless.' },
    ],
  },
  'cosmetic-dentistry': {
    title: 'Cosmetic Dentistry', icon: '💎',
    description: 'Transform your smile with our cosmetic dental procedures including veneers, bonding, smile makeovers, and more.',
    benefits: ['Enhanced smile aesthetics', 'Boosted confidence', 'Natural-looking results', 'Long-lasting'],
    procedure: ['Smile design consultation', 'Digital smile preview', 'Treatment planning', 'Procedure execution', 'Follow-up care'],
    price: '₹4,000 – ₹15,000 per tooth',
    duration: 'Varies by procedure',
    doctor: 'Dr. Priya Sharma',
    faqs: [
      { q: 'What are veneers?', a: 'Thin porcelain shells bonded to teeth front surfaces to improve shape, color, and size.' },
      { q: 'How long do veneers last?', a: 'Porcelain veneers last 10–15 years with proper care.' },
    ],
  },
};

export default function ServiceDetailPage({ params }: { params: { slug: string } }) {
  const service = serviceData[params.slug];
  if (!service) notFound();
  const serviceImage = SERVICE_IMAGES[params.slug];

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="text-6xl mb-4">{service.icon}</div>
        <h1 className="text-4xl font-bold text-gray-800 mb-3">{service.title}</h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">{service.description}</p>
      </div>

      {serviceImage && (
        <div className="mb-12 overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
          <img
            src={serviceImage}
            alt={service.title}
            className="h-[360px] w-full object-cover"
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <div className="text-blue-600 font-bold text-xl">{service.price}</div>
          <div className="text-gray-500 text-sm">Price Range</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <div className="text-green-600 font-bold text-xl">{service.duration}</div>
          <div className="text-gray-500 text-sm">Duration</div>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 text-center">
          <div className="text-purple-600 font-bold text-xl">{service.doctor}</div>
          <div className="text-gray-500 text-sm">Lead Doctor</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Benefits */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Benefits</h2>
          <ul className="space-y-2">
            {service.benefits.map((b: string) => (
              <li key={b} className="flex items-center gap-2 text-gray-600">
                <span className="text-green-500">✓</span> {b}
              </li>
            ))}
          </ul>
        </div>

        {/* Procedure */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Procedure Steps</h2>
          <ol className="space-y-2">
            {service.procedure.map((step: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-gray-600">
                <span className="bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* FAQs */}
      <div className="bg-gray-50 rounded-2xl p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {service.faqs.map((faq: any, i: number) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-1">Q: {faq.q}</h4>
              <p className="text-gray-600 text-sm">A: {faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <Link href="/appointment"
          className="bg-blue-600 text-white px-10 py-3 rounded-full font-bold text-lg hover:bg-blue-700 transition">
          Book This Service
        </Link>
      </div>
    </div>
  );
}
