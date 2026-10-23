const images = [
    {
    src: '/gallery/clinicimage.jpg',
    alt: 'Clinic Image',
    span: 'col-span-2',
  },
  {
    src: '/gallery/reception_area.webp',
    alt: 'Reception area',
    span: 'col-span-1',
  },
  {
    src: '/gallery/treatment_room.jpg',
    alt: 'Treatment room',
    span: 'col-span-1',
  },
  {
    src: '/gallery/dental_equipment.avif',
    alt: 'Dental equipment',
    span: 'col-span-1',
  },
  {
    src: '/gallery/waiting_area.jpg',
    alt: 'Waiting area',
    span: 'col-span-1',
  },
  {
    src: '/gallery/inside_clinic_image.avif',
    alt: 'Clinic Inside Room',
    span: 'col-span-1',
  },
];

export default function ClinicGallery() {
  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-12">
          <p className="text-blue-600 font-semibold text-xs uppercase tracking-widest mb-2">
            Our Clinic
          </p>
          <h2 className="text-4xl font-bold text-gray-800 mb-3">A space built for your comfort</h2>
          <p className="text-gray-500 max-w-xl mx-auto text-[15px]">
            Modern facilities, a calming environment, and everything designed with your experience in mind.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-3 grid-rows-2 gap-4 h-[520px]">

          {/* Large left — spans 2 cols, full height */}
          <div className="col-span-2 row-span-2 relative rounded-2xl overflow-hidden group">
            <img
              src={images[0].src}
              alt={images[0].alt}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm
                            text-gray-800 text-sm font-medium px-3 py-1.5 rounded-full">
              {images[0].alt}
            </div>
          </div>

          {/* Top right */}
          <div className="col-span-1 row-span-1 relative rounded-2xl overflow-hidden group">
            <img
              src={images[1].src}
              alt={images[1].alt}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm
                            text-gray-800 text-xs font-medium px-2.5 py-1 rounded-full">
              {images[1].alt}
            </div>
          </div>

          {/* Bottom right — 2 small tiles side by side */}
          <div className="col-span-1 row-span-1 grid grid-cols-2 gap-4">
            {images.slice(2).map((img) => (
              <div key={img.alt} className="relative rounded-2xl overflow-hidden group">
                <img
                  src={img.src}
                  alt={img.alt}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm
                                text-gray-800 text-[11px] font-medium px-2 py-0.5 rounded-full">
                  {img.alt}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
