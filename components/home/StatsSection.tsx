interface StatsSectionProps {
  doctorCount?: number;
}

export default function StatsSection({ doctorCount = 4 }: StatsSectionProps) {
  const stats = [
    { value: '10,000+', label: 'Happy Patients',   emoji: '😊' },
    { value: '15+',     label: 'Years Experience', emoji: '🏆' },
    { value: `${doctorCount}`, label: 'Expert Doctors', emoji: '👨‍⚕️' },
    { value: '98%',     label: 'Success Rate',     emoji: '✅' },
  ];

  return (
    <section className="bg-brand-900 py-12">
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map(s => (
          <div key={s.label} className="rounded-lg border border-mint-300/20 bg-white/10 p-5 text-center text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <div className="text-3xl mb-1">{s.emoji}</div>
            <div className="text-4xl font-extrabold text-mint-300">{s.value}</div>
            <div className="text-brand-100/80 text-sm mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
