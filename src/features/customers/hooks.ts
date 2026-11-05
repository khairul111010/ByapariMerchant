import { useQuery } from '@tanstack/react-query';
import { usePagedList } from '../../api/paged';
import { CustomerSort, fetchCustomer, fetchCustomers } from './api';

export const useCustomers = (q: string | undefined, sort: CustomerSort) =>
  usePagedList(['customers', q, sort], (page) => fetchCustomers(q, sort, page));

export const useCustomer = (phone: string) => useQuery({ queryKey: ['customer', phone], queryFn: () => fetchCustomer(phone) });
