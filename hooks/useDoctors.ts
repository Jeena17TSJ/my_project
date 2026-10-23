import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

export function useDoctors() {
  const [doctors,  setDoctors]  = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/doctors');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDoctors(data.doctors || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const getAvailableSlots = useCallback(
    (doctorName: string, day: string): string[] => {
      const doc = doctors.find(d => d.name === doctorName);
      if (!doc) return [];
      const slot = doc.availableSlots?.find((s: any) => s.day === day);
      return slot?.slots || [];
    },
    [doctors]
  );

  const isDoctorAvailable = useCallback(
    (doctorName: string, day: string): boolean => {
      const doc = doctors.find(d => d.name === doctorName);
      return doc?.availableDays?.includes(day) ?? false;
    },
    [doctors]
  );

  const create = useCallback(async (payload: any) => {
    try {
      const res  = await fetch('/api/doctors', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Doctor added!');
      fetch_();
      return data.doctor;
    } catch (e: any) {
      toast.error(e.message);
      return null;
    }
  }, [fetch_]);

  const update = useCallback(async (id: string, payload: any) => {
    try {
      const res  = await fetch(`/api/doctors/${id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Doctor updated!');
      fetch_();
      return data.doctor;
    } catch (e: any) {
      toast.error(e.message);
      return null;
    }
  }, [fetch_]);

  const remove = useCallback(async (id: string) => {
    try {
      await fetch(`/api/doctors/${id}`, { method: 'DELETE' });
      toast.success('Doctor removed');
      fetch_();
    } catch (e: any) {
      toast.error(e.message);
    }
  }, [fetch_]);

  return { doctors, loading, error, getAvailableSlots, isDoctorAvailable, create, update, remove, refetch: fetch_ };
}
