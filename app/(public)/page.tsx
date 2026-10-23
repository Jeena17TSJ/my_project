import HeroSection        from '@/components/home/HeroSection';
import StatsSection       from '@/components/home/StatsSection';
import AboutSection from '@/components/home/AboutSection';
// import ServicesSection    from '@/components/home/ServicesSection';
import WhyChooseUs        from '@/components/home/WhyChooseUs';
import DoctorsSection     from '@/components/home/DoctorsSection';
import ClinicGallery from '@/components/home/ClinicGallery';
// import TestimonialsSection from '@/components/home/TestimonialsSection';
import CTASection         from '@/components/home/CTASection';
import { connectDB }      from '@/lib/mongodb';
import Doctor             from '@/models/Doctor';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  await connectDB();
  const doctors = await Doctor.find({
    $or: [
      { isActive: true },
      { isActive: { $exists: false } },
    ],
  })
    .sort({ experience: -1, name: 1 })
    .lean();

  const doctorCards = doctors.map((doctor: any) => ({
    _id: doctor._id.toString(),
    name: doctor.name,
    specialization: doctor.specialization,
    qualification: doctor.qualification,
    experience: doctor.experience,
    bio: doctor.bio,
    consultationFee: doctor.consultationFee,
    availableDays: doctor.availableDays,
    rating: doctor.rating,
    image: doctor.image,
  }));

  return (
    <>
      <HeroSection />
      <StatsSection doctorCount={doctorCards.length} />
      <AboutSection />
      {/* <ServicesSection /> */}
      <WhyChooseUs />
      <DoctorsSection doctors={doctorCards} />
      {/* <TestimonialsSection /> */}
      <ClinicGallery />
      <CTASection />
    </>
  );
}
