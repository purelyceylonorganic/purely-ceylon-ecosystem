import { useEffect, useState } from "react";
import { productService } from "../../../services/product.service";

interface Props {
  onSelect: (variantId: string) => void;
}

export default function ProductSearch({ onSelect }: Props) {
  const [keyword, setKeyword] = useState("");
  const [products, setProducts] = useState<any[]>([]);

  // Step 2.1 & Step 2.3: Debounce வசதியுடன் தயாரிப்புகளை தேடும் செயல்பாடு
  const loadProducts = async () => {
    try {
      const data = await productService.searchProducts(keyword);
      setProducts(data);
    } catch (error) {
      console.error("Unable to search products", error);
    }
  };

  // Step 2.3 & 2.4: Initial load மற்றும் keyword மாறும்போது 300ms தாமதத்துடன் API-ஐ அழைத்தல்
  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 300);

    return () => clearTimeout(timer);
  }, [keyword]);

  return (
    <div className="rounded-lg border bg-white p-6 shadow space-y-4">
      <h2 className="text-xl font-bold">Product Search</h2>

      {/* Step 2.2: தேடுதல் உள்ளீடு (Search Input) */}
      <input
        className="w-full rounded border p-3"
        placeholder="Search product by name..."
        value={keyword}
        onChange={(e) => {
          setKeyword(e.target.value);
        }}
      />

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {products.length === 0 ? (
          <p className="text-gray-500">No products found</p>
        ) : (
          products.map((product) => (
            <div key={product.id} className="rounded border p-4 bg-gray-50 space-y-2">
              <h3 className="font-bold text-lg">{product.name}</h3>

              {product.variants?.map((variant: any) => (
                <div
                  key={variant.id}
                  className="flex items-center justify-between border-t pt-2 mt-2"
                >
                  <div>
                    <p className="text-sm text-gray-600">
                      Weight: <span className="font-semibold">{variant.weight}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Price: <span className="font-semibold">LKR {variant.price}</span>
                    </p>
                    {variant.stock !== undefined && (
                      <p className="text-sm text-gray-600">
                        Stock: <span className="font-semibold">{variant.stock}</span>
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => onSelect(variant.id)}
                    className="rounded bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}