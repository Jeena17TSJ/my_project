// dental-clinic\hooks\useAppointments.ts
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

export interface AppointmentFilters {
  status?:   string;
  doctorId?: string;
  date?:     string;
}

export function useAppointments(filters: AppointmentFilters = {}) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  const buildUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (filters.status)   params.set('status',   filters.status);
    if (filters.doctorId) params.set('doctorId', filters.doctorId);
    if (filters.date)     params.set('date',     filters.date);
    const qs = params.toString();
    return qs ? `/api/appointments?${qs}` : '/api/appointments';
  }, [filters.status, filters.doctorId, filters.date]);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(buildUrl());
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setAppointments(data.appointments || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [buildUrl]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const create = useCallback(async (payload: any) => {
    try {
      const res  = await fetch('/api/appointments', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to book');
      toast.success('Appointment booked!');
      fetch_();
      return data.appointment;
    } catch (e: any) {
      toast.error(e.message);
      return null;
    }
  }, [fetch_]);

  const updateStatus = useCallback(async (id: string, status: string, extra: any = {}) => {
    try {
      const res  = await fetch(`/api/appointments/${id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status, ...extra }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update');
      toast.success(`Appointment ${status}`);
      fetch_();
      return data.appointment;
    } catch (e: any) {
      toast.error(e.message);
      return null;
    }
  }, [fetch_]);

  const remove = useCallback(async (id: string) => {
    try {
      await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
      toast.success('Appointment deleted');
      fetch_();
    } catch (e: any) {
      toast.error(e.message);
    }
  }, [fetch_]);

  // Derived stats
  const stats = {
    total:     appointments.length,
    pending:   appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
    today:     appointments.filter(a =>
                 new Date(a.date).toDateString() === new Date().toDateString()
               ).length,
  };

  return { appointments, loading, error, stats, create, updateStatus, remove, refetch: fetch_ };
}
