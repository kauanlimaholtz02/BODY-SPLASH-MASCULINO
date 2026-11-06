import { CheckCircle2, Copy, Check, Truck, ShieldCheck, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { CustomerData, AddressData, KitOption, ShippingMethod, PaymentMethod } from '../types';

interface OrderSuccessModalProps {
  orderId: string;
  customer: CustomerData;
  address: AddressData;
  kit: KitOption;
  shippingMethod: ShippingMethod;
  shippingCost: number;
  total: number;
  paymentMethod: PaymentMethod;
  onBackToStore: () => void;
}

export function OrderSuccessModal({
  orderId,
  customer,
  address,
  kit,
  shippingMethod,
  shippingCost,
  total,
  paymentMethod,
  onBackToStore,
}: OrderSuccessModalProps) {
  const [copiedTracking, setCopiedTracking] = useState(false);
  const trackingCode = `BR${orderId.replace(/\D/g, '').padEnd(9, '8')}PS`;

  const copyTracking = () => {
    navigator.clipboard.writeText(trackingCode);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  const shippingLabel =
    shippingMethod === 'full'
      ? 'Envio Full (2 a 3 dias úteis - R$ 10,58)'
      : 'Envio Padrão (7 a 10 dias úteis - R$ 6,27)';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl my-8 relative animate-in fade-in zoom-in duration-200 text-gray-900 border border-gray-100">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-[#17372D]/10 text-[#17372D] rounded-full flex items-center justify-center mx-auto shadow-sm ring-8 ring-[#17372D]/5">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <span className="inline-block bg-[#17372D] text-white text-[10px] font-extrabold uppercase px-3.5 py-1 rounded-full tracking-wider shadow-xs">
            {paymentMethod === 'pix'
              ? 'Pedido Registrado com Sucesso!'
              : 'Pagamento Confirmado!'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Parabéns, {customer.name.split(' ')[0]}!
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
            Seu pedido <strong className="text-gray-900">#{orderId}</strong> foi registrado e o seu <strong className="text-[#17372D]">Body Splash Masculino Vibration Primacial</strong> já está sendo preparado para envio.
          </p>
        </div>

        {/* Tracking info */}
        <div className="mt-6 p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-[#17372D]" />
              Código de Rastreamento
            </span>
            <span className="text-[10px] font-bold text-white bg-[#17372D] px-2.5 py-0.5 rounded-md">
              Aguardando Coleta
            </span>
          </div>
          <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-gray-200 shadow-xs">
            <code className="font-mono text-sm font-bold text-gray-900">
              {trackingCode}
            </code>
            <button
              type="button"
              onClick={copyTracking}
              className="text-xs font-bold text-[#17372D] flex items-center gap-1 hover:underline cursor-pointer"
            >
              {copiedTracking ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>
          <p className="text-[11px] text-gray-500">
            Enviaremos todas as atualizações de postagem e movimentação para o seu WhatsApp{' '}
            <strong className="text-gray-800">{customer.phone}</strong> e e-mail <strong className="text-gray-800">{customer.email}</strong>.
          </p>
        </div>

        {/* Order Details */}
        <div className="mt-4 border border-gray-200 rounded-2xl p-4 space-y-3 text-xs bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <span className="text-gray-500">Produto</span>
            <span className="font-bold text-gray-900 text-right">
              {kit.name} ({kit.label})
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <span className="text-gray-500">Endereço de Entrega</span>
            <span className="font-medium text-gray-800 text-right max-w-[260px] truncate">
              {address.street}, {address.number} • {address.city}/{address.state}
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <span className="text-gray-500">Forma de Envio</span>
            <span className="font-semibold text-[#17372D]">
              {shippingLabel}
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <span className="text-gray-500">Forma de Pagamento</span>
            <span className="font-bold uppercase text-gray-900">
              {paymentMethod === 'pix'
                ? 'PIX Instantâneo'
                : paymentMethod === 'credit_card'
                ? 'Cartão de Crédito'
                : 'Boleto Bancário'}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 text-sm font-extrabold text-gray-900">
            <span>Total da Compra</span>
            <span className="text-base text-[#17372D]">
              R$ {total.toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>

        {/* Safe guarantee */}
        <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-gray-500 text-center">
          <ShieldCheck className="w-4 h-4 text-[#17372D]" />
          <span>Compra 100% protegida com garantia de satisfação Prime Store</span>
        </div>

        {/* Action Button */}
        <div className="mt-6">
          <button
            type="button"
            onClick={onBackToStore}
            className="w-full bg-[#17372D] hover:bg-[#1f4a3d] text-white py-4 rounded-xl font-bold uppercase tracking-wider text-sm shadow-lg shadow-[#17372D]/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
          >
            <span>Voltar para a Loja Oficial</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
