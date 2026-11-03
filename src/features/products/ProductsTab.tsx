import React, { useState } from 'react';
import { LowStockScreen } from './LowStockScreen';
import { ProductFormScreen } from './ProductFormScreen';
import { useProduct } from './hooks';
import { ProductDetailScreen } from './ProductDetailScreen';
import { ProductsListScreen } from './ProductsListScreen';
import { ScanScreen } from './ScanScreen';

type View =
  | { name: 'list' }
  | { name: 'detail'; id: number }
  | { name: 'low' }
  | { name: 'scan' }
  | { name: 'create' }
  | { name: 'edit'; id: number };

function EditLoader({
  id,
  onBack,
  onDone,
}: {
  id: number;
  onBack: () => void;
  onDone: (id: number) => void;
}) {
  const product = useProduct(id);
  return product.data ? (
    <ProductFormScreen
      mode="edit"
      product={product.data}
      onBack={onBack}
      onDone={onDone}
    />
  ) : null;
}

export function ProductsTab() {
  const [view, setView] = useState<View>({ name: 'list' });
  const list = () => setView({ name: 'list' });
  switch (view.name) {
    case 'detail':
      return (
        <ProductDetailScreen
          id={view.id}
          onBack={list}
          onEdit={() => setView({ name: 'edit', id: view.id })}
          onDeleted={list}
        />
      );
    case 'create':
      return (
        <ProductFormScreen
          mode="create"
          onBack={list}
          onDone={id => setView({ name: 'detail', id })}
        />
      );
    case 'edit':
      return (
        <EditLoader
          id={view.id}
          onBack={() => setView({ name: 'detail', id: view.id })}
          onDone={id => setView({ name: 'detail', id })}
        />
      );
    case 'low':
      return (
        <LowStockScreen
          onBack={list}
          onOpen={id => setView({ name: 'detail', id })}
        />
      );
    case 'scan':
      return (
        <ScanScreen
          onClose={list}
          onFound={id => setView({ name: 'detail', id })}
        />
      );
    default:
      return (
        <ProductsListScreen
          onOpen={id => setView({ name: 'detail', id })}
          onScan={() => setView({ name: 'scan' })}
          onLowStock={() => setView({ name: 'low' })}
          onCreate={() => setView({ name: 'create' })}
        />
      );
  }
}
