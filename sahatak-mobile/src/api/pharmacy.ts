import { apiClient } from './client';
import { Product } from '../types';
import { POPULAR_PRODUCTS } from '../data/mockData';

export const fetchProductsApi = async (params?: { category?: string; query?: string }): Promise<Product[]> => {
  try {
    const response = await apiClient.get('/pharmacy/products', { params });
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    return POPULAR_PRODUCTS;
  } catch {
    let prods = POPULAR_PRODUCTS;
    if (params?.category && params.category !== 'all') {
      prods = prods.filter((p) => p.category.toLowerCase() === params.category?.toLowerCase());
    }
    if (params?.query) {
      const q = params.query.toLowerCase();
      prods = prods.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.nameAr.includes(q) ||
          p.shortDesc.toLowerCase().includes(q)
      );
    }
    return prods;
  }
};

export const fetchProductByIdApi = async (id: string): Promise<Product | null> => {
  try {
    const response = await apiClient.get(`/pharmacy/products/${id}`);
    return response.data;
  } catch {
    return POPULAR_PRODUCTS.find((p) => p.id === id) || null;
  }
};

