import { ShoppingCart, X } from 'lucide-react';
import { KitOption } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedKit: KitOption;
  onSelectKit: (kit: KitOption) => void;
  onOpenImage: (src: string) => void;
}

export function CartDrawer({
  isOpen,
  onClose,
  selectedKit,
}: CartDrawerProps) {
  if (!isOpen) return null;

  const handleGoToCheckout = () => {
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

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Slide-over Drawer matching reference image exactly */}
      <aside className="relative w-full max-w-[380px] sm:max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Header - EXACTLY as reference image */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-5 h-5 text-[#17372D]" />
            <h3 className="font-extrabold uppercase tracking-wide text-sm sm:text-base text-gray-900">
              SEU CARRINHO
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="p-1 rounded-full text-gray-800 hover:text-black hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>

        {/* Body - EXACTLY as reference image */}
        <div className="flex-grow flex flex-col items-center justify-center p-6 text-center space-y-4">
          {/* Centered Cart Circle */}
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-1">
            <ShoppingCart className="w-10 h-10 text-gray-400 stroke-[1.7]" />
          </div>

          <p className="text-gray-600 text-sm sm:text-base font-medium">
            Seu carrinho está vazio
          </p>

          <button
            type="button"
            onClick={onClose}
            className="text-[#17372D] hover:opacity-80 font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-opacity cursor-pointer pt-1"
          >
            CONTINUAR COMPRANDO
          </button>
        </div>
      </aside>
    </div>
  );
}
