'use client';

import React, { useState } from 'react';

export default function HomePage() {
  // 📱 உங்களது அதிகாரப்பூர்வ வாட்ஸ்அப் எண் (நாட்டின் குறியீட்டுடன் மாற்றிக் கொள்ளவும்)
  const whatsappNumber = "94768989027"; 

  // மல்டிமீடியா வசதியுடன் கூடிய தயாரிப்புகள் (பல படங்கள் மற்றும் ஒரு வீடியோ கொண்ட கட்டமைப்பு)
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Premium Ceylon Cinnamon Powder",
      price: "$14.50",
      weight: "100g",
      // 📸 பல புகைப்படங்கள் (Array of Images)
      images: [
        "https://images.unsplash.com/photo-1608686207856-001b95cf60ca?q=80&w=400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?q=80&w=400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1611574530027-e818817b3ce5?q=80&w=400&auto=format&fit=crop"
      ],
      // 🎥 தயாரிப்பு வீடியோ (Sample Video)
      video: "https://www.w3schools.com/html/mov_bbb.mp4" 
    },
    {
      id: 2,
      name: "Pure Ceylon Cardamom Powder",
      price: "$18.20",
      weight: "100g",
      images: [
        "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?q=80&w=400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1608686207856-001b95cf60ca?q=80&w=400&auto=format&fit=crop"
      ],
      video: null
    }
  ]);

  // ஒவ்வொரு தயாரிப்புக்கும் தற்போதைய படம் எது என்பதைக் கண்காணிக்க (Active Image Index State)
  const [currentImageIndices, setCurrentImageIndices] = useState<{ [key: number]: number }>({
    1: 0,
    2: 0
  });

  // ஸ்லைடரில் அடுத்த படத்திற்குச் செல்ல
  const nextImage = (productId: number, totalImages: number) => {
    setCurrentImageIndices(prev => ({
      ...prev,
      [productId]: (prev[productId] + 1) % totalImages
    }));
  };

  // ஸ்லைடரில் முந்தைய படத்திற்குச் செல்ல
  const prevImage = (productId: number, totalImages: number) => {
    setCurrentImageIndices(prev => ({
      ...prev,
      [productId]: (prev[productId] - 1 + totalImages) % totalImages
    }));
  };

  const handleOrder = (productName: string) => {
    const message = `ஹலோ PURELY CEYLON ORGANIC, நான் இந்த தயாரிப்பை ஆர்டர் செய்ய விரும்புகிறேன்: ${productName}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#fcfbf7] text-[#2c3e2e] font-sans">
      
      {/* பிரீமியம் நேவிகேஷன் பார் */}
      <nav className="bg-[#2e5435] text-white p-4 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <span className="font-bold tracking-wider text-sm md:text-base">
            2026 PURELY CEYLON ORGANIC (PVT) LTD
          </span>
          <a href="/admin" className="bg-[#e8f0e9] text-[#2e5435] text-xs font-bold px-3 py-1.5 rounded-full hover:bg-white transition-all">
            Admin Portal ⚙️
          </a>
        </div>
      </nav>

      {/* ஹீரோ பேனர் */}
      <header className="bg-gradient-to-b from-[#e8f0e9] to-[#fcfbf7] py-16 px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <span className="text-[10px] font-bold tracking-widest text-[#52795d] uppercase bg-[#e8f0e9] px-3 py-1 rounded-full">
            Export Grade Quality
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-[#1e3322] tracking-tight">
            Pure & Organic Ceylon Spices
          </h1>
          <p className="text-sm text-[#5a6e5d] max-w-xl mx-auto">
            இலங்கையின் பாரம்பரியமிக்க தூய இயற்கை மசாலாப் பொருட்கள் இப்போது சர்வதேசத் தரத்தில் உங்கள் இல்லம் தேடி வருகிறது.
          </p>
        </div>
      </header>

      {/* தயாரிப்புகள் கிரிட் */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-xl font-bold text-[#1e3322] border-b border-[#e6e4dc] pb-3 mb-8 uppercase tracking-wider text-center md:text-left">
          Our Multimedia Catalog (தயாரிப்பு கட்லாக்)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {products.map((product) => {
            const activeIndex = currentImageIndices[product.id] || 0;
            return (
              <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-[#e6e4dc] overflow-hidden hover:shadow-md transition-all grid grid-cols-1 sm:grid-cols-2">
                
                {/* இடது பக்கம்: மல்டிமீடியா செக்‌ஷன் (Image Carousel / Video) */}
                <div className="bg-[#f4f6f4] relative flex flex-col justify-between min-h-[250px]">
                  
                  {/* இமேஜ் ஸ்லைடர் பகுதி */}
                  <div className="w-full h-48 relative overflow-hidden bg-black flex items-center justify-center">
                    <img 
                      src={product.images[activeIndex]} 
                      alt={product.name} 
                      className="w-full h-full object-cover"
                    />
                    
                    {/* ஸ்லைடர் கன்ட்ரோல் பட்டன்கள் (ஒன்றுக்கும் மேற்பட்ட படங்கள் இருந்தால் மட்டும் காட்டும்) */}
                    {product.images.length > 1 && (
                      <>
                        <button 
                          onClick={() => prevImage(product.id, product.images.length)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white w-6 h-6 rounded-full text-xs font-bold hover:bg-[#2e5435] transition-all"
                        >
                          ‹
                        </button>
                        <button 
                          onClick={() => nextImage(product.id, product.images.length)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white w-6 h-6 rounded-full text-xs font-bold hover:bg-[#2e5435] transition-all"
                        >
                          ›
                        </button>
                        
                        {/* இமேஜ் டாட்ஸ் (Dots) indicator */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                          {product.images.map((_, idx) => (
                            <span 
                              key={idx} 
                              className={`w-1.5 h-1.5 rounded-full ${idx === activeIndex ? 'bg-[#2e5435] w-3' : 'bg-white/60'} transition-all`}
                            />
                          ))}
                        </div>
                      </>
                    )}

                    <span className="absolute top-3 left-3 bg-[#2e5435] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                      {product.weight}
                    </span>
                  </div>

                  {/* வீடியோ பிளேயர் பகுதி (வீடியோ இருந்தால் மட்டும் கீழே காட்டும்) */}
                  {product.video ? (
                    <div className="p-2 bg-[#1e3322] border-t border-[#2e5435]">
                      <p className="text-[10px] text-[#8fa393] mb-1 font-bold">🎥 தயாரிப்பு வீடியோ விளம்பரம்:</p>
                      <video 
                        src={product.video} 
                        controls 
                        className="w-full h-24 rounded bg-black object-cover"
                      />
                    </div>
                  ) : (
                    <div className="p-3 text-center text-[10px] text-[#8fa393] italic bg-[#e8f0e9]/50">
                      No video available for this item
                    </div>
                  )}

                </div>

                {/* வலது பக்கம்: தயாரிப்பு விபரங்கள் */}
                <div className="p-6 flex flex-col justify-between space-y-4 border-t sm:border-t-0 sm:border-l border-[#e6e4dc]">
                  <div>
                    <span className="text-[10px] text-[#52795d] font-bold uppercase tracking-wider">Premium Agro Product</span>
                    <h3 className="font-bold text-lg text-[#1e3322] leading-tight mt-1">{product.name}</h3>
                    <p className="text-xl font-black text-[#2e5435] mt-3">{product.price}</p>
                    <p className="text-xs text-[#5a6e5d] mt-2 line-clamp-3">
                      100% தூய இயற்கை முறையில் தயாரிக்கப்பட்டு, ஏற்றுமதித் தரத்தில் பேக் செய்யப்பட்டது.
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => handleOrder(product.name)}
                    className="w-full bg-[#2e5435] hover:bg-[#1e3322] text-white text-xs font-bold py-3 rounded-xl tracking-wider uppercase transition-all flex items-center justify-center space-x-2 shadow-sm"
                  >
                    <span>Order via WhatsApp 💬</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </main>

      {/* ஃபுட்டர் */}
      <footer className="bg-[#1e3322] text-[#8fa393] text-center py-8 text-xs border-t border-[#2e5435] mt-12">
        <p>© 2026 PURELY CEYLON ORGANIC (PVT) LTD. All Rights Reserved.</p>
        <p className="mt-1 text-[10px] text-[#5a6e5d]">Premium Agro-Export Ecosystem</p>
      </footer>

    </div>
  );
}