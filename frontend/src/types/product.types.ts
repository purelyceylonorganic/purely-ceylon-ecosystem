export interface ProductImage {
  id: string;
  url: string;
  isPrimary: boolean;
}

export interface ProductVideo {
  id: string;
  url: string;
}

export interface ProductCategory {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  sku: string;

  basePrice: number;
  stock: number;
  weight: number;

  isActive: boolean;

  images: ProductImage[];
  videos: ProductVideo[];

  category?: ProductCategory;
}