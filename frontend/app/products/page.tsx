'use client';

import React, { useState, useMemo } from 'react';

// 📚 3 மொழிகளுக்கான உள்ளடக்க மேட்ரிக்ஸ் (Multi-Language Translation Data)
const TRANSLATIONS: any = {
  EN: {
    title: 'OUR ORGANIC CATALOG',
    sub: '100% Certified Pure Ceylon Spices Direct From Estates',
    search: 'Search Product...',
    category: 'Category',
    all: 'All',
    spices: 'Spices',
    wellness: 'Wellness',
    price: 'Max Price',
    sort: 'Sort By',
    cart: 'Add to Cart 🛒',
    stock: 'Out of Stock'
  },
  TM: {
    title: 'ஆர்கானிக் தயாரிப்புகள் பட்டியல்',
    sub: 'எஸ்டேட்களில் இருந்து நேரடியாக பெறப்பட்ட 100% சான்றளிக்கப்பட்ட தூய இலங்கை மசாலாப் பொருட்கள்',
    search: 'தயாரிப்பைத் தேடுக...',
    category: 'வகைப்பாடு',
    all: 'அனைத்தும்',
    spices: 'மசாலாப் பொருட்கள்',
    wellness: 'உடல்நலம்',
    price: 'அதிகபட்ச விலை',
    sort: 'வரிசைப்படுத்துக',
    cart: 'கூடையில் சேர் 🛒',
    stock: 'கையிருப்பில் இல்லை'
  },
  SI: {
    title: 'අපගේ කාබනික නිෂ්පාදන',
    sub: 'වතුකරයෙන් සෘජුවම ලබාගත් 100% සහතික ලත් පිරිසිදු ලංකා කුළුබඩු',
    search: 'නිෂ්පාදනය සොයන්න...',
    category: 'වර්ගීකරණය',
    all: 'සියල්ල',
    spices: 'කුළුබඩු',
    wellness: 'සෞඛ්‍යය',
    price: 'උපරිම මිල',
    sort: 'පිළිවෙල සකසන්න',
    cart: 'කාඩ් එකට එකතු කරන්න 🛒',
    stock: 'තොග අවසන්'
  }
};

const MOCK_PRODUCTS = [
  { id: '1', name: 'Premium Ceylon Cinnamon Sticks', category: 'Spices', price: 14.50, weight: '250g', rating: 4.9, image: '🪵' },
  { id: '2', name: 'Pure Cardamom Powder', category: 'Spices', price: 18.20, weight: '500g', rating: 5.0, image: '🟢' },
  { id: '3', name: 'Organic Whole Cloves', category: 'Spices', price: 12.00, weight: '250g', rating: 4.8, image: '🧆' }
];

export default function LanguageOptimizedCatalog() {
  const [lang, setLang] = useState('EN'); // EN, TM, SI
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [maxPrice, setMaxPrice] = useState(50);
  const [selectedProduct, setSelectedProduct] = useState<any>(null); // For Dynamic Detail View

  const text = TRANSLATIONS[lang];

  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesPrice = p.price <= maxPrice;
      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [searchQuery, selectedCategory, maxPrice]);

  return (
    <div className="min-h-screen bg-[#fcfbf7] text-[#2c3e2e] font-sans pb-12">
      
      {/* 🌐 Global Language Switcher Bar */}
      <div className="bg-[#152418] py-2 px-6 flex justify-end gap-3 text-white border-b border-[#2e5435]">
        {['EN', 'TM', 'SI'].map((l) => (
          <button 
            key={l} 
            onClick={() => setLang(l)}
            className={`text-xs font-black px-2 py-0.5 rounded ${lang === l ? 'bg-[#2e5435] text-[#e8f0e9]' : 'text-gray-400 hover:text-white'}`}
          >
            {l === 'EN' ? 'English' : l === 'TM' ? 'தமிழ்' : 'සිංහල'}
          </button>
        ))}
      </div>

      <header className="bg-[#1e3322] text-white py-12 px-6 text-center">
        <h1 className="text-2xl md:text-4xl font-black tracking-wide uppercase">{text.title}</h1>
        <p className="text-xs text-[#8fa393] mt-2 max-w-xl mx-auto">{text.sub}</p>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filters Panel */}
        <aside className="bg-white p-6 rounded-2xl border border-[#e6e4dc] space-y-6 h-fit">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-[#5a6e5d]">{text.search}</label>
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 rounded-xl border border-[#e6e4dc] text-sm bg-[#fcfbf7]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-[#5a6e5d]">{text.category}</label>
            <div className="flex flex-wrap gap-2">
              {['All', 'Spices', 'Wellness'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${selectedCategory === cat ? 'bg-[#1e3322] text-white' : 'bg-[#fcfbf7] text-[#5a6e5d]'}`}
                >
                  {cat === 'All' ? text.all : cat === 'Spices' ? text.spices : text.wellness}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <section className="lg:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                onClick={() => setSelectedProduct(product)} // ⚡ க்ளிக் செய்யும் போது உள்ளே செல்லும் லாஜிக்
                className="bg-white rounded-2xl border border-[#e6e4dc] overflow-hidden shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
              >
                <div className="bg-[#fcfbf7] h-40 flex items-center justify-center text-5xl border-b border-[#e6e4dc]">
                  {product.image}
                </div>
                <div className="p-5 space-y-3">
                  <h4 className="font-bold text-sm text-[#1e3322] hover:underline">{product.name}</h4>
                  <div className="flex justify-between items-center">
                    <span className="text-base font-black">${product.price.toFixed(2)}</span>
                    <span className="text-xs text-gray-400">⚖️ {product.weight}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* 📦 படி 3: தயாரிப்பின் உட்பக்க விவரங்கள் (Dynamic Product Detail Modal-View Layer) */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 relative border border-[#e6e4dc]">
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black font-bold text-xl"
            >
              ✕
            </button>
            <div className="bg-[#fcfbf7] rounded-2xl flex items-center justify-center text-7xl p-8 border border-[#e6e4dc]">
              {selectedProduct.image}
            </div>
            <div className="flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] bg-[#e8f0e9] text-[#2e5435] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {selectedProduct.category}
                </span>
                <h2 className="text-xl font-black text-[#1e3322] leading-tight">{selectedProduct.name}</h2>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Our organic products are sustainably sourced, expertly harvested, and packed under stringent quality parameters to retain natural aroma and purity.
                </p>
              </div>
              <div className="border-t border-b border-[#e6e4dc] py-3 flex justify-between items-center">
                <span className="text-2xl font-black text-[#1e3322]">${selectedProduct.price.toFixed(2)}</span>
                <span className="text-xs font-bold text-[#5a6e5d]">Pack Size: {selectedProduct.weight}</span>
              </div>
              <button className="w-full bg-[#2e5435] hover:bg-[#1e3322] text-white font-black py-3 rounded-xl text-xs uppercase tracking-wider transition-all">
                {text.cart}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}