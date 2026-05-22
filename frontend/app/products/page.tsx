'use client';

import React, { useState, useMemo, useEffect } from 'react';

export default function OptimizedProductCatalog() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 🔍 State Management for Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [maxPrice, setMaxPrice] = useState(50);
  const [sortBy, setSortBy] = useState('rating');

  // 🌐 Client-side Performance Hydration (மின்னல் வேகத்தில் லோடு செய்தல்)
  useEffect(() => {
    const MOCK_PRODUCTS = [
      { id: '1', name: 'Premium Ceylon Cinnamon Sticks', category: 'Spices', price: 14.50, weight: '250g', rating: 4.9, image: '🪵', inStock: true },
      { id: '2', name: 'Pure Cardamom Powder', category: 'Spices', price: 18.20, weight: '500g', rating: 5.0, image: '🟢', inStock: true },
      { id: '3', name: 'Organic Whole Cloves', category: 'Spices', price: 12.00, weight: '250g', rating: 4.8, image: '🧆', inStock: true },
      { id: '4', name: 'White Pepper Whole', category: 'Spices', price: 9.50, weight: '1kg', rating: 4.7, image: '⚪', inStock: false },
      { id: '5', name: 'Natural Bee Honey', category: 'Wellness', price: 22.00, weight: '500g', rating: 4.9, image: '🍯', inStock: true },
    ];
    
    setProducts(MOCK_PRODUCTS);
    setLoading(false);
  }, []);

  // ⚡ CPU Memory Optimization: useMemo மூலம் வடிகட்டுதல் கணக்கீடுகளைச் சேமித்தல்
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesPrice = product.price <= maxPrice;
      return matchesSearch && matchesCategory && matchesPrice;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return b.rating - a.rating;
    });
  }, [products, searchQuery, selectedCategory, maxPrice, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfbf7] flex items-center justify-center font-mono text-xs text-[#2e5435] tracking-widest">
        ⚡ OPTIMIZED LOADING...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfbf7] text-[#2c3e2e] font-sans">
      
      {/* பிரீமியம் பதாகை */}
      <header className="bg-[#1e3322] text-white py-12 px-6 text-center border-b-4 border-[#2e5435]">
        <h1 className="text-3xl md:text-4xl font-black tracking-wide text-[#e8f0e9]">OUR ORGANIC CATALOG</h1>
        <p className="text-xs md:text-sm text-[#8fa393] mt-2 max-w-xl mx-auto uppercase tracking-widest">
          ⚡ Edge Optimized Catalog Engine for Blazing Fast Global Delivery
        </p>
      </header>

      {/* பிரதான கட்டமைப்பு */}
      <main className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* பில்டர் கண்ட்ரோல் பேனல் */}
        <aside className="bg-white p-6 rounded-2xl border border-[#e6e4dc] shadow-sm space-y-6 h-fit lg:sticky lg:top-6">
          <div className="flex justify-between items-center border-b border-[#e6e4dc] pb-3">
            <h3 className="font-bold text-base text-[#1e3322] flex items-center gap-2">🎛️ Filters & Sort</h3>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setMaxPrice(50); setSortBy('rating'); }}
              className="text-xs font-bold text-red-600 hover:underline"
            >
              Reset All
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-[#5a6e5d]">Search Product</label>
            <input 
              type="text" 
              placeholder="e.g., Cinnamon..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 rounded-xl border border-[#e6e4dc] bg-[#fcfbf7] text-sm focus:outline-none focus:ring-2 focus:ring-[#2e5435]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-[#5a6e5d]">Category</label>
            <div className="flex flex-wrap gap-2">
              {['All', 'Spices', 'Wellness'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    selectedCategory === cat 
                      ? 'bg-[#1e3322] text-white border-[#1e3322]' 
                      : 'bg-[#fcfbf7] border-[#e6e4dc] text-[#5a6e5d] hover:bg-[#e8f0e9]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold uppercase text-[#5a6e5d]">
              <span>Max Price</span>
              <span className="text-[#1e3322] font-black">${maxPrice}.00</span>
            </div>
            <input 
              type="range" 
              min="5" 
              max="50" 
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#2e5435]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-[#5a6e5d]">Sort By</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#e6e4dc] bg-[#fcfbf7] text-xs font-bold"
            >
              <option value="rating">⭐ Best Rating</option>
              <option value="price-low">📉 Price: Low to High</option>
              <option value="price-high">📈 Price: High to Low</option>
            </select>
          </div>
        </aside>

        {/* தயாரிப்பு கிரிட் */}
        <section className="lg:col-span-3 space-y-4">
          <div className="text-xs text-[#5a6e5d] font-bold uppercase tracking-wider flex justify-between items-center">
            <span>Showing {filteredProducts.length} products</span>
            <span className="text-green-600 font-mono text-[10px] bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">⚡ Client Hydrated</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                className="bg-white rounded-2xl border border-[#e6e4dc] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="bg-[#fcfbf7] h-44 flex items-center justify-center text-5xl border-b border-[#e6e4dc] relative">
                  {product.image}
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase text-[#5a6e5d]">
                      <span>{product.category}</span>
                      <span>⚖️ {product.weight}</span>
                    </div>
                    <h4 className="font-bold text-sm text-[#1e3322] line-clamp-2 leading-snug">{product.name}</h4>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Price</p>
                      <p className="text-lg font-black text-[#1e3322]">${product.price.toFixed(2)}</p>
                    </div>
                    <div className="text-right space-y-1.5">
                      <div className="text-xs font-bold text-amber-500">⭐ {product.rating.toFixed(1)}</div>
                      <button 
                        disabled={!product.inStock}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                          product.inStock 
                            ? 'bg-[#2e5435] text-white hover:bg-[#1e3322] shadow-sm' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {product.inStock ? 'Add to Cart 🛒' : 'Out of Stock'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}