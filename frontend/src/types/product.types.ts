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
  slug:string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  weight: string;
  price: number;
  costPrice: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;        // இதையும் சேர்க்கவும்
  image: string;        // இதையும் சேர்க்கவும்
  rating: number;       // இதையும் சேர்க்கவும்
  status: string;
  categoryId:string;
  moq:number;
  basePrice: number;
  stock: number;
  weight: number;      // ✅ இதை சேர்க்க வேண்டும்
  sku: string;         // ✅ இதையும் சேர்க்க வேண்டும்
  isActive: boolean;
  createdAt:string;
  images: ProductImage[];
  videos: ProductVideo[];
  category: ProductCategory;
  variants: ProductVariant[];
}
export interface ProductResponse {

 products: Product[];

 pagination:{
   total:number;
   page:number;
   limit:number;
   totalPages:number;
 }

}