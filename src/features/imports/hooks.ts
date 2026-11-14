import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { errorCodes, isErrorWithCode, pick, types } from '@react-native-documents/picker';
import { CsvFile, fetchImport, fetchImports, startImport } from './api';
import { refreshPlanUsage } from '../products/hooks';
import { isFinished, MAX_CSV_BYTES } from './status';

export class CsvTooLargeError extends Error {
  constructor() {
    super('csv_too_large');
    this.name = 'CsvTooLargeError';
  }
}

/** Returns the chosen file, or null if the user cancelled the picker. */
export async function chooseCsv(): Promise<CsvFile | null> {
  try {
    const [file] = await pick({ type: [...types.csv, types.plainText] });
    if (!file) {
      return null;
    }
    if (file.size !== null && file.size !== undefined && file.size > MAX_CSV_BYTES) {
      throw new CsvTooLargeError();
    }
    return { uri: file.uri, name: file.name ?? 'products.csv', type: file.type ?? 'text/csv' };
  } catch (e) {
    if (isErrorWithCode(e) && e.code === errorCodes.OPERATION_CANCELED) {
      return null;
    }
    throw e;
  }
}

export function useStartImport() {
  const qc = useQueryClient();
  const [progress, setProgress] = useState<number | null>(null);
  const m = useMutation({
    mutationFn: async () => {
      const file = await chooseCsv();
      if (!file) {
        return null;
      }
      setProgress(0);
      return startImport(file, setProgress);
    },
    onSettled: () => {
      setProgress(null);
      void qc.invalidateQueries({ queryKey: ['imports'] });
    },
  });
  return { ...m, progress };
}

/** Polls every 2 s until the import is finished, then stops and refreshes the product list. */
export function useImport(id: number | null) {
  const qc = useQueryClient();
  return useQuery({
    queryKey: ['import', id],
    queryFn: async () => {
      const data = await fetchImport(id as number);
      if (isFinished(data.status)) {
        void qc.invalidateQueries({ queryKey: ['products'] });
        void qc.invalidateQueries({ queryKey: ['categories'] });
        void qc.invalidateQueries({ queryKey: ['imports'] });
        refreshPlanUsage(qc); // new rows count toward the product cap
      }
      return data;
    },
    enabled: id !== null,
    refetchInterval: (q) => (q.state.data && isFinished(q.state.data.status) ? false : 2000),
  });
}

export const useImports = () => useQuery({ queryKey: ['imports'], queryFn: fetchImports });
