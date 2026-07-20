export interface Category {
  id: string;
  name: string;
  slug: string;

  _count: {
    products: number;
  };
}