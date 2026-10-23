// dental-clinic\app\(public)\appointment\success\page.tsx
'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FaCheckCircle, FaArrowRight, FaClock, FaCalendar, FaUser } from 'react-icons/fa';
import { format, parse } from 'date-fns';

function BookingSuccessContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const doctorName = searchParams.get('doctor') || 'Doctor';
  const date = searchParams.get('date');
  const slot = searchParams.get('slot');
  const backHomeHref = (session?.user as any)?.role === 'patient' ? '/patient' : '/';
  
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctor = async () => {
      if (!doctorName || doctorName === 'available') {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/doctors?name=${encodeURIComponent(doctorName)}`);
        const data = await res.json();
        if (data.doctors?.length > 0) {
          setDoctor(data.doctors[0]);
        }
      } catch (e) {
        console.error('Failed to load doctor:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [doctorName]);

  const formattedDate = date ? format(parse(date, 'yyyy-MM-dd', new Date()), 'EEEE, dd MMMM yyyy') : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <FaCheckCircle className="text-green-600 text-3xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Appointment Requested!</h1>
          <p className="text-gray-600">Your appointment request has been sent for admin approval.</p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Booking Details</h2>
          
          <div className="space-y-4">
            {/* Date */}
            {formattedDate && (
              <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                  <FaCalendar className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Date</p>
                  <p className="text-gray-800 font-semibold">{formattedDate}</p>
                </div>
              </div>
            )}

            {/* Time */}
            {slot && (
              <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full">
                  <FaClock className="text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Time Slot</p>
                  <p className="text-gray-800 font-semibold">{slot}</p>
                </div>
              </div>
            )}

            {/* Doctor */}
            {!loading && (doctor || doctorName !== 'available') && (
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full flex-shrink-0">
                  <FaUser className="text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-medium">Assigned Doctor</p>
                  <p className="text-gray-800 font-semibold">{doctor?.name || doctorName}</p>
                  {doctor?.specialization && (
                    <p className="text-sm text-gray-600 mt-1">{doctor.specialization}</p>
                  )}
                  {doctor?.consultationFee && (
                    <p className="text-sm text-gray-600">Fee: Rs. {doctor.consultationFee}</p>
                  )}
                </div>
              </div>
            )}

            {doctorName === 'available' && (
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full flex-shrink-0">
                  <FaUser className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Doctor</p>
                  <p className="text-gray-800 font-semibold">Any Available Doctor</p>
                  <p className="text-sm text-gray-600 mt-1">We will assign an available doctor for you</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6 mb-8">
          <h3 className="font-bold text-gray-800 mb-3">Next Steps</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">✓</span>
              <span>You will receive confirmation after the admin approves your request</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">✓</span>
              <span>You will receive an SMS reminder 24 hours before your appointment</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">✓</span>
              <span>Please arrive 10 minutes early at the clinic</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">✓</span>
              <span>For cancellations, contact us at least 24 hours before</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href={backHomeHref} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold 
                                    hover:bg-blue-700 transition text-center flex items-center justify-center gap-2">
            <span>Back to Home</span>
            <FaArrowRight />
          </Link>
          <Link href="/appointment" className="flex-1 border-2 border-blue-600 text-blue-600 py-3 rounded-xl font-semibold 
                                             hover:bg-blue-50 transition text-center">
            Book Another Appointment
          </Link>
        </div>

        {/* Contact Info */}
        <div className="mt-12 text-center text-sm text-gray-600">
          <p>Need help? <Link href="/contact" className="text-blue-600 font-semibold hover:underline">Contact us</Link></p>
        </div>
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50" />}>
      <BookingSuccessContent />
    </Suspense>
  );
}
