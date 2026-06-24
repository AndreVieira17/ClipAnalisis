import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Analysis } from '@/types';

export function useAnalyses(userId: string | undefined) {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!userId) {
      setAnalyses([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (err) {
      setError(err.message);
    } else {
      setAnalyses((data ?? []) as Analysis[]);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const remove = useCallback(
    async (id: string) => {
      const { error: err } = await supabase.from('analyses').delete().eq('id', id);
      if (!err) setAnalyses((prev) => prev.filter((a) => a.id !== id));
      return err ? err.message : null;
    },
    [],
  );

  return { analyses, loading, error, refresh: fetch, remove };
}
