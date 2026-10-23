// dental-clinic\components\appointment\TimeSlotPicker.tsx
"use client";
import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FaLock } from 'react-icons/fa';
import { format } from 'date-fns';

interface TimeSlotPickerProps {
  slots:       string[];
  selected:    string;
  onChange:    (slot: string) => void;
  doctorName?: string;
  date?:       Date | null;
}

const ALL_SLOTS = [
  '9:00 AM','10:00 AM','11:00 AM',
  '12:00 PM','2:00 PM','3:00 PM',
  '4:00 PM','5:00 PM','6:00 PM',
];

export default function TimeSlotPicker({
  slots = ALL_SLOTS,
  selected,
  onChange,
  doctorName,
  date,
}: TimeSlotPickerProps) {
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loading,     setLoading]     = useState(false);

  // Fetch booked slots whenever doctor or date changes
  const fetchBooked = useCallback(async () => {
    if (!doctorName || !date) { setBookedSlots([]); return; }
    setLoading(true);
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const res     = await fetch(
        `/api/appointments/availability?doctorName=${encodeURIComponent(doctorName)}&date=${dateStr}`,
        { cache: 'no-store' }
      );
      const data    = await res.json();
      setBookedSlots(data.bookedSlots || []);
      // If the currently selected slot just got booked, deselect it
      const bookedSet = new Set((data.bookedSlots || []).map((s: string) => s.trim().toLowerCase()));
      if (selected && bookedSet.has(selected.trim().toLowerCase())) onChange('');
    } catch {
      setBookedSlots([]);
    } finally {
      setLoading(false);
    }
  }, [doctorName, date, selected, onChange]);

  useEffect(() => { fetchBooked(); }, [fetchBooked]);

  const bookedSet = new Set((bookedSlots || []).map(s => s.trim().toLowerCase()));
  const availableCount = slots.filter(s => !bookedSet.has(s.trim().toLowerCase())).length;

  return (
    <div className="w-full">
      {/* Summary bar */}
      {doctorName && date && (
        <div className={`flex items-center justify-between text-xs mb-4 px-1
          ${loading ? 'text-gray-400' : 'text-gray-500'}`}>
          <span>
            {loading
              ? '⏳ Checking availability…'
              : `${availableCount} of ${slots.length} slots available`}
          </span>
          {bookedSlots.length > 0 && (
            <span className="flex items-center gap-1 text-red-500">
              <FaLock size={9} /> {bookedSlots.length} booked
            </span>
          )}
        </div>
      )}

      {/* Hint for slot selection */}
      {!doctorName && (
        <p className="text-xs text-gray-400 mb-3 italic">
          💡 Select a doctor above to see available time slots
        </p>
      )}

      {/* Slot grid - always render but show hint if no doctor selected */}
      {!doctorName ? (
        <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 py-12 text-center">
          <p className="text-gray-400 text-sm">
            👈 Please select a doctor to see available time slots
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 w-full">
          {slots && slots.length > 0 ? (
            slots.map(slot => {
              const normalized = (slot || '').trim().toLowerCase();
              const isBooked   = bookedSet.has(normalized);
              const isSelected = selected === slot;
              const isLoading  = loading;

              return (
                <button
                  key={slot}
                  type="button"
                  disabled={isBooked || isLoading}
                  aria-disabled={isBooked || isLoading}
                  onClick={() => {
                      if (isBooked) {
                        toast.error('This time slot is already booked. Please choose another slot.');
                        return;
                      }
                      if (isLoading) return;
                      onChange(slot);
                    }}
                  title={isBooked ? `Already booked` : slot}
                  className={
                    `relative w-full py-2.5 px-2 rounded-xl text-sm font-medium border transition-all
                      ${isBooked
                        ? 'bg-red-600 text-white border-red-600 cursor-not-allowed'
                      : isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200 scale-105'
                        : isLoading
                          ? 'bg-gray-50 text-gray-300 border-gray-200 cursor-wait'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50'
                    }`
                  }
                >
                  {isBooked && (
                    <FaLock size={8} className="absolute top-1 right-1 text-white" />
                  )}
                  <span className={isBooked ? 'opacity-95 font-semibold' : ''}>
                    {slot}
                  </span>
                  {isBooked && (
                    <span className="block text-xs leading-tight text-white no-underline">
                      Booked
                    </span>
                  )}
                </button>
              );
            })
          ) : (
            <div className="col-span-3 text-center text-sm text-gray-400 py-8">
              No time slots available
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      {doctorName && (
        <div className="flex items-center gap-4 mt-4 text-xs text-gray-400 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-blue-600 rounded" /> Selected
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-white border border-gray-300 rounded" /> Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-red-600 rounded" /> Booked
          </span>
        </div>
      )}
    </div>
  );
}
