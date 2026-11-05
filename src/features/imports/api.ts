import { api } from '../../api/instance';
import { importEnvelopeSchema, importsSchema } from '../../api/schemas/catalogue';

export interface CsvFile {
  uri: string;
  name: string;
  type: string;
}

export function startImport(file: CsvFile, onProgress?: (fraction: number) => void) {
  const form = new FormData();
  form.append('file', file as unknown as Blob);
  return api.upload('/product-imports', form, { schema: importEnvelopeSchema, onProgress }).then((r) => r.data);
}

export const fetchImport = (id: number) => api.get(`/product-imports/${id}`, { schema: importEnvelopeSchema }).then((r) => r.data);

export const fetchImports = () => api.get('/product-imports', { schema: importsSchema }).then((r) => r.data);
