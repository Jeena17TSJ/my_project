'use client';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaWhatsapp } from 'react-icons/fa';

const MAPS_EMBED_URL = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.598!2d77.6263!3d12.9352!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDU2JzA2LjciTiA3N8KwMzcnMzQuNyJF!5e0!3m2!1sen!2sin!4v1234567890';

const contactItems = [
  { icon: FaMapMarkerAlt, label: 'Address', value: '123 Health Street, Koramangala, Bengaluru 560034' },
  { icon: FaPhone,        label: 'Phone',   value: '+91 83108 97655' },
  { icon: FaEnvelope,     label: 'Email',   value: 'info@dentalcare.in' },
  { icon: FaClock,        label: 'Hours',   value: 'Mon-Sat: 9AM-7PM | Sunday: 10AM-2PM' },
];

export default function ContactPage() {
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (data: any) => {
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      toast.success('Message sent! We will get back to you shortly.');
      reset();
    } catch {
      toast.error('Failed to send message.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-3">Contact us</h1>
      <p className="text-center text-gray-500 mb-12">We are here to help you smile better</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

        <div className="flex flex-col gap-6">

          <div className="space-y-5">
            {contactItems.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Icon className="text-blue-600 text-lg" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">{label}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <a
            href="https://wa.me/8310897655"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white font-semibold py-3.5 px-6 rounded-xl transition"
          >
            <FaWhatsapp className="text-xl" />
            Chat on WhatsApp
          </a>

          <div className="rounded-2xl overflow-hidden border border-gray-100 h-52">
            <iframe
              src={MAPS_EMBED_URL}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="DentalCare Dental location"
            />
          </div>

          {/* <div className="bg-blue-600 rounded-2xl p-6 text-white">
            <h3 className="font-bold text-lg mb-2">Emergency dental care</h3>
            <p className="text-blue-100 text-sm mb-3">
              Experiencing severe tooth pain? We offer emergency slots daily.
            </p>
            <p className="font-bold flex items-center gap-2">
              <FaPhone /> +91-80-9999-0000
            </p>
          </div> */}

        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-2xl shadow-md p-8 space-y-4 h-fit"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Send a message</h2>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Name</label>
            <input
              {...register('name')}
              type="text"
              placeholder="Your name"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
            <input
              {...register('email')}
              type="email"
              placeholder="you@email.com"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Phone</label>
            <input
              {...register('phone')}
              type="tel"
              placeholder="+91 XXXXX XXXXX"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Message</label>
            <textarea
              {...register('message')}
              rows={4}
              placeholder="How can we help you?"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition"
          >
            Send message
          </button>
        </form>

      </div>
    </div>
  );
}
