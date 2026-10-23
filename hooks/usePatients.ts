import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

export function usePatients() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [search,   setSearch]   = useState('');

  const fetch_ = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch('/api/patients');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setPatients(data.patients || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const filtered = patients.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.phone?.includes(q)
    );
  });

  const create = useCallback(async (payload: any) => {
    try {
      const res  = await fetch('/api/patients', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      toast.success('Patient added!');
      fetch_();
      return data.patient;
    } catch (e: any) {
      toast.error(e.message);
      return null;
    }
  }, [fetch_]);

  const update = useCallback(async (id: string, payload: any) => {
    try {
      const res  = await fetch(`/api/patients/${id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      toast.success('Patient updated!');
      fetch_();
      return data.patient;
    } catch (e: any) {
      toast.error(e.message);
      return null;
    }
  }, [fetch_]);

  const remove = useCallback(async (id: string) => {
    try {
      await fetch(`/api/patients/${id}`, { method: 'DELETE' });
      toast.success('Patient removed');
      fetch_();
    } catch (e: any) {
      toast.error(e.message);
    }
  }, [fetch_]);

  return { patients, filtered, loading, error, search, setSearch, create, update, remove, refetch: fetch_ };
}
