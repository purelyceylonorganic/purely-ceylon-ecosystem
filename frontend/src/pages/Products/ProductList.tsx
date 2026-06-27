import { useEffect, useState } from "react";

import ProductCard from "../../components/product/ProductCard";

import { productService } from "../../services/product.service";

import type { Product } from "../../types/product.types";

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      setLoading(true);

      const response = await productService.getAllProducts();

      setProducts(response.data);
    } catch (err) {
      console.error(err);

      setError("Products load செய்ய முடியவில்லை.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <h2>Loading Products...</h2>;
  }

  if (error) {
    return <h2>{error}</h2>;
  }

  return (
    <div style={{ padding: "30px" }}>
      <h1>Purely Ceylon Products</h1>

      <p>Total Products : {products.length}</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))",
          gap: "20px",
        }}
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>
    </div>
  );
}