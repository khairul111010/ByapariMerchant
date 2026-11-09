import React, { useEffect, useState } from 'react';
import { useJump } from '../../store/jump';
import { CategoriesScreen } from '../categories/CategoriesScreen';
import { CategoryFormScreen } from '../categories/CategoryFormScreen';
import { ImportScreen } from '../imports/ImportScreen';
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
  | { name: 'categories' }
  | { name: 'import' }
  | { name: 'category'; id: number | null }
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
  const jump = useJump(s => s.target);
  const clearJump = useJump(s => s.clear);
  // Home tiles and the "+" sheet open Add product, Scan or Low stock directly.
  useEffect(() => {
    if (jump?.tab === 'Products') {
      setView({ name: jump.screen } as View);
      clearJump();
    }
  }, [jump, clearJump]);
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
    case 'import':
      return <ImportScreen onBack={list} />;
    case 'categories':
      return (
        <CategoriesScreen
          onBack={list}
          onAdd={() => setView({ name: 'category', id: null })}
          onEdit={id => setView({ name: 'category', id })}
        />
      );
    case 'category':
      return (
        <CategoryFormScreen
          id={view.id}
          onBack={() => setView({ name: 'categories' })}
          onDone={() => setView({ name: 'categories' })}
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
          onCategories={() => setView({ name: 'categories' })}
          onImport={() => setView({ name: 'import' })}
        />
      );
  }
}
