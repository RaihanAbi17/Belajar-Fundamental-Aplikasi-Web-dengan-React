import { useCallback, useEffect, useState } from 'react';
import { getActiveNotes, getArchivedNotes } from '../utils/api';

export function useNotes(archived = false, enabled = true) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState('');

  const loadNotes = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError('');
    try {
      const response = archived ? await getArchivedNotes() : await getActiveNotes();
      setNotes(response.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [archived, enabled]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  return { notes, loading, error, reload: loadNotes };
}
