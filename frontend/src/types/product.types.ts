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

export interface ProductVariant {
  id: string;
  sku: string;
  stock: number;
  price: number;
}

export interface Product {
  id: string;

  name: string;
  slug: string;
  description: string;

  basePrice: number;
  stock: number;
  weight: number;      // ✅ இதை சேர்க்க வேண்டும்
  sku: string;         // ✅ இதையும் சேர்க்க வேண்டும்

  isActive: boolean;

  images: ProductImage[];
  videos: ProductVideo[];

  category?: ProductCategory;

  variants?: ProductVariant[];
}