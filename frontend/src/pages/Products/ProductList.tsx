import { useEffect, useState } from "react";
import ProductCard from "../../components/product/ProductCard";
import { productService } from "../../services/product.service";
import { categoryService } from "../../services/category.service";
import type { Product } from "../../types/product.types";

type Category = {
  id: string;
  name: string;
};

export default function ProductList() {
  // ===========================
  // State
  // ===========================

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ===========================
  // Load Categories
  // ===========================

  async function loadCategories() {
    try {
      const response = await categoryService.getAllCategories();

      setCategories(response);
    } catch (err) {
      console.error(err);
    }
  }

  // ===========================
  // Load Products (திருத்தப்பட்ட பகுதி)
  // ===========================

  async function loadProducts() {
    try {
      setLoading(true);

      let response;

      if (search || selectedCategory) {
        response = await productService.searchProducts({
          name: search, // searchText என்பதற்கு பதிலாக search என மாற்றப்பட்டுள்ளது
          categoryId: selectedCategory
        });
      } else {
        response = await productService.getProducts({
          page: 1,
          limit: 10
        });
      }

      // API-ல் இருந்து வரும் தரவு ஒரு Object-ஆக இருந்தால், 
      // அதில் உள்ள 'products' என்ற Array-ஐ மட்டும் எடுக்கிறோம்.
      // ஒருவேளை உங்கள் API நேரடியாக array-ஐ அனுப்பினால், இது தானாகவே அதை கையாளும்.
      const data = Array.isArray(response) ? response : (response as any).products;
      
      setProducts(data || []);
      
    } catch (err) {
      console.error(err);
      setError("Products load செய்ய முடியவில்லை.");
    } finally {
      setLoading(false);
    }
  }
  // ===========================
  // Effects
  // ===========================

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [search, selectedCategory]);

  // ===========================
  // Loading
  // ===========================

  if (loading) {
    return <h2>Loading Products...</h2>;
  }

  if (error) {
    return <h2>{error}</h2>;
  }

  // ===========================
  // UI
  // ===========================

  return (
    <div style={{ padding: "30px" }}>
      <h1>Purely Ceylon Products</h1>

      <div
        style={{
          display: "flex",
          gap: "15px",
          margin: "20px 0",
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="Search Products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "12px",
            width: "300px",
            borderRadius: "8px",
          }}
        />

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            padding: "12px",
            minWidth: "250px",
            borderRadius: "8px",
          }}
        >
          <option value="">All Categories</option>

          {categories.map((category) => (
            <option
              key={category.id}
              value={category.id}
            >
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <p>Total Products : {products.length}</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill,minmax(250px,1fr))",
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