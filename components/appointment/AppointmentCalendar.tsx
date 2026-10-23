// dental-clinic\components\appointment\AppointmentCalendar.tsx
'use client';
import { useState } from 'react';
import {
  FaChevronLeft, FaChevronRight, FaCalendarAlt,
} from 'react-icons/fa';

interface CalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  bookedDates?: string[];      // ISO strings of fully booked dates
  minDate?:     Date;
  maxDate?:     Date;
  availableDays?: number[];    // 0=Sun … 6=Sat — if empty, all days allowed
}

const DAY_NAMES  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate()
  );
}

export default function AppointmentCalendar({
  selectedDate,
  onDateSelect,
  bookedDates   = [],
  minDate,
  maxDate,
  availableDays,
}: CalendarProps) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(
    selectedDate ? new Date(selectedDate) : new Date()
  );

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // First day-of-week offset and total days
  const firstDow   = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const isDisabled = (day: number): boolean => {
    const d = new Date(year, month, day);
    if (minDate && d < minDate)                          return true;
    if (maxDate && d > maxDate)                          return true;
    if (isSameDay(d, new Date()) &&
        d < new Date())                                   return false; // today is fine
    if (d < new Date(new Date().toDateString()))          return true;  // past days
    if (availableDays && !availableDays.includes(d.getDay())) return true;
    if (bookedDates.some(bd => isSameDay(new Date(bd), d))) return true;
    return false;
  };

  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-50">
        <button
          onClick={prevMonth}
          className="p-2 rounded-xl hover:bg-gray-200 transition text-gray-600"
        >
          <FaChevronLeft size={12} />
        </button>
        <div className="flex items-center gap-2">
          <FaCalendarAlt className="text-blue-500" size={14} />
          <span className="font-bold text-gray-800 text-sm">
            {MONTH_NAMES[month]} {year}
          </span>
        </div>
        <button
          onClick={nextMonth}
          className="p-2 rounded-xl hover:bg-gray-200 transition text-gray-600"
        >
          <FaChevronRight size={12} />
        </button>
      </div>

      {/* Day-of-week labels */}
      <div className="grid grid-cols-7 border-b">
        {DAY_NAMES.map(d => (
          <div key={d}
            className={`text-center py-2.5 text-xs font-semibold
              ${d === 'Sun' || d === 'Sat' ? 'text-red-400' : 'text-gray-500'}`}>
            {d}
          </div>
        ))}
      </div>

      {/* Date cells */}
      <div className="grid grid-cols-7 p-2 gap-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={`e-${idx}`} />;

          const date      = new Date(year, month, day);
          const disabled  = isDisabled(day);
          const selected  = selectedDate && isSameDay(date, selectedDate);
          const isToday   = isSameDay(date, today);
          const isBooked  = bookedDates.some(bd => isSameDay(new Date(bd), date));

          return (
            <button
              key={day}
              disabled={disabled}
              onClick={() => !disabled && onDateSelect(date)}
              className={`
                h-9 w-full rounded-xl text-sm font-medium transition-all
                ${selected
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200 scale-105'
                  : isToday && !disabled
                    ? 'bg-blue-50 text-blue-700 border border-blue-300'
                    : isBooked
                      ? 'bg-red-50 text-red-300 cursor-not-allowed line-through text-xs'
                      : disabled
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                }
              `}
            >
              {day}
              {isBooked && !selected && (
                <span className="block text-xs leading-none opacity-60">full</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="px-4 pb-3 flex items-center gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-blue-600 rounded" /> Selected
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-blue-50 border border-blue-300 rounded" /> Today
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-red-50 rounded" /> Fully booked
        </span>
      </div>
    </div>
  );
}