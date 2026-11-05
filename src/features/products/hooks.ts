import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from '../../store/session';
import { useState } from 'react';
import { pickImage, PickSource, prepareImage } from '../../media/prepare';
import {
  adjustStockDelta,
  createProduct,
  createVariant,
  deleteProduct,
  describeProduct,
  deleteProductImage,
  deleteVariant,
  updateProduct,
  updateVariant,
  fetchLowStock,
  fetchStockHistory,
  setStock,
  reorderProductImages,
  uploadProductImage, fetchCategories,
  fetchProduct,
  fetchProducts,
  ProductFilters,
} from './api';

export const productKey = (id: number) => ['product', id] as const;

export function useProducts(filters: ProductFilters) {
  const signedIn = useSession((s) => s.status === 'signedIn');
  return useInfiniteQuery({
    queryKey: ['products', filters],
    queryFn: ({ pageParam }) => fetchProducts(filters, pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.meta.current_page < last.meta.last_page ? last.meta.current_page + 1 : undefined),
    enabled: signedIn,
  });
}

export const useProduct = (id: number) => useQuery({ queryKey: productKey(id), queryFn: () => fetchProduct(id) });

export const useCategories = () => useQuery({ queryKey: ['categories'], queryFn: fetchCategories });

export function useAdjustStock(productId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { variantId: number; quantity: number; note?: string }) =>
      adjustStockDelta(productId, v.variantId, v.quantity, v.note),
    // Re-read the real numbers whether it worked or the server refused.
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: productKey(productId) });
      void qc.invalidateQueries({ queryKey: ['products'] });
      void qc.invalidateQueries({ queryKey: ['low-stock'] });
    },
  });
}

const refreshProduct = (qc: ReturnType<typeof useQueryClient>, id: number) => {
  void qc.invalidateQueries({ queryKey: productKey(id) });
  void qc.invalidateQueries({ queryKey: ['products'] });
};

/** Pick, shrink on the device, then upload with progress. Cancelling the picker is not an error. */
export function useAddProductImage(productId: number) {
  const qc = useQueryClient();
  const [progress, setProgress] = useState<number | null>(null);
  const m = useMutation({
    mutationFn: async (source: PickSource) => {
      const asset = await pickImage(source);
      if (!asset) {
        return null;
      }
      setProgress(0);
      const file = await prepareImage(asset);
      return uploadProductImage(productId, file, setProgress);
    },
    onSettled: () => {
      setProgress(null);
      refreshProduct(qc, productId);
    },
  });
  return { ...m, progress };
}

export function useProductImageActions(productId: number) {
  const qc = useQueryClient();
  const done = { onSettled: () => refreshProduct(qc, productId) };
  const remove = useMutation({ mutationFn: (mediaId: number) => deleteProductImage(productId, mediaId), ...done });
  const reorder = useMutation({ mutationFn: (ids: number[]) => reorderProductImages(productId, ids), ...done });
  return { remove, reorder };
}

const refreshStock = (qc: ReturnType<typeof useQueryClient>, productId: number) => {
  void qc.invalidateQueries({ queryKey: productKey(productId) });
  void qc.invalidateQueries({ queryKey: ['products'] });
  void qc.invalidateQueries({ queryKey: ['low-stock'] });
  void qc.invalidateQueries({ queryKey: ['stock-history'] });
};

/** Needs a connection by design: a stock-take must not be replayed later. */
export function useSetStock(productId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { variantId: number; quantity: number; expected: number; note?: string }) =>
      setStock(productId, v.variantId, v.quantity, v.expected, v.note),
    onSettled: () => refreshStock(qc, productId),
  });
}

export const useStockHistory = (productId: number, variantId: number, enabled: boolean) =>
  useQuery({
    queryKey: ['stock-history', productId, variantId],
    queryFn: () => fetchStockHistory(productId, variantId),
    enabled,
  });

export const useLowStock = () => useQuery({ queryKey: ['low-stock'], queryFn: fetchLowStock });

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => createProduct(body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useUpdateProduct(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => updateProduct(id, body),
    onSuccess: () => refreshProduct(qc, id),
  });
}

export function useVariantMutations(productId: number) {
  const qc = useQueryClient();
  const done = { onSettled: () => { refreshProduct(qc, productId); void qc.invalidateQueries({ queryKey: ['low-stock'] }); } };
  return {
    create: useMutation({ mutationFn: (b: Record<string, unknown>) => createVariant(productId, b), ...done }),
    update: useMutation({ mutationFn: (v: { id: number; body: Record<string, unknown> }) => updateVariant(productId, v.id, v.body), ...done }),
    remove: useMutation({ mutationFn: (variantId: number) => deleteVariant(productId, variantId), ...done }),
  };
}

/** Never queued: deleting needs a connection and a clear answer from the server. */
export function useDeleteProduct(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => deleteProduct(id),
    onSuccess: () => {
      qc.removeQueries({ queryKey: productKey(id) });
      void qc.invalidateQueries({ queryKey: ['products'] });
      void qc.invalidateQueries({ queryKey: ['low-stock'] });
      void qc.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export const useDescribeProduct = () =>
  useMutation({ mutationFn: (v: { name: string; categoryId: number | null }) => describeProduct(v.name, v.categoryId) });
