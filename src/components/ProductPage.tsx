import { useState, useEffect, ChangeEvent, TouchEvent } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  ShoppingCart,
  Star,
  Truck,
  ShieldCheck,
  Lock,
  ThumbsUp,
  Sparkles,
  MessageSquare,
  RefreshCw,
  Mail,
  Search,
  Menu,
  CheckCircle,
  ShieldAlert,
  MapPin,
  Zap,
  X,
} from 'lucide-react';
import { KITS_DATA, TESTIMONIALS_DATA } from '../data/storeData';
import { KitOption } from '../types';
import { CartDrawer } from './CartDrawer';

interface ProductPageProps {
  selectedKit: KitOption;
  onSelectKit: (kit: KitOption) => void;
  onOpenImage: (src: string) => void;
}

export function ProductPage({
  selectedKit,
  onSelectKit,
  onOpenImage,
}: ProductPageProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [navMenuOpen, setNavMenuOpen] = useState(false);
  const [cepInput, setCepInput] = useState('');
  const [cepLoading, setCepLoading] = useState(false);
  const [shippingResult, setShippingResult] = useState<{
    street: string;
    neighborhood: string;
    city: string;
    state: string;
    cep: string;
  } | null>(null);
  const [shippingError, setShippingError] = useState('');

  // Preload all store and review images in the browser cache for instant loading
  useEffect(() => {
    const imagesToPreload = [
      '/images/prod_1.jpg',
      '/images/prod_2.jpg',
      '/images/prod_3.jpg',
      '/images/prod_4.jpg',
      '/images/prod_5.jpg',
      '/images/prod_6.jpg',
      '/images/kit_2_frascos.jpg',
      '/images/kit_3_frascos.jpg',
      '/images/blunn_img_4.jpg',
      '/images/blunn_img_5.jpg',
      '/images/blunn_img_6.jpg',
      '/images/kit3_img_2.jpg',
      '/images/kit3_img_3.jpg',
      '/images/kit3_img_7.jpg',
      '/images/review_1_1.jpg',
      '/images/review_1_2.jpg',
      '/images/review_2_1.jpg',
      '/images/review_2_2.jpg',
      '/images/review_2_3.jpg',
      '/images/review_3_1.jpg',
      '/images/review_3_2.jpg',
      '/images/review_3_trio.jpg',
      '/images/review_4_1.jpg',
      '/images/review_5_1.jpg',
      '/images/review_5_2.jpg',
    ];

    imagesToPreload.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Track ViewContent for Meta Pixel on product load and kit change
  useEffect(() => {
    try {
      if (typeof (window as any).fbq === 'function') {
        (window as any).fbq('track', 'ViewContent', {
          content_name: selectedKit.name,
          content_category: 'Fragrâncias',
          value: selectedKit.totalPrice,
          currency: 'BRL',
          content_type: 'product',
        });
      }
    } catch {
      // ignore
    }
  }, [selectedKit]);

  const currentImages = selectedKit.images;
  const currentImage = currentImages[activeImageIndex] || currentImages[0];

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? currentImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev === currentImages.length - 1 ? 0 : prev + 1));
  };

  // Touch Swipe on mobile for image gallery
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const minSwipeDistance = 40;

  const handleTouchStart = (e: TouchEvent) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    if (distance > minSwipeDistance) {
      handleNextImage(); // Swiped left -> next
    } else if (distance < -minSwipeDistance) {
      handlePrevImage(); // Swiped right -> previous
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  // Reviews Load More State
  const [visibleReviewsCount, setVisibleReviewsCount] = useState(8);
  const [loadingMoreReviews, setLoadingMoreReviews] = useState(false);

  const handleLoadMoreReviews = () => {
    setLoadingMoreReviews(true);
    setTimeout(() => {
      setVisibleReviewsCount((prev) => Math.min(prev + 6, TESTIMONIALS_DATA.length));
      setLoadingMoreReviews(false);
    }, 400);
  };

  const handleKitChange = (kit: KitOption) => {
    onSelectKit(kit);
    setActiveImageIndex(0);
  };

  const handleBuyNow = () => {
    const baseUrl =
      selectedKit.qty === 3
        ? 'https://pay.primestoreshop.site/6ad6b0725289cdedb71733b0'
        : selectedKit.qty === 2
        ? 'https://pay.primestoreshop.site/6ad29103a7f9ead6f63a35d2'
        : 'https://pay.primestoreshop.site/6ad290d0a7f9ead6f63a35a8';

    const searchParams = window.location.search || '';
    let finalCheckoutUrl = baseUrl;
    if (searchParams) {
      const cleanParams = searchParams.startsWith('?')
        ? searchParams.substring(1)
        : searchParams;
      finalCheckoutUrl += (baseUrl.includes('?') ? '&' : '?') + cleanParams;
    }

    try {
      if (typeof (window as any).fbq === 'function') {
        (window as any).fbq('track', 'InitiateCheckout', {
          content_name: selectedKit.name,
          content_category: 'Fragrâncias',
          value: selectedKit.totalPrice,
          currency: 'BRL',
          num_items: selectedKit.qty,
        });
      }
    } catch {
      // ignore
    }

    window.location.href = finalCheckoutUrl;
  };

  const handleCepChange = (e: ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 8) val = val.slice(0, 8);
    if (val.length > 5) {
      val = `${val.slice(0, 5)}-${val.slice(5)}`;
    }
    setCepInput(val);
    if (shippingResult || shippingError) {
      setShippingResult(null);
      setShippingError('');
    }
  };

  const handleCalculateShipping = async () => {
    const raw = cepInput.replace(/\D/g, '');
    if (raw.length !== 8) {
      setShippingError('Digite um CEP válido com 8 dígitos');
      return;
    }
    setCepLoading(true);
    setShippingError('');
    try {
      const res = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
      const data = await res.json();
      if (data.erro) {
        setShippingError('CEP não encontrado. Verifique o número digitado.');
        setShippingResult(null);
      } else {
        setShippingResult({
          street: data.logradouro || '',
          neighborhood: data.bairro || '',
          city: data.localidade || 'Sua Cidade',
          state: data.uf || 'BR',
          cep: data.cep || cepInput,
        });
      }
    } catch {
      // Fallback
      setShippingResult({
        street: 'Região de Entrega',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        cep: cepInput,
      });
    } finally {
      setCepLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-white text-gray-900 font-sans selection:bg-[#16A34A] selection:text-white">
      {/* Top Header - Exact design from reference in black, WITHOUT number badge on shopping bag */}
      <header className="bg-black text-white border-b border-black sticky top-0 z-40 shadow-md">
        <div className="relative max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Left: Hamburger Menu & Search */}
          <div className="flex items-center gap-4 z-10">
            <button
              type="button"
              aria-label="Menu"
              onClick={() => setNavMenuOpen(true)}
              className="p-1.5 text-white/90 hover:text-white transition-colors cursor-pointer"
            >
              <Menu className="w-6 h-6" />
            </button>
            <button
              type="button"
              aria-label="Pesquisar"
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-1.5 text-white/90 hover:text-white transition-colors cursor-pointer"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Center: Stylized PRIME STORE Logo - EXACTLY CENTERED */}
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center select-none cursor-pointer group pointer-events-auto"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="w-5 sm:w-10 h-[1.5px] bg-white group-hover:bg-[#16A34A] transition-colors" />
              <span className="text-white font-black tracking-[0.22em] text-base sm:text-xl uppercase leading-none">
                PRIME
              </span>
              <span className="w-5 sm:w-10 h-[1.5px] bg-white group-hover:bg-[#16A34A] transition-colors" />
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 -mt-0.5 sm:-mt-1">
              <span className="w-3.5 sm:w-7 h-[1px] bg-white/70" />
              <span className="text-white/85 font-bold tracking-[0.32em] text-[8px] sm:text-[10px] uppercase">
                STORE
              </span>
              <span className="w-3.5 sm:w-7 h-[1px] bg-white/70" />
            </div>
          </div>

          {/* Right: Shopping Bag Icon matching reference - NO NUMBER 1 BADGE */}
          <div className="flex items-center gap-2 z-10">
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label="Sacola de Compras"
              className="p-1.5 text-white/90 hover:text-white transition-colors cursor-pointer"
              title="Abrir Carrinho"
            >
              <ShoppingBag className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Expandable Search Input */}
        {searchOpen && (
          <div className="max-w-7xl mx-auto px-4 pb-4 animate-in fade-in duration-150">
            <div className="relative">
              <input
                placeholder="Pesquisar fragrâncias..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-full py-2.5 px-6 pl-12 text-base text-white focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A] transition-all placeholder:text-zinc-400 outline-none"
                type="text"
                autoFocus
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-[18px] h-[18px]" />
            </div>
          </div>
        )}
      </header>

      {/* Main Content with clean white background & #16A34A / #17372D accents */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Product Gallery & Progress */}
          <div className="lg:col-span-7 space-y-4">
            <div
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="relative aspect-[4/5] max-w-[390px] mx-auto bg-white overflow-hidden group rounded-2xl border border-gray-200 shadow-sm touch-pan-y"
            >
              <img
                alt="Body Splash Masculino Vibration 200ml by Primacial"
                className="w-full h-full object-cover cursor-pointer select-none transition-opacity duration-200"
                referrerPolicy="no-referrer"
                loading="eager"
                decoding="async"
                fetchPriority="high"
                draggable="false"
                src={currentImage}
                onClick={() => onOpenImage(currentImage)}
              />
              <button
                type="button"
                onClick={handlePrevImage}
                aria-label="Imagem Anterior"
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 backdrop-blur-xs text-black rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hidden md:block cursor-pointer hover:bg-white border border-gray-200"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={handleNextImage}
                aria-label="Próxima Imagem"
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 backdrop-blur-xs text-black rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hidden md:block cursor-pointer hover:bg-white border border-gray-200"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              <div className="absolute top-3 left-3 bg-[#17372D] text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider shadow-sm">
                Original Primacial
              </div>
            </div>

            {/* Thumbnail Row - Sized to display all thumbnails without horizontal cutoff */}
            <div className="flex justify-center items-center gap-1.5 sm:gap-2 py-2 max-w-[390px] mx-auto w-full px-1">
              {currentImages.map((img, idx) => {
                const isActive = idx === activeImageIndex;
                return (
                  <button
                    key={`${img}-${idx}`}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`flex-shrink-0 w-11 sm:w-13 aspect-[4/5] border-2 transition-all rounded-lg sm:rounded-xl overflow-hidden cursor-pointer ${
                      isActive
                        ? 'border-[#16A34A] shadow-md ring-2 ring-[#16A34A]/25 scale-105'
                        : 'border-gray-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      alt={`Miniatura ${idx + 1}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      loading="eager"
                      decoding="async"
                      src={img}
                    />
                  </button>
                );
              })}
            </div>

            {/* Scarcity Bar with #16A34A / #17372D green styling with moving candy stripes */}
            <div className="max-w-[390px] mx-auto w-full mt-6 bg-gray-50 p-4 rounded-2xl border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-[#16A34A] rounded-full animate-pulse" />
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#16A34A]">
                    93% VENDIDO
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  ÚLTIMAS UNIDADES EM ESTOQUE
                </span>
              </div>
              <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden border border-gray-300">
                <div
                  className="h-full bg-gradient-to-r from-[#17372D] via-[#16A34A] to-[#22c55e] rounded-full relative overflow-hidden"
                  style={{ width: '93%' }}
                >
                  <div className="absolute inset-0 animate-stripes" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Details & Purchase */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="mb-6">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('avaliacoes');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="flex items-center gap-2 mb-2 cursor-pointer group text-left hover:opacity-85 transition-opacity"
                title="Ver todas as 782 avaliações"
              >
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="text-xs text-gray-500 group-hover:text-gray-900 group-hover:underline font-extrabold uppercase tracking-tight transition-colors">
                  782 AVALIAÇÕES
                </span>
                <span className="text-xs text-gray-300">|</span>
                <span className="text-xs text-gray-800 font-extrabold uppercase tracking-tight">
                  +18.8K VENDIDOS
                </span>
              </button>

              <h1 className="text-2xl sm:text-3xl font-black uppercase mb-1.5 leading-tight text-gray-900 tracking-tight">
                {selectedKit.qty === 3
                  ? 'KIT 3 BODY SPLASH MASCULINO VIBRATION, BLUNN E INFALÍVEL FERO 3X200ML'
                  : selectedKit.qty === 2
                  ? 'KIT 2 BODY SPLASH MASCULINO VIBRATION E BLUNN 2X200ML'
                  : 'BODY SPLASH MASCULINO VIBRATION 200ML BY PRIMACIAL'}
              </h1>
              <p className="text-[11px] sm:text-xs text-gray-400 font-bold uppercase tracking-[0.2em] mb-4">
                FRAGRÂNCIA EXCLUSIVA • EDIÇÃO LIMITADA
              </p>

              {/* Price and Economy Banner matching screenshot layout */}
              <div className="mb-5">
                <div className="flex items-baseline gap-2.5 sm:gap-3 flex-wrap">
                  <span className="text-gray-400 line-through text-lg sm:text-2xl font-bold">
                    R$ {selectedKit.originalPrice.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#16A34A] tracking-tight">
                    R$ {selectedKit.totalPrice.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                <div className="mt-1.5 flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#16A34A]">
                  <ThumbsUp className="w-4 h-4 flex-shrink-0" />
                  <span>{selectedKit.discountText}</span>
                </div>
              </div>
            </div>

            {/* Dica with Sparkles Pill */}
            <div className="my-6 flex justify-center">
              <span className="bg-[#17372D]/5 text-[#17372D] border border-[#17372D]/20 px-3.5 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#17372D]" />
                DICA: ESCOLHA UM KIT E EXPERIMENTE TODAS AS FRAGRÂNCIAS
              </span>
            </div>

            {/* Kit Selection Cards - 3 Columns */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3.5 mb-6">
              {KITS_DATA.map((kit) => {
                const isSelected = selectedKit.qty === kit.qty;

                const boxImage =
                  kit.qty === 3
                    ? '/images/kit_3_frascos.jpg'
                    : kit.qty === 2
                    ? '/images/kit_2_frascos.jpg'
                    : kit.images[0];

                return (
                  <button
                    key={kit.qty}
                    type="button"
                    onClick={() => handleKitChange(kit)}
                    className={`relative flex flex-col items-center text-center pt-5 sm:pt-6 pb-4 sm:pb-5 px-1.5 sm:px-2.5 rounded-2xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#17372D] bg-[#17372D]/[0.03] shadow-md ring-1 ring-[#17372D]/20'
                        : 'border-gray-200 bg-white hover:border-gray-300 shadow-xs'
                    }`}
                  >
                    {/* Badge on top center */}
                    {kit.badge && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#17372D] text-white text-[7.5px] sm:text-[9px] font-black px-2 sm:px-2.5 py-0.5 rounded-full whitespace-nowrap uppercase tracking-wider shadow-sm">
                        {kit.badge}
                      </span>
                    )}

                    {/* Image Container */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mb-2 sm:mb-2.5 overflow-hidden rounded-xl bg-gray-50/80 border border-gray-100 flex items-center justify-center p-1 sm:p-1.5 shadow-xs transition-transform group-hover:scale-105">
                      <img
                        alt={kit.label}
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                        decoding="async"
                        src={boxImage}
                      />
                    </div>

                    {/* Quantity */}
                    <span className="text-[10px] sm:text-xs font-extrabold text-gray-700 uppercase tracking-wide">
                      {kit.label}
                    </span>

                    {/* Price */}
                    <div className="flex flex-col items-center justify-center mt-0.5">
                      <span className="text-sm sm:text-base lg:text-lg font-black text-[#16A34A] leading-tight">
                        R$ {kit.unitPrice.toFixed(2).replace('.', ',')}
                      </span>
                      {kit.qty > 1 && (
                        <span className="text-[8px] sm:text-[9px] font-black text-gray-800 uppercase tracking-widest mt-0.5">
                          CADA
                        </span>
                      )}
                    </div>

                    {/* Fragrance name in brand color */}
                    <span className="text-[7px] sm:text-[8.5px] font-extrabold text-[#17372D] uppercase tracking-wider mt-1.5 leading-tight text-center">
                      {kit.qty === 3
                        ? 'VIBRATION + BLUNN + INFALÍVEL FERO'
                        : kit.qty === 2
                        ? 'VIBRATION + BLUNN'
                        : 'VIBRATION'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Buy CTA Button in requested color #16A34A directly sending to specified checkout links */}
            <div className="flex flex-col gap-3 mb-8">
              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full bg-[#16A34A] hover:bg-[#15803d] text-white py-4 sm:py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-[#16A34A]/25 flex items-center justify-center gap-3 text-lg cursor-pointer transition-all active:scale-[0.99] group"
              >
                <ShoppingCart className="w-6 h-6 stroke-[2.5] transition-transform group-hover:scale-110" />
                <span>COMPRAR AGORA</span>
              </button>
            </div>

            {/* Total Volume & Fragrances */}
            <div className="mb-6 bg-gray-50 rounded-2xl p-6 border border-gray-200 flex flex-col items-center">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400 mb-3">
                Volume Total
              </span>
              <div className="bg-white px-6 py-2 rounded-xl border border-gray-200 mb-5 shadow-xs">
                <span className="text-sm font-bold text-gray-900">
                  {selectedKit.volume}
                </span>
              </div>
              <div className="w-full h-px bg-gray-200 mb-5" />
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400 mb-3">
                Fragrâncias Inclusas
              </span>
              <div className="flex flex-wrap justify-center gap-2">
                {selectedKit.fragrances.map((frag) => (
                  <span
                    key={frag}
                    className="bg-[#17372D] text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-xs"
                  >
                    {frag}
                  </span>
                ))}
              </div>
            </div>

            {/* Security Guarantee label */}
            <div className="flex items-center justify-center gap-2 text-gray-500 mb-6">
              <Lock className="w-3.5 h-3.5 text-[#16A34A]" />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                Pagamento 100% Seguro e Criptografado
              </span>
            </div>

            {/* Calculate Shipping - Address Display + Specified Shipping Options */}
            <div className="mb-8 border border-gray-200 rounded-2xl p-5 bg-white shadow-xs">
              <div className="flex items-center gap-2 mb-3 text-gray-900">
                <Truck className="text-[#16A34A] w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-widest">
                  Calcular Frete e Prazo
                </span>
              </div>
              <div className="flex gap-2 mb-2">
                <input
                  maxLength={9}
                  placeholder="00000-000"
                  value={cepInput}
                  onChange={handleCepChange}
                  className="flex-grow bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-2.5 text-base focus:outline-none focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A] placeholder:text-gray-400 transition-colors"
                  type="text"
                />
                <button
                  type="button"
                  onClick={handleCalculateShipping}
                  disabled={cepInput.replace(/\D/g, '').length !== 8 || cepLoading}
                  className="bg-[#17372D] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase hover:bg-[#1f4a3d] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {cepLoading ? 'Buscando...' : 'Calcular'}
                </button>
              </div>

              {shippingError && (
                <p className="text-xs text-rose-500 mt-1">{shippingError}</p>
              )}

              {shippingResult && (
                <div className="mt-4 p-4 bg-[#16A34A]/5 border border-[#16A34A]/25 rounded-xl text-xs space-y-3 animate-in fade-in duration-200">
                  {/* Address Display */}
                  <div className="flex items-start gap-2.5 pb-2.5 border-b border-gray-200">
                    <MapPin className="w-4 h-4 text-[#16A34A] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                        Endereço de Entrega Identificado
                      </p>
                      <p className="font-bold text-gray-900 text-sm">
                        {shippingResult.street ? `${shippingResult.street}, ` : ''}
                        {shippingResult.neighborhood ? `${shippingResult.neighborhood} • ` : ''}
                        {shippingResult.city} - {shippingResult.state}
                      </p>
                      <p className="text-[11px] text-gray-500">CEP {shippingResult.cep}</p>
                    </div>
                  </div>

                  {/* Shipping Options: display only (só ver, não escolher) */}
                  <div className="space-y-2.5 pt-2">
                    {/* Frete Padrão Card */}
                    <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border border-gray-200 bg-white shadow-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 flex-shrink-0">
                          <Truck className="w-5 h-5 text-[#17372D]" />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-gray-900 text-sm sm:text-base leading-tight">
                            Frete Padrão
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            7 a 10 dias (dias úteis)
                          </p>
                        </div>
                      </div>
                      <span className="font-extrabold text-gray-900 text-base sm:text-lg whitespace-nowrap">
                        R$ 6,27
                      </span>
                    </div>

                    {/* Frete Full Card */}
                    <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border border-gray-200 bg-white shadow-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#16A34A]/10 flex items-center justify-center text-[#16A34A] flex-shrink-0">
                          <Zap className="w-5 h-5 text-[#16A34A]" />
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-gray-900 text-sm sm:text-base leading-tight">
                              Frete Full
                            </p>
                            <span className="bg-[#16A34A] text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase tracking-wider">
                              Mais Rápido
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            2 a 3 dias (dias úteis)
                          </p>
                        </div>
                      </div>
                      <span className="font-extrabold text-gray-900 text-base sm:text-lg whitespace-nowrap">
                        R$ 10,58
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Badges Compra Segura / Envio Imediato */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-700 uppercase text-center justify-center border border-gray-200 bg-gray-50 p-2.5 rounded-xl">
                <ShieldCheck className="text-[#16A34A] w-4 h-4" />
                Compra Segura
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-700 uppercase text-center justify-center border border-gray-200 bg-gray-50 p-2.5 rounded-xl">
                <Truck className="text-[#16A34A] w-4 h-4" />
                Envio Imediato
              </div>
            </div>

            {/* MercadoLíder Platinum Section */}
            <div className="mb-8 bg-white border border-gray-200 rounded-2xl p-6 shadow-xs">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-11 bg-gray-50 flex items-center justify-center border border-gray-200 rounded-lg p-1">
                  <img
                    alt="Mercado Pago Platinum"
                    className="w-full h-auto object-contain"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    decoding="async"
                    src="/images/5zDxgo0.png"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#00A650] leading-none uppercase tracking-tight">
                    MercadoLíder Platinum
                  </h4>
                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mt-1">
                    Um dos melhores vendedores do Brasil!
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-1.5 mb-6">
                <div className="h-1.5 bg-gray-200 rounded-full" />
                <div className="h-1.5 bg-gray-200 rounded-full" />
                <div className="h-1.5 bg-gray-200 rounded-full" />
                <div className="h-1.5 bg-emerald-100 rounded-full" />
                <div className="h-1.5 bg-[#00A650] rounded-full shadow-[0_0_8px_rgba(0,166,80,0.3)]" />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="text-center border-r border-gray-200 px-1">
                  <p className="text-xl font-bold text-gray-900 leading-none">
                    18.824
                  </p>
                  <p className="text-[7px] font-bold text-gray-400 uppercase leading-tight mt-1.5">
                    Vendas nos últimos 60 dias
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center px-1 border-r border-gray-200">
                  <MessageSquare className="w-5 h-5 text-[#00A650] mb-1.5" />
                  <p className="text-[7px] font-bold text-gray-400 uppercase leading-tight text-center">
                    Presta bom atendimento
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center px-1">
                  <RefreshCw className="w-5 h-5 text-[#00A650] mb-1.5" />
                  <p className="text-[7px] font-bold text-gray-400 uppercase leading-tight text-center">
                    Entrega no prazo
                  </p>
                </div>
              </div>
            </div>

            {/* Accordions with summarized concise texts */}
            <div className="border-t border-gray-200 divide-y divide-gray-200">
              <details className="py-3.5 group" open>
                <summary className="flex justify-between items-center cursor-pointer list-none text-xs font-bold uppercase tracking-widest text-gray-900">
                  Fragrância: Body Splash Vibration (200ml)
                  <ChevronRight className="w-4 h-4 group-open:rotate-90 transition-transform text-gray-400" />
                </summary>
                <div className="pt-3 text-xs text-gray-600 leading-relaxed">
                  <p>
                    Fragrância masculina que combina o frescor cítrico da bergamota, nuances herbais elegantes e fundo envolvente de almíscar e patchouli. Perfumação leve ideal para a rotina diária.
                  </p>
                </div>
              </details>

              {/* Blunn Section if 2 or 3 bottles kit is chosen */}
              {selectedKit.qty >= 2 && (
                <details className="py-3.5 group" open>
                  <summary className="flex justify-between items-center cursor-pointer list-none text-xs font-bold uppercase tracking-widest text-[#17372D]">
                    Fragrância: Body Splash Blunn (200ml)
                    <ChevronRight className="w-4 h-4 group-open:rotate-90 transition-transform text-[#17372D]" />
                  </summary>
                  <div className="pt-3 text-xs text-gray-600 leading-relaxed">
                    <p>
                      Abertura fresca com notas cítricas vibrantes, corpo aromático com especiarias e fundo marcante de âmbar, patchouli e musk. Presença refinada e masculina para qualquer ocasião.
                    </p>
                  </div>
                </details>
              )}

              {/* Infalível Fero Section if 3 bottles kit is chosen */}
              {selectedKit.qty === 3 && (
                <details className="py-3.5 group" open>
                  <summary className="flex justify-between items-center cursor-pointer list-none text-xs font-bold uppercase tracking-widest text-[#17372D]">
                    Fragrância: Body Splash Infalível Fero (200ml)
                    <ChevronRight className="w-4 h-4 group-open:rotate-90 transition-transform text-[#17372D]" />
                  </summary>
                  <div className="pt-3 text-xs text-gray-600 leading-relaxed">
                    <p>
                      Criação autoral exclusiva com saída fresca de bergamota, limão e algas marinhas, corpo floral sofisticado de hedione e base amadeirada marcante de almíscar, ambroxan e cedro.
                    </p>
                  </div>
                </details>
              )}

              <details className="py-3.5 group">
                <summary className="flex justify-between items-center cursor-pointer list-none text-xs font-bold uppercase tracking-widest text-gray-900">
                  Especificações Técnicas
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-[#16A34A] font-bold">DETALHES</span>
                    <ChevronRight className="w-4 h-4 group-open:rotate-90 transition-transform text-[#16A34A]" />
                  </div>
                </summary>
                <div className="pt-3 text-xs text-gray-600 space-y-1.5">
                  <p>• <strong>Volume Total:</strong> {selectedKit.specs.volumeTotal}</p>
                  <p>• <strong>Itens:</strong> {selectedKit.specs.itens}</p>
                  <p>• <strong>Fragrâncias:</strong> {selectedKit.specs.fragrancias}</p>
                  <p>• <strong>Categoria:</strong> Body Splash Desodorante Colônia</p>
                  <p>• <strong>Indicação:</strong> Uso corporal diário e pós-banho</p>
                </div>
              </details>
            </div>
          </div>
        </div>

        {/* Pirâmide Olfativa Vibration (Modelo original conciso com menos coisa) */}
        <section className="mt-14 flex flex-col items-center">
          <h3 className="text-sm font-extrabold uppercase tracking-widest mb-2 text-gray-900 flex items-center gap-2">
            <span className="w-8 h-px bg-[#17372D]" />
            Pirâmide Olfativa – Vibration
            <span className="w-8 h-px bg-[#17372D]" />
          </h3>
          <p className="text-xs text-gray-500 mb-6">
            Estrutura olfativa sofisticada e energizante
          </p>

          <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs text-center">
              <div className="w-10 h-10 bg-[#16A34A]/10 rounded-full flex items-center justify-center mx-auto mb-3 text-[#16A34A]">
                <Star className="w-4 h-4" />
              </div>
              <h4 className="font-bold uppercase text-xs mb-1 text-gray-900">
                Topo
              </h4>
              <p className="text-sm font-bold text-[#17372D]">Bergamota</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs text-center">
              <div className="w-10 h-10 bg-[#16A34A]/10 rounded-full flex items-center justify-center mx-auto mb-3 text-[#16A34A]">
                <Star className="w-4 h-4" />
              </div>
              <h4 className="font-bold uppercase text-xs mb-1 text-gray-900">
                Coração
              </h4>
              <p className="text-sm font-bold text-[#17372D]">Notas Herbais</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs text-center">
              <div className="w-10 h-10 bg-[#16A34A]/10 rounded-full flex items-center justify-center mx-auto mb-3 text-[#16A34A]">
                <Star className="w-4 h-4" />
              </div>
              <h4 className="font-bold uppercase text-xs mb-1 text-gray-900">
                Fundo
              </h4>
              <p className="text-sm font-bold text-[#17372D]">Almíscar e Patchouli</p>
            </div>
          </div>
        </section>

        {/* Pirâmide Olfativa Blunn (se 2 ou 3 frascos) */}
        {selectedKit.qty >= 2 && (
          <section className="mt-10 flex flex-col items-center animate-in fade-in">
            <h3 className="text-sm font-extrabold uppercase tracking-widest mb-2 text-gray-900 flex items-center gap-2">
              <span className="w-8 h-px bg-[#17372D]" />
              Pirâmide Olfativa – Blunn
              <span className="w-8 h-px bg-[#17372D]" />
            </h3>
            <p className="text-xs text-gray-500 mb-6">
              Notas da fragrância inclusa no kit
            </p>

            <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs text-center">
                <div className="w-10 h-10 bg-[#17372D]/10 rounded-full flex items-center justify-center mx-auto mb-3 text-[#17372D]">
                  <Star className="w-4 h-4" />
                </div>
                <h4 className="font-bold uppercase text-xs mb-1 text-gray-900">Topo</h4>
                <p className="text-sm font-bold text-[#17372D]">Notas Cítricas Vibrantes</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs text-center">
                <div className="w-10 h-10 bg-[#17372D]/10 rounded-full flex items-center justify-center mx-auto mb-3 text-[#17372D]">
                  <Star className="w-4 h-4" />
                </div>
                <h4 className="font-bold uppercase text-xs mb-1 text-gray-900">Coração</h4>
                <p className="text-sm font-bold text-[#17372D]">Notas Aromáticas e Especiarias</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs text-center">
                <div className="w-10 h-10 bg-[#17372D]/10 rounded-full flex items-center justify-center mx-auto mb-3 text-[#17372D]">
                  <Star className="w-4 h-4" />
                </div>
                <h4 className="font-bold uppercase text-xs mb-1 text-gray-900">Fundo</h4>
                <p className="text-sm font-bold text-[#17372D]">Âmbar, Patchouli e Musk</p>
              </div>
            </div>
          </section>
        )}

        {/* Pirâmide Olfativa Infalível Fero (se 3 frascos) - mesma cor #17372D e mesmo modelo */}
        {selectedKit.qty === 3 && (
          <section className="mt-10 flex flex-col items-center animate-in fade-in">
            <h3 className="text-sm font-extrabold uppercase tracking-widest mb-2 text-gray-900 flex items-center gap-2">
              <span className="w-8 h-px bg-[#17372D]" />
              Pirâmide Olfativa – Infalível Fero
              <span className="w-8 h-px bg-[#17372D]" />
            </h3>
            <p className="text-xs text-gray-500 mb-6">
              Notas da fragrância autoral inclusa no kit
            </p>

            <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs text-center">
                <div className="w-10 h-10 bg-[#17372D]/10 rounded-full flex items-center justify-center mx-auto mb-3 text-[#17372D]">
                  <Star className="w-4 h-4" />
                </div>
                <h4 className="font-bold uppercase text-xs mb-1 text-gray-900">Topo</h4>
                <p className="text-sm font-bold text-[#17372D]">Bergamota, Limão e Algas Marinhas</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs text-center">
                <div className="w-10 h-10 bg-[#17372D]/10 rounded-full flex items-center justify-center mx-auto mb-3 text-[#17372D]">
                  <Star className="w-4 h-4" />
                </div>
                <h4 className="font-bold uppercase text-xs mb-1 text-gray-900">Coração</h4>
                <p className="text-sm font-bold text-[#17372D]">Hedione</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs text-center">
                <div className="w-10 h-10 bg-[#17372D]/10 rounded-full flex items-center justify-center mx-auto mb-3 text-[#17372D]">
                  <Star className="w-4 h-4" />
                </div>
                <h4 className="font-bold uppercase text-xs mb-1 text-gray-900">Fundo</h4>
                <p className="text-sm font-bold text-[#17372D]">Almíscar, Ambroxan e Cedro</p>
              </div>
            </div>
          </section>
        )}

        {/* Destaques do Produto */}
        <section className="mt-14 border-t border-gray-200 pt-10">
          <h3 className="text-sm font-extrabold uppercase tracking-widest mb-6 text-center text-gray-900">
            Destaques do Body Splash
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col items-center text-center p-5 bg-white rounded-2xl border border-gray-200 shadow-xs">
              <div className="w-10 h-10 bg-[#16A34A] text-white rounded-full flex items-center justify-center mb-3 shadow-md shadow-[#16A34A]/20">
                <Star className="w-5 h-5" />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-wider mb-1 text-gray-900">
                Cítrica & Sofisticada
              </p>
              <p className="text-[10px] text-gray-500 leading-tight">
                Aroma versátil e elegante.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-5 bg-white rounded-2xl border border-gray-200 shadow-xs">
              <div className="w-10 h-10 bg-[#16A34A] text-white rounded-full flex items-center justify-center mb-3 shadow-md shadow-[#16A34A]/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-wider mb-1 text-gray-900">
                Perfumação Leve
              </p>
              <p className="text-[10px] text-gray-500 leading-tight">
                Para o dia a dia e rotina.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-5 bg-white rounded-2xl border border-gray-200 shadow-xs">
              <div className="w-10 h-10 bg-[#16A34A] text-white rounded-full flex items-center justify-center mb-3 shadow-md shadow-[#16A34A]/20">
                <ThumbsUp className="w-5 h-5" />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-wider mb-1 text-gray-900">
                Reaplicações Fáceis
              </p>
              <p className="text-[10px] text-gray-500 leading-tight">
                Praticidade ao longo do dia.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-5 bg-white rounded-2xl border border-gray-200 shadow-xs">
              <div className="w-10 h-10 bg-[#16A34A] text-white rounded-full flex items-center justify-center mb-3 shadow-md shadow-[#16A34A]/20">
                <CheckCircle className="w-5 h-5" />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-wider mb-1 text-gray-900">
                Frascos de 200ml
              </p>
              <p className="text-[10px] text-gray-500 leading-tight">
                Volume ideal para durar.
              </p>
            </div>
          </div>
        </section>

        {/* Quality Seal / Anti-Avaria Transit Guarantee */}
        <section className="mt-14 max-w-xl mx-auto px-4">
          <div className="bg-white border border-[#16A34A]/30 rounded-3xl p-6 text-center shadow-xs">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 bg-[#16A34A] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#16A34A]/25">
                <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="max-w-md">
                <h3 className="text-xs font-black uppercase tracking-widest mb-1.5 text-gray-900">
                  Selo de Qualidade e Garantia
                </h3>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  Garantimos o{' '}
                  <span className="font-extrabold text-[#16A34A]">
                    reenvio imediato ou seu dinheiro de volta
                  </span>{' '}
                  caso o frasco chegue quebrado ou danificado na viagem. Entrega 100% protegida e sem burocracia.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Customer Reviews (Short, Humanized, with Fast-Loading Images + Text-only) */}
        <section id="avaliacoes" className="mt-20 border-t border-gray-200 pt-12 scroll-mt-6">
          <div className="flex flex-col md:flex-row justify-between items-baseline mb-10 gap-4">
            <div>
              <h3 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-gray-900">
                Avaliações de Clientes
              </h3>
              <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">
                Opiniões de quem comprou e usa o Vibration Primacial
              </p>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-[18px] h-[18px] fill-current" />
                ))}
              </div>
              <span className="text-lg font-bold text-gray-900">4.9 / 5.0</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TESTIMONIALS_DATA.slice(0, visibleReviewsCount).map((t) => (
              <div
                key={t.id}
                className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#17372D] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                        {t.initials}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">
                          {t.name}
                        </p>
                        <p className="text-[9px] text-gray-400 uppercase font-semibold tracking-wider">
                          {t.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex text-amber-500">
                      {[...Array(t.stars)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-gray-700 leading-relaxed mb-4">
                    "{t.text}"
                  </p>

                  {/* Customer Review Photos with fast loading */}
                  {t.photos && t.photos.length > 0 && (
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                      {t.photos.map((photo, pIdx) => (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => onOpenImage(photo)}
                          className="group flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-gray-200 hover:border-[#16A34A] transition-all cursor-zoom-in"
                        >
                          <img
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                            alt="Foto enviada pelo cliente"
                            referrerPolicy="no-referrer"
                            loading="eager"
                            decoding="async"
                            src={photo}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-emerald-700 text-[10px] font-bold uppercase pt-3 border-t border-gray-100">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
                  Compra Verificada
                </div>
              </div>
            ))}
          </div>

          {/* Load More Reviews CTA Button */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3">
            {visibleReviewsCount < TESTIMONIALS_DATA.length ? (
              <button
                type="button"
                onClick={handleLoadMoreReviews}
                disabled={loadingMoreReviews}
                className="inline-flex items-center gap-2.5 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300 hover:border-gray-400 font-extrabold text-xs uppercase tracking-wider py-3.5 px-7 rounded-2xl shadow-xs transition-all cursor-pointer active:scale-95 disabled:opacity-60"
              >
                {loadingMoreReviews ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#16A34A]" />
                    <span>Carregando mais avaliações...</span>
                  </>
                ) : (
                  <>
                    <span>Ver Mais Avaliações ({782 - visibleReviewsCount} restantes)</span>
                    <span className="text-[#16A34A] text-sm font-black">↓</span>
                  </>
                )}
              </button>
            ) : (
              <div className="text-center bg-gray-50 border border-gray-200 px-6 py-3 rounded-2xl text-xs text-gray-500 font-bold uppercase tracking-wider">
                ✓ Todas as avaliações mais recentes sincronizadas (782 no total)
              </div>
            )}
            <p className="text-[11px] text-gray-400 font-medium">
              Exibindo {Math.min(visibleReviewsCount, TESTIMONIALS_DATA.length)} de 782 avaliações de clientes verificados
            </p>
          </div>

          <div className="mt-12 text-center max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-3">
              <h4 className="text-lg font-black uppercase tracking-[0.25em] text-gray-900">
                PRIME STORE
              </h4>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Curadoria especializada em perfumaria premium com o melhor custo-benefício do Brasil. Produtos 100% originais Primacial com garantia e envio prioritário.
            </p>
          </div>
        </section>

        {/* Contact info */}
        <section className="mt-12 border-t border-gray-200 pt-8 pb-10">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-base font-bold uppercase tracking-widest mb-3 text-gray-900">
              Atendimento e Suporte
            </h3>
            <p className="text-xs text-gray-500 mb-6">
              Dúvidas sobre seu pedido ou sobre as fragrâncias Vibration e Blunn? Nosso time de atendimento está à disposição!
            </p>
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gray-50 border border-gray-200 rounded-xl">
              <div className="w-8 h-8 bg-[#17372D] text-white rounded-full flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-[9px] font-bold uppercase text-gray-400">
                  E-mail Oficial
                </p>
                <p className="text-xs font-bold text-gray-900">
                  contato@primestore.com.br
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer in Deep Black with accents */}
      <footer className="bg-black text-white pt-10 pb-10 border-t border-black">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col select-none">
              <div className="flex items-center gap-2">
                <span className="w-6 h-[1px] bg-white" />
                <span className="text-white font-black tracking-[0.22em] text-base uppercase">
                  PRIME
                </span>
                <span className="w-6 h-[1px] bg-white" />
              </div>
              <div className="flex items-center gap-1.5 -mt-1">
                <span className="w-4 h-[1px] bg-white/70" />
                <span className="text-white/80 font-bold tracking-[0.32em] text-[9px] uppercase">
                  STORE
                </span>
                <span className="w-4 h-[1px] bg-white/70" />
              </div>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Fragrâncias marcantes, alta fixação e presença para o homem moderno.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-[#16A34A]">
              Garantias & Compra
            </h4>
            <ul className="text-xs text-zinc-400 space-y-2.5">
              <li>• Produto 100% Original Primacial</li>
              <li>• Garantia de Satisfação de 7 dias</li>
              <li>• Envio Padrão e Envio Full Rápido</li>
              <li>• Pagamento Seguro e Criptografado</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-[#16A34A]">
              Segurança
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed mb-3">
              Ambiente protegido com certificado SSL de 256 bits. Seus dados cadastrais e financeiros são mantidos em sigilo absoluto.
            </p>
            <div className="flex items-center gap-2 text-zinc-400 text-[10px]">
              <Lock className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>Compra Protegida Prime Store Oficial</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile/Desktop Navigation Drawer (Menu 3 tracinhos) */}
      {navMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={() => setNavMenuOpen(false)}
            className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity animate-in fade-in"
          />

          {/* Drawer Panel */}
          <aside className="relative w-full max-w-xs bg-white text-gray-900 shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-left duration-200">
            {/* Header */}
            <div className="bg-black text-white p-4 flex items-center justify-between border-b border-zinc-800">
              <div className="flex flex-col select-none">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-[1.5px] bg-[#16A34A]" />
                  <span className="text-white font-black tracking-[0.2em] text-sm uppercase">
                    PRIME
                  </span>
                  <span className="w-5 h-[1.5px] bg-[#16A34A]" />
                </div>
                <div className="flex items-center gap-1 -mt-0.5">
                  <span className="w-3 h-[1px] bg-white/60" />
                  <span className="text-white/80 font-bold tracking-[0.3em] text-[8px] uppercase">
                    STORE
                  </span>
                  <span className="w-3 h-[1px] bg-white/60" />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNavMenuOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Fechar menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Links */}
            <div className="p-4 flex-1 overflow-y-auto space-y-1 divide-y divide-gray-100">
              <div className="pb-3 space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setNavMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl font-bold text-sm text-gray-800 hover:bg-gray-100 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>Início / Produto</span>
                  <span className="text-xs text-gray-400">›</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setNavMenuOpen(false);
                    const el = document.getElementById('avaliacoes');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl font-bold text-sm text-gray-800 hover:bg-gray-100 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span>Avaliações de Clientes</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-black px-1.5 py-0.5 rounded-full">
                      ★ 4.9 (782)
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">›</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setNavMenuOpen(false);
                    window.scrollTo({ top: 500, behavior: 'smooth' });
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl font-bold text-sm text-gray-800 hover:bg-gray-100 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>Kits Promocionais</span>
                  <span className="text-[10px] bg-[#16A34A]/10 text-[#16A34A] font-black px-1.5 py-0.5 rounded-full">
                    Até 73% OFF
                  </span>
                </button>
              </div>

              {/* Fragrance details */}
              <div className="pt-3 pb-3 space-y-2 text-xs">
                <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-1">
                  Fragrâncias
                </p>
                <div className="px-3 py-2 bg-gray-50 rounded-xl space-y-1">
                  <p className="font-extrabold text-[#17372D]">Vibration 200ml</p>
                  <p className="text-[11px] text-gray-500">Bergamota, Notas Herbais, Almíscar e Patchouli</p>
                </div>
                <div className="px-3 py-2 bg-gray-50 rounded-xl space-y-1">
                  <p className="font-extrabold text-[#17372D]">Blunn 200ml (Kit Duo 2x200ml)</p>
                  <p className="text-[11px] text-gray-500">Cítrico Vibrante, Notas Aromáticas, Âmbar e Musk</p>
                </div>
              </div>

              {/* Guarantees */}
              <div className="pt-3 space-y-2 text-xs text-gray-600 px-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                  <span>Garantia de 7 dias com devolução total</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#16A34A]" />
                  <span>Envio Padrão e Envio Full Rápido</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#16A34A]" />
                  <span>Pagamento 100% Seguro e Criptografado</span>
                </div>
              </div>
            </div>

            {/* Footer with direct buy button */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setNavMenuOpen(false);
                  handleBuyNow();
                }}
                className="w-full bg-[#16A34A] hover:bg-[#15803d] text-white py-3.5 px-4 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-[#16A34A]/25 cursor-pointer transition-all active:scale-[0.98]"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Comprar Agora</span>
              </button>
              <p className="text-[10px] text-gray-400 text-center font-bold uppercase tracking-wider">
                Prime Store Oficial
              </p>
            </div>
          </aside>
        </div>
      )}

      {/* Modern Slide-over Professional Cart Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        selectedKit={selectedKit}
        onSelectKit={onSelectKit}
        onOpenImage={onOpenImage}
      />
    </div>
  );
}
