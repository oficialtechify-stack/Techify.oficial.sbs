import React, { useState } from 'react';
import { CornerDownLeft, ShoppingBag, Heart, Menu, X, ArrowRight, ArrowLeft, Star, Facebook, Instagram, Twitter, Youtube, Check } from 'lucide-react';

interface MugsysMugsShowcaseProps {
  onBack: () => void;
}

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  category: string;
  description: string;
}

const PRODUCTS: Product[] = [
  {
    id: 'classic',
    name: "The Classic",
    price: 120,
    originalPrice: 200,
    image: "https://i.postimg.cc/1zN0rTcN/img-1.jpg",
    category: "Classic",
    description: "Nossa caneca tradicional de cerâmica pesada com acabamento esmaltado fosco. Ideal para sua dose diária de café."
  },
  {
    id: 'camper',
    name: "The Camper",
    price: 80,
    originalPrice: 200,
    image: "https://i.postimg.cc/zGQSW-5Wk/img-2.jpg",
    category: "Outdoor",
    description: "Caneca ultraleve de metal esmaltado de alta resistência, projetada para fogueiras de acampamento e trilhas."
  },
  {
    id: 'couple',
    name: "The Couple",
    price: 150,
    originalPrice: 200,
    image: "https://i.postimg.cc/Bv15BycF/img-3.jpg",
    category: "Special",
    description: "Conjunto exclusivo de duas canecas complementares feitas à mão com infusão de terracota natural."
  },
  {
    id: 'ridge',
    name: "The Ridge",
    price: 70,
    originalPrice: 200,
    image: "https://i.postimg.cc/tgVdNftx/img-4.jpg",
    category: "Minimalist",
    description: "Com ranhuras texturizadas para melhor aderência e isolamento térmico premium. Estética vanguardista purificada."
  },
  {
    id: 'dreams',
    name: "Dreams",
    price: 60,
    originalPrice: 200,
    image: "https://i.postimg.cc/0NJG03dm/img-5.jpg",
    category: "Artistic",
    description: "Caneca artística pintada com tons cósmicos pastel, feita em porcelana fina de alta ebulição."
  },
  {
    id: 'vanlife',
    name: "Van Life",
    price: 110,
    originalPrice: 200,
    image: "https://i.postimg.cc/YSmNzVfY/img-6.jpg",
    category: "Outdoor",
    description: "Caneca de parede dupla isolada a vácuo com tampa protetora contra respingos, perfeita para estradas."
  },
  {
    id: 'bold',
    name: "The Bold",
    price: 140,
    originalPrice: 200,
    image: "https://i.postimg.cc/KYg7DVrt/img-7.jpg",
    category: "Classic",
    description: "Uma versão de grande volume (500ml) com alça anatômica espaçosa e esmalte preto vulcânico texturizado."
  },
  {
    id: 'traveler',
    name: "The Traveler",
    price: 180,
    originalPrice: 200,
    image: "https://i.postimg.cc/9fqPYStG/img-8.jpg",
    category: "Outdoor",
    description: "Caneca térmica profissional em liga de titânio com controle analógico de temperatura em tempo real."
  },
  {
    id: 'savor',
    name: "The Savor",
    price: 50,
    originalPrice: 200,
    image: "https://i.postimg.cc/25Bd7JFQ/img-9.jpg",
    category: "Minimalist",
    description: "Pequena caneca aperfeiçoada para café espresso duplo, preservando a crema e distribuindo o aroma uniformemente."
  }
];

export default function MugsysMugsShowcase({ onBack }: MugsysMugsShowcaseProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [favorited, setFavorited] = useState<Record<string, boolean>>({});
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [filter, setFilter] = useState<string>('Todos');
  const [notifications, setNotifications] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Trigger temporary notification toast
  const addNotification = (message: string) => {
    setNotifications((prev) => [...prev, message]);
    setTimeout(() => {
      setNotifications((prev) => prev.slice(1));
    }, 3000);
  };

  const handleToggleFavorite = (id: string, name: string) => {
    setFavorited((prev) => {
      const updated = !prev[id];
      addNotification(updated ? `❤️ "${name}" adicionado aos favoritos!` : `💔 "${name}" removido dos favoritos.`);
      return { ...prev, [id]: updated };
    });
  };

  const handleAddToCart = (id: string, name: string) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    addNotification(`🛍️ "${name}" adicionado à sacola!`);
  };

  const handleRemoveFromCart = (id: string) => {
    setCart((prev) => {
      const updated = { ...prev };
      if (updated[id] > 1) {
        updated[id]--;
      } else {
        delete updated[id];
      }
      return updated;
    });
  };

  const categories = ['Todos', 'Classic', 'Outdoor', 'Minimalist', 'Artistic', 'Special'];
  const filteredProducts = filter === 'Todos' ? PRODUCTS : PRODUCTS.filter(p => p.category === filter);

  // Calculate cart metrics
  const totalCartItems = (Object.values(cart) as number[]).reduce((a, b) => a + b, 0);
  const totalCartPrice = (Object.entries(cart) as [string, number][]).reduce((sum, [id, qty]) => {
    const p = PRODUCTS.find((prod) => prod.id === id);
    return sum + (p ? p.price * qty : 0);
  }, 0);

  return (
    <div className="relative min-h-screen bg-[#F0F2F9] text-[#090909] font-sans antialiased px-3.5 pt-3.5 pb-12 selection:bg-[#F1BF0A] selection:text-black">
      
      {/* Absolute floating helper on top-left to go back to parent portfolio */}
      <div className="fixed top-6 left-6 z-50">
        <button
          onClick={onBack}
          className="bg-white/90 backdrop-blur border border-neutral-200 rounded-full px-5 py-2.5 text-xs font-bold text-neutral-800 hover:text-black hover:bg-white flex items-center gap-2 transition-all cursor-pointer shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
        >
          <CornerDownLeft className="h-4 w-4 text-[#183fad]" />
          <span>Voltar ao Portfólio</span>
        </button>
      </div>

      {/* Floating Active Cart trigger button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setCartDrawerOpen(true)}
          className="bg-[#183fad] hover:bg-[#1e4dc9] text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center relative cursor-pointer group"
        >
          <ShoppingBag className="h-6 w-6" />
          {totalCartItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#F1BF0A] text-black font-extrabold text-[11px] h-5 w-5 rounded-full flex items-center justify-center animate-bounce shadow">
              {totalCartItems}
            </span>
          )}
          <span className="absolute right-full mr-3 bg-neutral-950 text-white rounded-md px-2.5 py-1 text-[10px] uppercase font-black tracking-wider opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md">
            Ver Sacola (${totalCartPrice})
          </span>
        </button>
      </div>

      {/* Slide-out Shopping Cart Drawer Side panel overlay */}
      {cartDrawerOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex justify-end">
          <div className="absolute inset-0" onClick={() => setCartDrawerOpen(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col p-6 z-10 animate-slide-left">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-[#183fad]" />
                <h2 className="text-lg font-extrabold text-[#090909]">Minha Sacola</h2>
                <span className="bg-neutral-100 px-2 py-0.5 rounded text-xs font-bold">{totalCartItems}</span>
              </div>
              <button
                onClick={() => setCartDrawerOpen(false)}
                className="hover:bg-neutral-100 p-1.5 rounded-full text-neutral-500 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              {totalCartItems === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <ShoppingBag className="h-16 w-16 text-neutral-300 mb-4 stroke-[1.25]" />
                  <p className="text-neutral-500 font-bold mb-2">Sua sacola está vazia</p>
                  <p className="text-neutral-400 text-xs">Adicione canecas exclusivas da nossa coleção de tiragem limitada.</p>
                </div>
              ) : (
                Object.entries(cart).map(([id, qty]) => {
                  const p = PRODUCTS.find((item) => item.id === id);
                  if (!p) return null;
                  return (
                    <div key={id} className="flex items-center gap-4 bg-neutral-50 p-3 rounded-2xl border border-neutral-100">
                      <img src={p.image} alt={p.name} className="w-16 h-16 object-cover rounded-xl shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-extrabold text-sm text-[#090909] truncate">{p.name}</h4>
                        <p className="text-xs text-neutral-400 uppercase font-medium">{p.category}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-extrabold text-sm text-[#183fad]">${p.price}</span>
                          <span className="text-[10px] text-neutral-400 line-through">${p.originalPrice}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 border border-neutral-200 bg-white rounded-full p-1 self-center scale-90">
                        <button
                          onClick={() => handleRemoveFromCart(id)}
                          className="w-6 h-6 rounded-full hover:bg-neutral-100 flex items-center justify-center font-bold text-xs cursor-pointer"
                        >
                          -
                        </button>
                        <span className="font-bold text-xs px-1 min-w-[12px] text-center">{qty}</span>
                        <button
                          onClick={() => handleAddToCart(id, p.name)}
                          className="w-6 h-6 rounded-full hover:bg-neutral-100 flex items-center justify-center font-bold text-xs cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {totalCartItems > 0 && (
              <div className="border-t border-neutral-100 pt-6 space-y-4 bg-white">
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-neutral-500">
                    <span>Subtotal</span>
                    <span>${totalCartPrice}.00</span>
                  </div>
                  <div className="flex justify-between text-neutral-500">
                    <span>Frete</span>
                    <span className="text-emerald-600 font-bold uppercase text-xs">Grátis</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-[#090909] pt-2 border-t border-dashed border-neutral-200">
                    <span>Total Estimado</span>
                    <span>${totalCartPrice}.00</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setCart({});
                    setCartDrawerOpen(false);
                    addNotification('✨ Pedido enviado com sucesso de forma simulada!');
                  }}
                  className="w-full bg-[#183fad] hover:bg-[#1e4dc9] text-white py-3.5 rounded-full font-black text-xs uppercase tracking-widest transition-transform hover:scale-[1.02] cursor-pointer"
                >
                  Finalizar Compra
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Product Highlight Modal Preview Dialog */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[220] flex items-center justify-center p-4">
          <div className="absolute inset-0" onClick={() => setSelectedProduct(null)} />
          <div className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col md:flex-row max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-visible animate-scale-up">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 p-2 rounded-full text-white z-20 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="w-full md:w-1/2 min-h-[250px] bg-[#e9ecf6] flex items-center justify-center p-4">
              <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full max-h-[350px] object-cover rounded-2xl shadow-md" />
            </div>

            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between">
              <div>
                <span className="text-xs text-amber-500 font-bold uppercase tracking-widest">{selectedProduct.category}</span>
                <h3 className="font-anton text-3xl text-[#090909] mt-1 uppercase">{selectedProduct.name}</h3>
                
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-2xl font-black text-[#183fad]">${selectedProduct.price}</span>
                  <span className="text-sm text-neutral-400 line-through">${selectedProduct.originalPrice}</span>
                  <span className="bg-[#F1BF0A] text-black font-extrabold text-[10px] px-2 py-0.5 rounded uppercase">Oferta</span>
                </div>

                <div className="flex items-center gap-1 text-amber-500 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                  ))}
                  <span className="text-xs text-neutral-500 font-bold ml-1.5">(4.9/5 estrelas de usuários)</span>
                </div>

                <p className="text-sm text-neutral-600 mt-5 leading-relaxed">
                  {selectedProduct.description}
                </p>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => {
                    handleAddToCart(selectedProduct.id, selectedProduct.name);
                    setSelectedProduct(null);
                  }}
                  className="flex-1 bg-[#183fad] hover:bg-[#1e4dc9] text-white py-3 rounded-full font-black text-[11px] uppercase tracking-wider transition-all duration-300 shadow-md cursor-pointer"
                >
                  Adicionar à Sacola
                </button>
                <button
                  onClick={() => handleToggleFavorite(selectedProduct.id, selectedProduct.name)}
                  className="bg-neutral-100 hover:bg-neutral-200 p-3 rounded-full transition-colors flex items-center justify-center cursor-pointer"
                >
                  <Heart className={`h-5 w-5 ${favorited[selectedProduct.id] ? 'fill-red-500 text-red-500' : 'text-neutral-500'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Notifications Toasts */}
      <div className="fixed top-6 right-6 z-[250] flex flex-col gap-2 max-w-sm w-full">
        {notifications.map((msg, i) => (
          <div
            key={i}
            className="bg-neutral-900 border border-neutral-800 text-white py-3.5 px-5 rounded-2xl shadow-2xl flex items-center gap-3 animate-slide-left text-xs font-bold uppercase tracking-wider"
          >
            <Check className="h-4 w-4 text-[#F1BF0A] shrink-0" />
            <span>{msg}</span>
          </div>
        ))}
      </div>


      {/* --- MAIN HEADER NAVIGATION MENU BAR --- */}
      <nav className="flex items-center justify-between max-w-5xl mx-auto relative z-50 overflow-visible bg-white rounded-3xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] border border-neutral-100 p-1">
        
        {/* Brand identity logo block on Left with customized SVG */}
        <div className="flex items-center gap-3 bg-white px-5 py-4 rounded-3xl relative after:content-[''] after:absolute after:bg-[#183fad] after:w-1/2 after:h-1/2 after:-bottom-1 after:-right-1 after:-z-[5] self-stretch max-w-52">
          <svg width="34" height="34" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 animate-pulse">
            <rect width="40" height="40" rx="6" fill="#F1BF0A" />
            <path d="M15.3414 14.7356C15.4039 15.1058 15.726 15.3846 16.1106 15.3846H16.9039C17.375 15.3846 17.75 14.976 17.6875 14.5192C17.5048 13.1635 16.899 11.9135 15.9279 10.9279C15.2356 10.2212 14.7933 9.32692 14.6587 8.35577C14.6058 7.97596 14.2789 7.69231 13.8846 7.69231H13.0962C12.625 7.69231 12.2596 8.10096 12.3125 8.55769C12.5 10.0913 13.1779 11.5048 14.2644 12.6154C14.8414 13.2019 15.2115 13.9375 15.3414 14.7356ZM20.726 14.7356C20.7885 15.1058 21.1106 15.3846 21.4952 15.3846H22.2885C22.7596 15.3846 23.1346 14.976 23.0721 14.5192C22.8894 13.1635 22.2837 11.9135 21.3125 10.9279C20.6202 10.2212 20.1779 9.32692 20.0433 8.35577C19.9904 7.97596 19.6635 7.69231 19.2692 7.69231H18.4808C18.0096 7.69231 17.6394 8.10096 17.6971 8.55769C17.8846 10.0913 18.5625 11.5048 19.649 12.6154C20.226 13.2019 20.5962 13.9375 20.726 14.7356ZM28.4615 16.9231H10.7692C9.91827 16.9231 9.23077 17.6106 9.23077 18.4615V27.6923C9.23077 30.2404 11.2981 32.3077 13.8462 32.3077H23.0769C25.625 32.3077 27.6923 30.2404 27.6923 27.6923H28.4615C31.4327 27.6923 33.8462 25.2788 33.8462 22.3077C33.8462 19.3365 31.4327 16.9231 28.4615 16.9231ZM28.4615 24.6154H27.6923V20H28.4615C29.7356 20 30.7692 21.0337 30.7692 22.3077C30.7692 23.5817 29.7356 24.6154 28.4615 24.6154Z" fill="#090909" />
          </svg>
          <span className="font-anton select-none text-[#090909] text-base tracking-wider">MUGSY'S MUGS</span>
        </div>

        {/* Navigation Core links with right background stack container */}
        <div className="flex items-center justify-end md:justify-between gap-4 flex-1 bg-[#183fad] text-white p-3.5 rounded-2xl md:rounded-r-3xl">
          <div className="hidden md:block"></div>

          <ul className="hidden md:flex items-center gap-7 py-2.5 font-bold tracking-wider text-xs uppercase text-slate-200">
            <li><a href="#hero" className="hover:text-[#F1BF0A] transition-colors">Home</a></li>
            <li><a href="#about" className="hover:text-[#F1BF0A] transition-colors">About</a></li>
            <li><a href="#collection" className="hover:text-[#F1BF0A] transition-colors">Company</a></li>
            <li><a href="#about" className="hover:text-[#F1BF0A] transition-colors">Stores</a></li>
          </ul>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden cursor-pointer rounded p-1 hover:bg-white/10 text-white transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="size-8" /> : <Menu className="size-8" />}
          </button>

          {/* Swipe continuous expansion exploration button */}
          <a
            href="#collection"
            className="hidden sm:flex items-center gap-2 bg-[#F1BF0A] rounded-full py-2 pl-2 pr-5 text-[#090909] whitespace-nowrap relative group overflow-hidden cursor-pointer shadow-lg font-bold text-xs uppercase tracking-wider"
          >
            {/* The circular expansion bubble behind */}
            <div className="absolute inset-0 bg-white translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-out z-0" />
            
            <div className="rounded-full p-1.5 bg-[#090909] text-white relative z-10 scale-90 group-hover:bg-[#F1BF0A] group-hover:text-black transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="size-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
              </svg>
            </div>
            <span className="relative z-10 text-[#090909] font-black group-hover:translate-x-1.5 transition-transform duration-300">EXPLORE COLLECTION</span>
          </a>
        </div>
      </nav>

      {/* Custom Scoped Mobile Collapsible Navigation Overlay */}
      {mobileMenuOpen && (
        <div className="mx-auto max-w-5xl bg-neutral-900 text-white rounded-2xl p-6 mt-2 space-y-4 md:hidden z-40 relative animate-fade-in">
          <ul className="space-y-3 font-bold text-sm tracking-wider uppercase">
            <li><a href="#hero" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded hover:bg-neutral-800 hover:text-[#F1BF0A]">Home</a></li>
            <li><a href="#about" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded hover:bg-neutral-800 hover:text-[#F1BF0A]">About</a></li>
            <li><a href="#collection" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded hover:bg-neutral-800 hover:text-[#F1BF0A]">Company</a></li>
            <li><a href="#about" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded hover:bg-neutral-800 hover:text-[#F1BF0A]">Stores</a></li>
          </ul>
          <div className="pt-2 border-t border-neutral-800">
            <a
              href="#collection"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 bg-[#F1BF0A] text-black font-extrabold text-xs uppercase py-3.5 rounded-full"
            >
              Explore Collection
            </a>
          </div>
        </div>
      )}


      {/* --- HEADER IMPRESSIVE SECTION HERO SYSTEM --- */}
      <header id="hero" className="max-w-5xl mx-auto bg-[#183fad] text-white px-4 md:px-8 pb-6 md:pb-8 pt-8 sm:pt-14 rounded-3xl mt-4 relative z-0 overflow-hidden shadow-2xl">
        
        {/* Giant header text "MUGSY'S" vector structure */}
        <svg viewBox="0 0 39 11" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto max-w-[62rem] object-contain w-full drop-shadow-xl select-none">
          <path d="M0 10.418V0.105469H3.14062L4.00781 6.39258L4.86914 0.105469H8.03906V10.418H6.15234V2.98828L4.96875 10.418H3.11719L1.86328 2.98828V10.418H0Z" fill="white" />
          <path d="M11.3379 10.5117C10.4785 10.5117 9.8457 10.2715 9.43945 9.79102C9.0332 9.30664 8.83008 8.5957 8.83008 7.6582V0.105469H10.834V7.57617C10.834 7.74805 10.8438 7.91406 10.8633 8.07422C10.8828 8.23047 10.9277 8.35938 10.998 8.46094C11.0684 8.5625 11.1816 8.61328 11.3379 8.61328C11.498 8.61328 11.6133 8.56445 11.6836 8.4668C11.7539 8.36523 11.7969 8.23438 11.8125 8.07422C11.832 7.91406 11.8418 7.74805 11.8418 7.57617V0.105469H13.8457V7.6582C13.8457 8.5957 13.6426 9.30664 13.2363 9.79102C12.8301 10.2715 12.1973 10.5117 11.3379 10.5117Z" fill="white" />
          <path d="M16.7637 10.5117C15.291 10.5117 14.5547 9.45703 14.5547 7.34766V2.90039C14.5547 0.974609 15.3984 0.0117188 17.0859 0.0117188C17.7812 0.0117188 18.3145 0.152344 18.6855 0.433594C19.0566 0.710938 19.3125 1.11719 19.4531 1.65234C19.5938 2.1875 19.6641 2.83984 19.6641 3.60938H17.6484V2.69531C17.6484 2.47266 17.6172 2.28711 17.5547 2.13867C17.4961 1.98633 17.3711 1.91016 17.1797 1.91016C16.9414 1.91016 16.7832 1.99023 16.7051 2.15039C16.6309 2.31055 16.5938 2.48633 16.5938 2.67773V7.67578C16.5938 7.95312 16.6289 8.17969 16.6992 8.35547C16.7734 8.52734 16.916 8.61328 17.127 8.61328C17.3457 8.61328 17.4902 8.52734 17.5605 8.35547C17.6348 8.17969 17.6719 7.94922 17.6719 7.66406V6.19336H17.1211V4.41211H19.6406V10.418H18.8145L18.4629 9.55078C18.1035 10.1914 17.5371 10.5117 16.7637 10.5117Z" fill="white" />
          <path d="M22.9102 10.5117C21.9688 10.5117 21.2891 10.2773 20.8711 9.80859C20.457 9.33984 20.25 8.59375 20.25 7.57031V6.5625H22.2891V7.85156C22.2891 8.08984 22.3242 8.27734 22.3945 8.41406C22.4688 8.54688 22.5957 8.61328 22.7754 8.61328C22.9629 8.61328 23.0918 8.55859 23.1621 8.44922C23.2363 8.33984 23.2734 8.16016 23.2734 7.91016C23.2734 7.59375 23.2422 7.33008 23.1797 7.11914C23.1172 6.9043 23.0078 6.70117 22.8516 6.50977C22.6992 6.31445 22.4863 6.08789 22.2129 5.83008L21.2871 4.95117C20.5957 4.29883 20.25 3.55273 20.25 2.71289C20.25 1.83398 20.4531 1.16406 20.8594 0.703125C21.2695 0.242188 21.8613 0.0117188 22.6348 0.0117188C23.5801 0.0117188 24.25 0.263672 24.6445 0.767578C25.043 1.27148 25.2422 2.03711 25.2422 3.06445H23.1445V2.35547C23.1445 2.21484 23.1035 2.10547 23.0215 2.02734C22.9434 1.94922 22.8359 1.91016 22.6992 1.91016C22.5352 1.91016 22.4141 1.95703 22.3359 2.05078C22.2617 2.14062 22.2246 2.25781 22.2246 2.40234C22.2246 2.54688 22.2637 2.70312 22.3418 2.87109C22.4199 3.03906 22.5742 3.23242 22.8047 3.45117L23.9941 4.59375C24.2324 4.82031 24.4512 5.06055 24.6504 5.31445C24.8496 5.56445 25.0098 5.85742 25.1309 6.19336C25.252 6.52539 25.3125 6.93164 25.3125 7.41211C25.3125 8.38086 25.1328 9.14062 24.7734 9.69141C24.418 10.2383 23.7969 10.5117 22.9102 10.5117Z" fill="white" />
          <path d="M27.252 10.418V7.02539L25.6055 0.105469H27.6504L28.2246 3.59766L28.7988 0.105469H30.8379L29.1973 7.02539V10.418H27.252Z" fill="white" />
          <path d="M31.5527 3.12891L31.9395 1.74609H31.1953V0H33.3867V1.69336L32.7891 3.12891H31.5527Z" fill="white" />
          <path d="M36.5977 10.5117C35.6562 10.5117 34.9766 10.2773 34.5586 9.80859C34.1445 9.33984 33.9375 8.59375 33.9375 7.57031V6.5625H35.9766V7.85156C35.9766 8.08984 36.0117 8.27734 36.082 8.41406C36.1562 8.54688 36.2832 8.61328 36.4629 8.61328C36.6504 8.61328 36.7793 8.55859 36.8496 8.44922C36.9238 8.33984 36.9609 8.16016 36.9609 7.91016C36.9609 7.59375 36.9297 7.33008 36.8672 7.11914C36.8047 6.9043 36.6953 6.70117 36.5391 6.50977C36.3867 6.31445 36.1738 6.08789 35.9004 5.83008L34.9746 4.95117C34.2832 4.29883 33.9375 3.55273 33.9375 2.71289C33.9375 1.83398 34.1406 1.16406 34.5469 0.703125C34.957 0.242188 35.5488 0.0117188 36.3223 0.0117188C37.2676 0.0117188 37.9375 0.263672 38.332 0.767578C38.7305 1.27148 38.9297 2.03711 38.9297 3.06445H36.832V2.35547C36.832 2.21484 36.791 2.10547 36.709 2.02734C36.6309 1.94922 36.5234 1.91016 36.3867 1.91016C36.2227 1.91016 36.1016 1.95703 36.0234 2.05078C35.9492 2.14062 35.9121 2.25781 35.9121 2.40234C35.9121 2.54688 35.9512 2.70312 36.0293 2.87109C36.1074 3.03906 36.2617 3.23242 36.4922 3.45117L37.6816 4.59375C37.9199 4.82031 38.1387 5.06055 38.3379 5.31445C38.5371 5.56445 38.6973 5.85742 38.8184 6.19336C38.9395 6.52539 39 6.93164 39 7.41211C39 8.38086 38.8203 9.14062 38.4609 9.69141C38.1055 10.2383 37.4844 10.5117 36.5977 10.5117Z" fill="white" />
        </svg>

        {/* Banner interior bottom-card line element */}
        <div className="mt-8 sm:mt-12 pt-7 bg-[#4565bc] rounded-[2rem] relative z-20">
          
          <div className="flex flex-col sm:flex-row sm:items-stretch justify-between relative z-10 px-4 sm:px-8 pb-6 gap-6">
            <div className="flex flex-col justify-between">
              <h2 className="text-[#F1BF0A] font-anton text-4xl sm:text-5xl uppercase tracking-wider font-normal leading-none">PREMIUM</h2>
              <p className="mt-2 text-sm sm:max-w-xs text-slate-100 font-medium leading-relaxed">
                Engineered for everyday adventures. Durable, lightweight, and built to move with you wherever the journey leads.
              </p>
            </div>

            {/* Satisfaction micro badge indicators */}
            <div className="bg-[#abb9de]/90 backdrop-blur text-[#090909] rounded-2xl p-4 sm:max-w-[190px] shadow-lg flex flex-row sm:flex-col justify-between items-center sm:items-start gap-4">
              <div className="flex items-center gap-4 sm:gap-0 sm:flex-col sm:items-start">
                <span className="text-4xl font-anton tracking-tight text-neutral-900 font-normal">98%</span>
                <div className="flex -space-x-2.5 my-2.5">
                  <img src="https://i.postimg.cc/y8g3KSxd/avatar-1.jpg" alt="User Reviewer 1" className="inline-block size-9 rounded-full border-2 border-white object-cover" />
                  <img src="https://i.postimg.cc/BnrLnQPp/avatar-2.jpg" alt="User Reviewer 2" className="inline-block size-9 rounded-full border-2 border-white object-cover" />
                  <img src="https://i.postimg.cc/W1BF1bqQ/avatar-3.jpg" alt="User Reviewer 3" className="inline-block size-9 rounded-full border-2 border-white object-cover" />
                </div>
              </div>
              <p className="text-[11px] leading-tight font-black text-neutral-800 uppercase tracking-wide">
                Customer satisfaction rating across all orders
              </p>
            </div>
          </div>

          <div className="flex items-stretch justify-between relative z-5">
            {/* Embedded custom expanding shop button */}
            <div className="sm:bg-[#183fad] pb-3 pl-3 sm:p-6 rounded-tr-3xl rounded-bl-3xl relative">
              <a
                href="#collection"
                className="flex items-center gap-2 bg-[#F1BF0A] rounded-full py-2.5 pl-2.5 pr-6 text-[#090909] whitespace-nowrap relative group overflow-hidden cursor-pointer shadow-lg font-black text-[13px] uppercase tracking-widest"
              >
                <div className="absolute inset-0 bg-white translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-out z-0" />
                <div className="rounded-full p-2 bg-[#090909] text-white relative z-10 scale-90 group-hover:bg-[#F1BF0A] group-hover:text-black transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="size-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                  </svg>
                </div>
                <span className="relative z-10 group-hover:translate-x-1.5 transition-transform duration-300">Shop Now</span>
              </a>
            </div>

            <div className="hidden sm:block bg-[#4565bc] flex-1 rounded-b-3xl relative z-10"></div>

            {/* Pagination custom controller slide triggers */}
            <div className="hidden sm:flex items-center gap-3 bg-[#183fad] p-6 rounded-tl-[2rem] rounded-br-3xl relative">
              <button
                type="button"
                onClick={() => addNotification('👈 Deslocamento para esquerda simulado.')}
                className="flex items-center bg-[#F1BF0A] hover:bg-white rounded-full p-2.5 text-[#090909] transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-md"
              >
                <ArrowLeft className="h-5 w-5 stroke-[2.5]" />
              </button>
              <button
                type="button"
                onClick={() => addNotification('👉 Deslocamento para direita simulado.')}
                className="flex items-center bg-[#F1BF0A] hover:bg-white rounded-full p-2.5 text-[#090909] transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-md"
              >
                <ArrowRight className="h-5 w-5 stroke-[2.5]" />
              </button>
            </div>
          </div>

        </div>

        {/* Beautiful Floating Absolute big presentation product mug */}
        <img
          src="https://i.postimg.cc/YqVLr48H/mug.png"
          alt="Original Big Mugsy's Premium Mug"
          className="hidden md:block object-contain h-[42vw] max-h-[460px] absolute bottom-1.5 left-[54%] -translate-x-1/2 z-30 select-none pointer-events-none drop-shadow-[15px_15px_30px_rgba(0,0,0,0.65)] hover:scale-105 transition-all duration-700"
          draggable="false"
        />

      </header>


      {/* --- MAIN PRODUCT GRID SECTION --- */}
      <main id="collection" className="max-w-5xl mx-auto mt-20 overflow-hidden px-2 sm:px-6 md:px-0">
        
        <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-14">
          <div className="flex-1">
            <span className="text-amber-500 font-extrabold text-[10px] tracking-[4px] uppercase block mb-1">CRAFTED FOR WANDERLUST</span>
            <h1 className="font-anton text-4xl sm:text-5xl lg:text-6xl text-[#090909] tracking-wider leading-none uppercase font-normal">
              EXPLORE THE <br className="hidden md:inline" />COLLECTION
            </h1>
          </div>
          <div className="flex-1 space-y-4">
            <p className="text-neutral-600 text-sm md:text-base leading-relaxed">
              Limited edition mugs designed for everyday carry and modern travel. Made with high-tensile dual-hardened premium clay or vacuum titanium. Only 2,000 units worldwide.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${filter === cat ? 'bg-[#183fad] text-white' : 'bg-white hover:bg-neutral-100 text-[#090909] border border-neutral-100 shadow-sm'}`}
                >
                  {cat === 'Todos' ? 'Todos' : cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Interactive Products Grid list */}
        <ul role="list" className="grid grid-cols-1 gap-8 min-[480px]:grid-cols-2 md:grid-cols-3 mt-12">
          {filteredProducts.map((product) => {
            const isFav = !!favorited[product.id];
            return (
              <li
                key={product.id}
                className="col-span-1 flex flex-col rounded-[2rem] overflow-hidden bg-white border border-neutral-100/80 shadow-[0_4px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_15px_45px_rgba(24,63,173,0.08)] transition-all duration-500 hover:scale-[1.01] group relative"
              >
                
                {/* Header Pricing controls tab */}
                <div className="relative">
                  <div className="flex items-center justify-between">
                    
                    {/* Price displays */}
                    <div className="pl-4 pr-6 py-3.5 bg-[#e9ecf6] flex gap-2 items-center rounded-tr-2xl relative after:content-[''] after:absolute after:top-0 after:right-0 after:h-full after:w-4 after:bg-white after:origin-top-right after:skew-x-[15deg] after:z-10">
                      <span className="line-through text-neutral-400 text-xs font-medium">${product.originalPrice}</span>
                      <span className="font-extrabold text-sm text-[#090909]">${product.price}</span>
                    </div>

                    {/* Interactive shopping actions line with custom backfill sliders */}
                    <div className="flex items-center gap-1.5 bg-white pl-3 pr-2 pt-2 pb-2 rounded-bl-3xl relative z-20">
                      
                      {/* Buy Action Trigger */}
                      <button
                        type="button"
                        onClick={() => handleAddToCart(product.id, product.name)}
                        className="flex items-center bg-[#F1BF0A] border border-[#F1BF0A] rounded-full p-2.5 text-[#090909] relative group/btn overflow-hidden cursor-pointer shadow transition-all duration-300 hover:shadow-lg"
                        title="Adicionar à sacola"
                      >
                        <div className="absolute inset-0 bg-white translate-y-[-100%] group-hover/btn:translate-y-0 transition-transform duration-300 ease-out z-0" />
                        <span className="relative z-10 shrink-0">
                          <ShoppingBag className="size-4.5 stroke-[2.25] text-neutral-900" />
                        </span>
                      </button>

                      {/* Favorite/Wishlist Toggle Trigger */}
                      <button
                        type="button"
                        onClick={() => handleToggleFavorite(product.id, product.name)}
                        className={`flex items-center bg-[#F1BF0A] border border-[#F1BF0A] rounded-full p-2.5 text-[#090909] relative group/btn overflow-hidden cursor-pointer shadow transition-all duration-300 hover:shadow-lg ${isFav ? 'bg-[#ffebeb] border-[#ffa1a1]' : ''}`}
                        title="Adicionar aos favoritos"
                      >
                        <div className="absolute inset-0 bg-white translate-y-[-100%] group-hover/btn:translate-y-0 transition-transform duration-300 ease-out z-0" />
                        <span className="relative z-10 shrink-0">
                          <Heart className={`size-4.5 stroke-[2.25] text-neutral-900 ${isFav ? 'fill-red-500 text-red-500 stroke-red-500' : ''}`} />
                        </span>
                      </button>

                    </div>

                  </div>

                  <h3 className="pl-4 py-3 text-xs uppercase font-extrabold tracking-widest text-[#090909] hover:text-[#183fad] transition-colors cursor-pointer" onClick={() => setSelectedProduct(product)}>
                    {product.name}
                  </h3>
                </div>

                {/* Main Graphic Content Frame with responsive Zoom scale */}
                <div
                  onClick={() => setSelectedProduct(product)}
                  className="flex flex-1 flex-col px-3.5 pb-3.5 bg-[#e9ecf6] rounded-[1.75rem] mx-2 mb-2 overflow-hidden relative cursor-pointer"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="select-none pointer-events-none w-full shrink-0 rounded-2xl object-cover aspect-square transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#183fad]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                    <span className="bg-white text-[#090909] text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg">
                      Ver Detalhes Rápido
                    </span>
                  </div>
                </div>

              </li>
            );
          })}
        </ul>

        {/* --- BRAND STORY "ABOUT" COMPACT CONTAINER --- */}
        <section id="about" className="mt-28 bg-[#183fad]/5 rounded-[2.5rem] p-8 md:p-14 border border-[#183fad]/10 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 space-y-4">
            <span className="text-[#183fad] font-black text-xs uppercase tracking-widest">Nossa Jornada</span>
            <h2 className="font-anton text-3xl sm:text-4xl text-[#090909] uppercase tracking-wider font-normal">A ARTE DE BEBER DEVAGAR</h2>
            <p className="text-neutral-600 text-sm leading-relaxed">
              Mugsy's Mugs nasceu do desejo de transformar canecas simples em companheiras de exploração indestrutíveis. Cada peça é purificada em fornos de alta indução a 1300°C por mais de 18 horas, criando pontes térmicas isolantes de alto nível.
            </p>
            <p className="text-neutral-600 text-sm leading-relaxed">
              Nossa equipe artística assina e numera individualmente as edições limitadas, provando que utensílios cotidianos podem carregar alma, design disruptivo e propósito.
            </p>
            <div className="pt-2">
              <button
                onClick={() => addNotification('ℹ️ Nossa história e lojas físicas estarão descritas no site oficial em breve!')}
                className="inline-flex items-center gap-2 border-2 border-[#183fad] hover:bg-[#183fad] hover:text-white text-[#183fad] rounded-full px-5 py-2.5 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Conheça Nossos Estúdios
              </button>
            </div>
          </div>
          <div className="flex-1 w-full relative">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-[#F1BF0A] to-[#183fad] rounded-[2rem] blur opacity-25" />
            <img
              src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800"
              alt="Mugs handcrafted studio process"
              className="relative rounded-[2rem] w-full min-h-[250px] object-cover aspect-video shadow-lg"
            />
          </div>
        </section>

      </main>


      {/* --- PREMIUM PORTFOLIO BOTTOM FOOTER SYSTEM --- */}
      <footer className="max-w-5xl mx-auto bg-[#183fad] text-white px-6 sm:px-10 pb-6 mt-28 pt-8 sm:pt-14 rounded-[2.5rem] relative z-0 overflow-hidden shadow-2xl">
        
        <nav className="-mb-6 flex flex-wrap justify-center gap-x-8 gap-y-3 text-xs font-bold uppercase tracking-widest text-[#abb9de]">
          <a href="#hero" className="hover:text-[#F1BF0A] transition-colors">Home</a>
          <a href="#about" className="hover:text-[#F1BF0A] transition-colors">About</a>
          <a href="#collection" className="hover:text-[#F1BF0A] transition-colors">Company</a>
          <a href="#about" className="hover:text-[#F1BF0A] transition-colors">Stores</a>
        </nav>

        <div className="mt-14 border-t border-white/20 pt-6 md:flex md:items-center md:justify-between">
          
          {/* Social icons stack with brand accent hover targets */}
          <div className="flex gap-x-6 justify-center md:justify-start md:order-2">
            
            <a href="#" className="text-white hover:text-[#F1BF0A] hover:scale-110 transition-all">
              <span className="sr-only">Facebook</span>
              <Facebook className="size-5" />
            </a>

            <a href="#" className="text-white hover:text-[#F1BF0A] hover:scale-110 transition-all">
              <span className="sr-only">Instagram</span>
              <Instagram className="size-5" />
            </a>

            <a href="#" className="text-white hover:text-[#F1BF0A] hover:scale-110 transition-all">
              <span className="sr-only">Twitter</span>
              <Twitter className="size-5" />
            </a>

            <a href="#" className="text-white hover:text-[#F1BF0A] hover:scale-110 transition-all">
              <span className="sr-only">YouTube</span>
              <Youtube className="size-5" />
            </a>

          </div>

          <p className="mt-6 md:mt-0 text-xs font-bold uppercase tracking-wider text-[#abb9de]/60 text-center md:text-left md:order-1">
            © 2026 Mugsy's Mugs, Inc. All rights reserved. Designed visually under premium asset guidelines.
          </p>

        </div>

      </footer>

    </div>
  );
}
