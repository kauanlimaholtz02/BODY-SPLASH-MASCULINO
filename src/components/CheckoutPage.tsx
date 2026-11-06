import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  Clock,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Lock,
  Truck,
  Sparkles,
  Copy,
  Check,
  CreditCard,
  Barcode,
  BadgeCheck,
  Loader2,
  Zap,
} from 'lucide-react';
import { CustomerData, AddressData, KitOption, ShippingMethod, PaymentMethod } from '../types';
import { KITS_DATA } from '../data/storeData';

interface CheckoutPageProps {
  initialKit: KitOption;
  onBackToStore: () => void;
  onCompleteOrder: (orderData: {
    orderId: string;
    customer: CustomerData;
    address: AddressData;
    kit: KitOption;
    shippingMethod: ShippingMethod;
    shippingCost: number;
    total: number;
    paymentMethod: PaymentMethod;
  }) => void;
  onOpenImage: (src: string) => void;
}

// Simple CPF validator function
function isValidCPF(cpf: string): boolean {
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(clean)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean.charAt(i)) * (10 - i);
  }
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(clean.charAt(i)) * (11 - i);
  }
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(10))) return false;

  return true;
}

export function CheckoutPage({
  initialKit,
  onBackToStore,
  onCompleteOrder,
  onOpenImage,
}: CheckoutPageProps) {
  // Current selected kit in checkout (user can toggle between 1 and 2 bottles)
  const [currentKit, setCurrentKit] = useState<KitOption>(initialKit);
  const [summaryOpen, setSummaryOpen] = useState(true);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Countdown timer for promotional urgency (starts at 14m 53s = 893s)
  const [urgencySeconds, setUrgencySeconds] = useState(893);

  useEffect(() => {
    const timer = setInterval(() => {
      setUrgencySeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Step 1: Customer data
  const [customer, setCustomer] = useState<CustomerData>({
    name: '',
    email: '',
    phone: '',
    cpf: '',
  });
  const [customerErrors, setCustomerErrors] = useState<Partial<CustomerData>>({});

  // Step 2: Address data
  const [address, setAddress] = useState<AddressData>({
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  });
  const [addressErrors, setAddressErrors] = useState<Partial<AddressData>>({});
  const [loadingCep, setLoadingCep] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('padrao');

  // Step 3: Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [pixGenerated, setPixGenerated] = useState(false);
  const [pixSeconds, setPixSeconds] = useState(900); // 15:00
  const [copiedPix, setCopiedPix] = useState(false);

  // Credit card state
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
    installments: '1',
  });
  const [processingOrder, setProcessingOrder] = useState(false);

  // Pix timer
  useEffect(() => {
    if (!pixGenerated) return;
    const timer = setInterval(() => {
      setPixSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [pixGenerated]);

  // Handle Kit Qty in Checkout (+ / -) - Only 1 or 2 bottles
  const handleIncreaseQty = () => {
    if (currentKit.qty >= 2) return;
    const found = KITS_DATA.find((k) => k.qty === 2);
    if (found) setCurrentKit(found);
  };

  const handleDecreaseQty = () => {
    if (currentKit.qty <= 1) return;
    const found = KITS_DATA.find((k) => k.qty === 1);
    if (found) setCurrentKit(found);
  };

  // Masking helpers
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length > 6) {
      v = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
    } else if (v.length > 2) {
      v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
    } else if (v.length > 0) {
      v = `(${v}`;
    }
    setCustomer((prev) => ({ ...prev, phone: v }));
    if (customerErrors.phone) setCustomerErrors((prev) => ({ ...prev, phone: '' }));
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length > 9) {
      v = `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6, 9)}-${v.slice(9)}`;
    } else if (v.length > 6) {
      v = `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6)}`;
    } else if (v.length > 3) {
      v = `${v.slice(0, 3)}.${v.slice(3)}`;
    }
    setCustomer((prev) => ({ ...prev, cpf: v }));
    if (customerErrors.cpf) setCustomerErrors((prev) => ({ ...prev, cpf: '' }));
  };

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 8) v = v.slice(0, 8);
    let formatted = v;
    if (v.length > 5) {
      formatted = `${v.slice(0, 5)}-${v.slice(5)}`;
    }
    setAddress((prev) => ({ ...prev, cep: formatted }));
    if (addressErrors.cep) setAddressErrors((prev) => ({ ...prev, cep: '' }));

    if (v.length === 8) {
      setLoadingCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${v}/json/`);
        const data = await res.json();
        if (data.erro) {
          setAddressErrors((prev) => ({ ...prev, cep: 'CEP não encontrado. Preencha manualmente.' }));
        } else {
          setAddress((prev) => ({
            ...prev,
            street: data.logradouro || prev.street,
            neighborhood: data.bairro || prev.neighborhood,
            city: data.localidade || prev.city,
            state: data.uf || prev.state,
          }));
        }
      } catch {
        // Ignored
      } finally {
        setLoadingCep(false);
      }
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 16) v = v.slice(0, 16);
    const parts = v.match(/.{1,4}/g);
    const formatted = parts ? parts.join(' ') : v;
    setCardData((prev) => ({ ...prev, number: formatted }));
  };

  const handleCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 4) v = v.slice(0, 4);
    if (v.length > 2) {
      v = `${v.slice(0, 2)}/${v.slice(2)}`;
    }
    setCardData((prev) => ({ ...prev, expiry: v }));
  };

  // Step 1 Validation
  const validateStep1 = (): boolean => {
    const errs: Partial<CustomerData> = {};
    const nameWords = customer.name.trim().split(/\s+/);
    if (!customer.name.trim()) {
      errs.name = 'Informe seu nome completo';
    } else if (nameWords.length < 2 || nameWords[1].length < 2) {
      errs.name = 'Informe seu nome e sobrenome';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customer.email.trim()) {
      errs.email = 'Informe seu e-mail';
    } else if (!emailRegex.test(customer.email.trim())) {
      errs.email = 'E-mail inválido. Ex: seuemail@gmail.com';
    }

    const cleanPhone = customer.phone.replace(/\D/g, '');
    if (!cleanPhone) {
      errs.phone = 'Informe seu telefone / WhatsApp';
    } else if (cleanPhone.length < 10) {
      errs.phone = 'Telefone inválido (DDD + número)';
    }

    const cleanCpf = customer.cpf.replace(/\D/g, '');
    if (!cleanCpf) {
      errs.cpf = 'Informe seu CPF para emissão da nota fiscal';
    } else if (!isValidCPF(customer.cpf)) {
      errs.cpf = 'CPF inválido. Verifique os dígitos';
    }

    setCustomerErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setCurrentStep(2);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  // Step 2 Validation
  const validateStep2 = (): boolean => {
    const errs: Partial<AddressData> = {};
    const cleanCep = address.cep.replace(/\D/g, '');
    if (!cleanCep) {
      errs.cep = 'Informe seu CEP';
    } else if (cleanCep.length !== 8) {
      errs.cep = 'CEP deve conter 8 dígitos';
    }

    if (!address.street.trim()) errs.street = 'Informe o endereço (rua/avenida)';
    if (!address.number.trim()) errs.number = 'Informe o número ou S/N';
    if (!address.neighborhood.trim()) errs.neighborhood = 'Informe o bairro';
    if (!address.city.trim()) errs.city = 'Informe a cidade';
    if (!address.state.trim()) errs.state = 'Informe o estado (UF)';

    setAddressErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep2()) {
      setCurrentStep(3);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  // Shipping calculation
  const shippingCost = shippingMethod === 'full' ? 10.58 : 6.27;
  const productsTotal = currentKit.totalPrice;
  const grandTotal = productsTotal + shippingCost;

  // PIX string code
  const pixCopyPasteCode = `00020126580014br.gov.bcb.pix0136d83fa9b1-789a-4e2b-9876-543210abcdef520400005303986540${grandTotal
    .toFixed(2)
    .padStart(5, '0')}5802BR5925PRIME STORE OFICIAL6009SAO PAULO62070503***6304${Math.floor(
    1000 + Math.random() * 9000
  )}`;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixCopyPasteCode);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  const handleGeneratePix = () => {
    setPixGenerated(true);
    setTimeout(() => {
      const el = document.getElementById('pix-display-box');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleCompleteFinalOrder = (method: PaymentMethod) => {
    setProcessingOrder(true);
    setTimeout(() => {
      setProcessingOrder(false);
      const generatedOrderId = `PS-${Math.floor(100000 + Math.random() * 900000)}`;
      onCompleteOrder({
        orderId: generatedOrderId,
        customer,
        address,
        kit: currentKit,
        shippingMethod,
        shippingCost,
        total: grandTotal,
        paymentMethod: method,
      });
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-900 font-sans flex flex-col selection:bg-[#17372D] selection:text-white">
      {/* Checkout Header - Black header with white logo */}
      <header className="bg-black text-white border-b border-black sticky top-0 z-30 shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToStore}
            className="p-2 -ml-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer flex items-center gap-1.5"
            title="Voltar para a Loja"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
            <span className="text-xs font-semibold hidden sm:inline">
              Voltar para a Loja
            </span>
          </button>

          {/* Prime Store Logo in center */}
          <div className="flex flex-col items-center select-none">
            <div className="flex items-center gap-2">
              <span className="w-5 sm:w-8 h-[1px] bg-white" />
              <span className="text-white font-black tracking-[0.22em] text-sm sm:text-base uppercase">
                PRIME
              </span>
              <span className="w-5 sm:w-8 h-[1px] bg-white" />
            </div>
            <div className="flex items-center gap-1.5 -mt-0.5">
              <span className="w-3 sm:w-5 h-[1px] bg-white/70" />
              <span className="text-white/80 font-bold tracking-[0.3em] text-[8px] sm:text-[9px] uppercase">
                STORE
              </span>
              <span className="w-3 sm:w-5 h-[1px] bg-white/70" />
            </div>
          </div>

          <div className="w-9 h-9 rounded-full border border-zinc-800 flex items-center justify-center bg-zinc-900 shadow-xs">
            <ShieldCheck className="w-5 h-5 text-[#34d399]" />
          </div>
        </div>
      </header>

      {/* Promotional Urgency Banner in #17372D */}
      <div className="bg-[#17372D] text-white text-center py-2 px-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-center gap-2 text-xs font-semibold">
          <Clock className="w-4 h-4 text-[#34d399] animate-pulse" />
          <span>PROMOÇÃO EXCLUSIVA VIBRATION GARANTIDA POR:</span>
          <span className="font-mono font-black text-white text-sm bg-black/40 px-2 py-0.5 rounded border border-[#34d399]/30">
            {formatTimer(urgencySeconds)}
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 flex-grow w-full">
        {/* Accordion: Order Summary */}
        <div className="mb-6 bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => setSummaryOpen(!summaryOpen)}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-200"
          >
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-sm text-gray-900 uppercase tracking-wider">
                Resumo do Pedido
              </span>
              <span className="text-xs bg-[#17372D] text-white px-2.5 py-0.5 rounded-full font-bold">
                {currentKit.label}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-black text-sm text-gray-900">
                R$ {grandTotal.toFixed(2).replace('.', ',')}
              </span>
              {summaryOpen ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </div>
          </button>

          {summaryOpen && (
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-4">
                <div
                  onClick={() => onOpenImage(currentKit.images[0])}
                  className="w-16 h-20 rounded-xl bg-gray-50 border border-gray-200 p-1 flex-shrink-0 cursor-zoom-in"
                >
                  <img
                    alt={currentKit.name}
                    className="w-full h-full object-contain"
                    src={currentKit.images[0]}
                  />
                </div>
                <div className="flex-grow min-w-0">
                  <h4 className="font-bold text-sm text-gray-900 truncate">
                    {currentKit.name}
                  </h4>
                  <p className="text-xs text-gray-500">
                    Volume: {currentKit.volume}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-semibold text-gray-500">
                      Qtd:
                    </span>
                    <div className="flex items-center border border-gray-300 rounded-lg bg-gray-50">
                      <button
                        type="button"
                        onClick={handleDecreaseQty}
                        disabled={currentKit.qty <= 1}
                        className="px-2.5 py-1 text-xs text-gray-700 hover:text-black disabled:opacity-30 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-2.5 py-1 text-xs font-bold text-gray-900">
                        {currentKit.qty}
                      </span>
                      <button
                        type="button"
                        onClick={handleIncreaseQty}
                        disabled={currentKit.qty >= 2}
                        className="px-2.5 py-1 text-xs text-gray-700 hover:text-black disabled:opacity-30 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                    {currentKit.qty === 2 && (
                      <span className="text-[10px] font-bold text-[#17372D] bg-[#17372D]/10 px-2 py-0.5 rounded border border-[#17372D]/20">
                        R$ 15,98 cada
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400 line-through block">
                    R$ {currentKit.originalPrice.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-sm font-extrabold text-gray-900">
                    R$ {currentKit.totalPrice.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal produtos</span>
                  <span className="font-semibold text-gray-900">
                    R$ {productsTotal.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>
                    Frete (
                    {shippingMethod === 'full' ? 'Envio Full' : 'Envio Padrão'}
                    )
                  </span>
                  <span className="font-semibold text-[#17372D]">
                    R$ {shippingCost.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-base text-[#17372D]">
                    R$ {grandTotal.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-3 gap-2 mb-8">
          <div
            className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
              currentStep === 1
                ? 'border-[#17372D] bg-[#17372D]/10 text-[#17372D]'
                : currentStep > 1
                ? 'border-[#17372D]/30 bg-white text-[#17372D]'
                : 'border-gray-200 bg-white text-gray-400'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                currentStep > 1
                  ? 'bg-[#17372D] text-white'
                  : currentStep === 1
                  ? 'bg-[#17372D] text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {currentStep > 1 ? '✓' : '1'}
            </span>
            <span className="hidden sm:inline">Identificação</span>
          </div>

          <div
            className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
              currentStep === 2
                ? 'border-[#17372D] bg-[#17372D]/10 text-[#17372D]'
                : currentStep > 2
                ? 'border-[#17372D]/30 bg-white text-[#17372D]'
                : 'border-gray-200 bg-white text-gray-400'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                currentStep > 2
                  ? 'bg-[#17372D] text-white'
                  : currentStep === 2
                  ? 'bg-[#17372D] text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {currentStep > 2 ? '✓' : '2'}
            </span>
            <span className="hidden sm:inline">Entrega</span>
          </div>

          <div
            className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
              currentStep === 3
                ? 'border-[#17372D] bg-[#17372D]/10 text-[#17372D]'
                : 'border-gray-200 bg-white text-gray-400'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                currentStep === 3
                  ? 'bg-[#17372D] text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              3
            </span>
            <span className="hidden sm:inline">Pagamento</span>
          </div>
        </div>

        {/* STEP 1: IDENTIFICAÇÃO */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 sm:p-7 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
              <div className="w-8 h-8 rounded-full bg-[#17372D] text-white flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <h3 className="font-bold text-base text-gray-900">
                  Dados de Identificação
                </h3>
                <p className="text-xs text-gray-500">
                  Preencha seus dados para emissão da nota fiscal e envio
                </p>
              </div>
            </div>

            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Nome Completo *
                </label>
                <input
                  placeholder="Seu nome completo"
                  value={customer.name}
                  onChange={(e) => {
                    setCustomer({ ...customer, name: e.target.value });
                    if (customerErrors.name) setCustomerErrors({ ...customerErrors, name: '' });
                  }}
                  className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none bg-white text-gray-900 placeholder:text-gray-400 ${
                    customerErrors.name
                      ? 'border-rose-500 ring-1 ring-rose-500/20'
                      : 'border-gray-300 focus:border-[#17372D] focus:ring-1 focus:ring-[#17372D]'
                  }`}
                  type="text"
                />
                {customerErrors.name && (
                  <p className="text-xs text-rose-500 mt-1">{customerErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  E-mail para confirmação do pedido *
                </label>
                <input
                  placeholder="seuemail@exemplo.com"
                  value={customer.email}
                  onChange={(e) => {
                    setCustomer({ ...customer, email: e.target.value });
                    if (customerErrors.email) setCustomerErrors({ ...customerErrors, email: '' });
                  }}
                  className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none bg-white text-gray-900 placeholder:text-gray-400 ${
                    customerErrors.email
                      ? 'border-rose-500 ring-1 ring-rose-500/20'
                      : 'border-gray-300 focus:border-[#17372D] focus:ring-1 focus:ring-[#17372D]'
                  }`}
                  type="email"
                />
                {customerErrors.email && (
                  <p className="text-xs text-rose-500 mt-1">{customerErrors.email}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    WhatsApp / Telefone *
                  </label>
                  <input
                    placeholder="(00) 00000-0000"
                    value={customer.phone}
                    onChange={handlePhoneChange}
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none bg-white text-gray-900 placeholder:text-gray-400 ${
                      customerErrors.phone
                        ? 'border-rose-500 ring-1 ring-rose-500/20'
                        : 'border-gray-300 focus:border-[#17372D] focus:ring-1 focus:ring-[#17372D]'
                    }`}
                    type="tel"
                  />
                  {customerErrors.phone && (
                    <p className="text-xs text-rose-500 mt-1">{customerErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    CPF * (para Nota Fiscal)
                  </label>
                  <input
                    placeholder="000.000.000-00"
                    value={customer.cpf}
                    onChange={handleCpfChange}
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none bg-white text-gray-900 placeholder:text-gray-400 ${
                      customerErrors.cpf
                        ? 'border-rose-500 ring-1 ring-rose-500/20'
                        : 'border-gray-300 focus:border-[#17372D] focus:ring-1 focus:ring-[#17372D]'
                    }`}
                    type="text"
                  />
                  {customerErrors.cpf && (
                    <p className="text-xs text-rose-500 mt-1">{customerErrors.cpf}</p>
                  )}
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-[#17372D] hover:bg-[#1f4a3d] text-white py-4 rounded-xl font-bold uppercase tracking-wider text-sm shadow-lg shadow-[#17372D]/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
                >
                  <span>Ir para Entrega</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: ENTREGA */}
        {currentStep === 2 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 sm:p-7 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
              <div className="w-8 h-8 rounded-full bg-[#17372D] text-white flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <h3 className="font-bold text-base text-gray-900">
                  Endereço de Entrega & Opções de Envio
                </h3>
                <p className="text-xs text-gray-500">
                  Informe onde deseja receber o seu Vibration Primacial
                </p>
              </div>
            </div>

            <form onSubmit={handleStep2Submit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    CEP *
                  </label>
                  <div className="relative">
                    <input
                      placeholder="00000-000"
                      maxLength={9}
                      value={address.cep}
                      onChange={handleCepChange}
                      className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none bg-white text-gray-900 placeholder:text-gray-400 ${
                        addressErrors.cep
                          ? 'border-rose-500 ring-1 ring-rose-500/20'
                          : 'border-gray-300 focus:border-[#17372D] focus:ring-1 focus:ring-[#17372D]'
                      }`}
                      type="text"
                    />
                    {loadingCep && (
                      <Loader2 className="w-4 h-4 text-[#17372D] animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                    )}
                  </div>
                  {addressErrors.cep && (
                    <p className="text-xs text-rose-500 mt-1">{addressErrors.cep}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Rua / Avenida *
                  </label>
                  <input
                    placeholder="Nome da sua rua"
                    value={address.street}
                    onChange={(e) => {
                      setAddress({ ...address, street: e.target.value });
                      if (addressErrors.street) setAddressErrors({ ...addressErrors, street: '' });
                    }}
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none bg-white text-gray-900 placeholder:text-gray-400 ${
                      addressErrors.street
                        ? 'border-rose-500 ring-1 ring-rose-500/20'
                        : 'border-gray-300 focus:border-[#17372D] focus:ring-1 focus:ring-[#17372D]'
                    }`}
                    type="text"
                  />
                  {addressErrors.street && (
                    <p className="text-xs text-rose-500 mt-1">{addressErrors.street}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Número *
                  </label>
                  <input
                    placeholder="123 ou S/N"
                    value={address.number}
                    onChange={(e) => {
                      setAddress({ ...address, number: e.target.value });
                      if (addressErrors.number) setAddressErrors({ ...addressErrors, number: '' });
                    }}
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none bg-white text-gray-900 placeholder:text-gray-400 ${
                      addressErrors.number
                        ? 'border-rose-500 ring-1 ring-rose-500/20'
                        : 'border-gray-300 focus:border-[#17372D] focus:ring-1 focus:ring-[#17372D]'
                    }`}
                    type="text"
                  />
                  {addressErrors.number && (
                    <p className="text-xs text-rose-500 mt-1">{addressErrors.number}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Complemento
                  </label>
                  <input
                    placeholder="Apto, Bloco (opcional)"
                    value={address.complement}
                    onChange={(e) => setAddress({ ...address, complement: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#17372D] focus:ring-1 focus:ring-[#17372D] text-sm font-medium transition-all outline-none bg-white text-gray-900 placeholder:text-gray-400"
                    type="text"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Bairro *
                  </label>
                  <input
                    placeholder="Bairro"
                    value={address.neighborhood}
                    onChange={(e) => {
                      setAddress({ ...address, neighborhood: e.target.value });
                      if (addressErrors.neighborhood) setAddressErrors({ ...addressErrors, neighborhood: '' });
                    }}
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none bg-white text-gray-900 placeholder:text-gray-400 ${
                      addressErrors.neighborhood
                        ? 'border-rose-500 ring-1 ring-rose-500/20'
                        : 'border-gray-300 focus:border-[#17372D] focus:ring-1 focus:ring-[#17372D]'
                    }`}
                    type="text"
                  />
                  {addressErrors.neighborhood && (
                    <p className="text-xs text-rose-500 mt-1">{addressErrors.neighborhood}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Cidade *
                  </label>
                  <input
                    placeholder="Cidade"
                    value={address.city}
                    onChange={(e) => {
                      setAddress({ ...address, city: e.target.value });
                      if (addressErrors.city) setAddressErrors({ ...addressErrors, city: '' });
                    }}
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none bg-white text-gray-900 placeholder:text-gray-400 ${
                      addressErrors.city
                        ? 'border-rose-500 ring-1 ring-rose-500/20'
                        : 'border-gray-300 focus:border-[#17372D] focus:ring-1 focus:ring-[#17372D]'
                    }`}
                    type="text"
                  />
                  {addressErrors.city && (
                    <p className="text-xs text-rose-500 mt-1">{addressErrors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Estado (UF) *
                  </label>
                  <input
                    placeholder="SP"
                    maxLength={2}
                    value={address.state}
                    onChange={(e) => {
                      setAddress({ ...address, state: e.target.value.toUpperCase() });
                      if (addressErrors.state) setAddressErrors({ ...addressErrors, state: '' });
                    }}
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none bg-white text-gray-900 placeholder:text-gray-400 uppercase ${
                      addressErrors.state
                        ? 'border-rose-500 ring-1 ring-rose-500/20'
                        : 'border-gray-300 focus:border-[#17372D] focus:ring-1 focus:ring-[#17372D]'
                    }`}
                    type="text"
                  />
                  {addressErrors.state && (
                    <p className="text-xs text-rose-500 mt-1">{addressErrors.state}</p>
                  )}
                </div>
              </div>

              {/* Shipping Selection Options: Envio Padrão (R$ 6,27) and Envio Full (R$ 10,58) */}
              <div className="pt-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                  Escolha a Forma de Envio para sua Região
                </label>

                <div className="space-y-3">
                  {/* Envio Padrão */}
                  <label
                    className={`flex items-center justify-between p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                      shippingMethod === 'padrao'
                        ? 'border-[#17372D] bg-[#17372D]/5 shadow-xs'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shipping"
                        checked={shippingMethod === 'padrao'}
                        onChange={() => setShippingMethod('padrao')}
                        className="accent-[#17372D] w-4 h-4"
                      />
                      <div>
                        <span className="text-xs sm:text-sm font-bold text-gray-900 block">
                          Envio Padrão
                        </span>
                        <span className="text-[11px] text-gray-500">
                          Demora de 7 a 10 dias para entrega
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-black text-[#17372D]">
                      R$ 6,27
                    </span>
                  </label>

                  {/* Envio Full */}
                  <label
                    className={`flex items-center justify-between p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                      shippingMethod === 'full'
                        ? 'border-[#17372D] bg-[#17372D]/5 shadow-xs'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shipping"
                        checked={shippingMethod === 'full'}
                        onChange={() => setShippingMethod('full')}
                        className="accent-[#17372D] w-4 h-4"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-gray-900">
                            Envio Full
                          </span>
                          <span className="text-[9px] font-extrabold text-white bg-[#17372D] px-2 py-0.5 rounded-md uppercase">
                            ⚡ MAIS RÁPIDO
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-500">
                          De 2 a 3 dias de entrega
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-black text-[#17372D]">
                      R$ 10,58
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="w-1/3 py-4 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs sm:text-sm uppercase tracking-wider hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Voltar
                </button>

                <button
                  type="submit"
                  className="w-2/3 bg-[#17372D] hover:bg-[#1f4a3d] text-white py-4 rounded-xl font-bold text-sm sm:text-base uppercase tracking-wider shadow-lg shadow-[#17372D]/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
                >
                  <span>Continuar para Pagamento</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: PAGAMENTO SEGURO */}
        {currentStep === 3 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 sm:p-7 space-y-6">
            {/* Summary of Steps 1 & 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-xs relative">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-400 uppercase font-bold text-[10px]">
                    1. Seus Dados
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-[#17372D] font-bold text-xs hover:underline cursor-pointer"
                  >
                    Editar
                  </button>
                </div>
                <p className="font-semibold text-gray-900">{customer.name}</p>
                <p className="text-gray-500 truncate">{customer.email}</p>
                <p className="text-gray-500">{customer.phone}</p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-xs relative">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-400 uppercase font-bold text-[10px]">
                    2. Entrega & Envio
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-[#17372D] font-bold text-xs hover:underline cursor-pointer"
                  >
                    Editar
                  </button>
                </div>
                <p className="font-semibold text-gray-900">
                  {address.street}, {address.number}
                </p>
                <p className="text-gray-500">
                  {address.neighborhood} • {address.city}/{address.state}
                </p>
                <p className="text-[#17372D] font-bold">
                  {shippingMethod === 'full'
                    ? 'Envio Full (2 a 3 dias - R$ 10,58)'
                    : 'Envio Padrão (7 a 10 dias - R$ 6,27)'}
                </p>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="pt-2">
              <h3 className="font-bold text-base text-gray-900 mb-1">
                Forma de Pagamento
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Escolha como prefere pagar o seu pedido com segurança
              </p>

              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('pix')}
                  className={`p-3.5 rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'pix'
                      ? 'border-[#17372D] bg-[#17372D]/5 shadow-xs'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <span className="font-bold text-xs text-gray-900 uppercase flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#17372D]" />
                    PIX
                  </span>
                  <span className="text-[10px] text-[#17372D] font-extrabold uppercase">
                    Aprovação Instantânea
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('credit_card')}
                  className={`p-3.5 rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'credit_card'
                      ? 'border-[#17372D] bg-[#17372D]/5 shadow-xs'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-gray-700" />
                  <span className="font-bold text-xs text-gray-900 uppercase">
                    Cartão
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('boleto')}
                  className={`p-3.5 rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'boleto'
                      ? 'border-[#17372D] bg-[#17372D]/5 shadow-xs'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <Barcode className="w-5 h-5 text-gray-700" />
                  <span className="font-bold text-xs text-gray-900 uppercase">
                    Boleto
                  </span>
                </button>
              </div>
            </div>

            {/* TAB: PIX */}
            {paymentMethod === 'pix' && (
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-900">
                      Pagamento via PIX
                    </span>
                    <span className="text-[10px] font-extrabold text-white bg-[#17372D] px-2 py-0.5 rounded">
                      Envio Prioritário
                    </span>
                  </div>
                  <span className="text-sm font-black text-gray-900">
                    R$ {grandTotal.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                {!pixGenerated ? (
                  <div className="text-center py-4 space-y-3">
                    <p className="text-xs text-gray-600">
                      Clique no botão abaixo para gerar o seu QR Code e código Copia e Cola exclusivo.
                    </p>
                    <button
                      type="button"
                      onClick={handleGeneratePix}
                      className="w-full bg-[#17372D] hover:bg-[#1f4a3d] text-white py-4 rounded-xl font-bold uppercase tracking-wider text-sm shadow-lg shadow-[#17372D]/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
                    >
                      <Sparkles className="w-4 h-4 text-[#34d399]" />
                      <span>Gerar QR Code PIX Agora</span>
                    </button>
                  </div>
                ) : (
                  <div id="pix-display-box" className="space-y-4 pt-2">
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                      <span className="font-bold">Tempo para pagamento:</span>
                      <span className="font-mono font-black text-sm text-emerald-900">
                        {formatTimer(pixSeconds)}
                      </span>
                    </div>

                    {/* QR Code Representation in SVG */}
                    <div className="flex justify-center py-2">
                      <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-200">
                        <svg className="w-48 h-48" viewBox="0 0 200 200">
                          {/* Corner squares */}
                          <rect x="10" y="10" width="50" height="50" fill="#000" />
                          <rect x="20" y="20" width="30" height="30" fill="#fff" />
                          <rect x="25" y="25" width="20" height="20" fill="#000" />

                          <rect x="140" y="10" width="50" height="50" fill="#000" />
                          <rect x="150" y="20" width="30" height="30" fill="#fff" />
                          <rect x="155" y="25" width="20" height="20" fill="#000" />

                          <rect x="10" y="140" width="50" height="50" fill="#000" />
                          <rect x="20" y="150" width="30" height="30" fill="#fff" />
                          <rect x="25" y="155" width="20" height="20" fill="#000" />

                          {/* Data elements */}
                          <rect x="70" y="15" width="10" height="10" fill="#000" />
                          <rect x="90" y="15" width="10" height="10" fill="#000" />
                          <rect x="110" y="15" width="15" height="10" fill="#000" />

                          <rect x="70" y="35" width="20" height="10" fill="#000" />
                          <rect x="100" y="35" width="25" height="10" fill="#000" />

                          <rect x="15" y="70" width="10" height="10" fill="#000" />
                          <rect x="35" y="70" width="25" height="10" fill="#000" />
                          <rect x="70" y="70" width="15" height="15" fill="#000" />
                          <rect x="95" y="70" width="15" height="15" fill="#000" />
                          <rect x="120" y="70" width="10" height="10" fill="#000" />
                          <rect x="145" y="70" width="25" height="10" fill="#000" />
                          <rect x="180" y="70" width="10" height="10" fill="#000" />

                          <rect x="15" y="90" width="20" height="10" fill="#000" />
                          <rect x="45" y="90" width="15" height="10" fill="#000" />
                          <rect x="75" y="95" width="50" height="10" fill="#000" />
                          <rect x="140" y="90" width="20" height="10" fill="#000" />
                          <rect x="170" y="90" width="15" height="10" fill="#000" />

                          <rect x="15" y="115" width="15" height="15" fill="#000" />
                          <rect x="40" y="115" width="15" height="10" fill="#000" />
                          <rect x="70" y="120" width="15" height="10" fill="#000" />
                          <rect x="95" y="115" width="20" height="15" fill="#000" />
                          <rect x="130" y="120" width="25" height="10" fill="#000" />
                          <rect x="165" y="115" width="20" height="15" fill="#000" />

                          <rect x="70" y="145" width="20" height="10" fill="#000" />
                          <rect x="100" y="145" width="15" height="10" fill="#000" />
                          <rect x="125" y="140" width="10" height="20" fill="#000" />
                          <rect x="145" y="145" width="40" height="10" fill="#000" />

                          <rect x="70" y="170" width="15" height="15" fill="#000" />
                          <rect x="95" y="165" width="30" height="10" fill="#000" />
                          <rect x="135" y="170" width="20" height="15" fill="#000" />
                          <rect x="165" y="165" width="20" height="15" fill="#000" />
                        </svg>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 text-center">
                        Ou copie a chave PIX Copia e Cola:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          readOnly
                          value={pixCopyPasteCode}
                          className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-800 font-mono text-xs truncate"
                        />
                        <button
                          type="button"
                          onClick={handleCopyPix}
                          className="px-4 py-2.5 bg-[#17372D] text-white hover:bg-[#1f4a3d] rounded-lg text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          {copiedPix ? (
                            <>
                              <Check className="w-4 h-4 text-[#34d399]" />
                              <span>Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCompleteFinalOrder('pix')}
                      disabled={processingOrder}
                      className="w-full bg-[#17372D] hover:bg-[#1f4a3d] text-white py-4 rounded-xl font-bold uppercase tracking-wider text-sm shadow-lg shadow-[#17372D]/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
                    >
                      {processingOrder ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin text-white" />
                          <span>Confirmando Pagamento...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5 text-white" />
                          <span>Já realizei o pagamento PIX</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB: CARTÃO DE CRÉDITO */}
            {paymentMethod === 'credit_card' && (
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-4 animate-in fade-in duration-200">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Número do Cartão *
                    </label>
                    <input
                      placeholder="0000 0000 0000 0000"
                      value={cardData.number}
                      onChange={handleCardNumberChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm font-medium focus:border-[#17372D] focus:ring-1 focus:ring-[#17372D] outline-none"
                      type="text"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Nome impresso no Cartão *
                    </label>
                    <input
                      placeholder="NOME COMO NO CARTÃO"
                      value={cardData.name}
                      onChange={(e) => setCardData({ ...cardData, name: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm font-medium focus:border-[#17372D] focus:ring-1 focus:ring-[#17372D] outline-none uppercase"
                      type="text"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                        Validade *
                      </label>
                      <input
                        placeholder="MM/AA"
                        value={cardData.expiry}
                        onChange={handleCardExpiryChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm font-medium focus:border-[#17372D] focus:ring-1 focus:ring-[#17372D] outline-none"
                        type="text"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                        CVV *
                      </label>
                      <input
                        placeholder="123"
                        maxLength={4}
                        value={cardData.cvv}
                        onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '') })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm font-medium focus:border-[#17372D] focus:ring-1 focus:ring-[#17372D] outline-none"
                        type="password"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Parcelamento
                    </label>
                    <select
                      value={cardData.installments}
                      onChange={(e) => setCardData({ ...cardData, installments: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm font-medium focus:border-[#17372D] focus:ring-1 focus:ring-[#17372D] outline-none"
                    >
                      <option value="1">1x de R$ {grandTotal.toFixed(2).replace('.', ',')} (sem juros)</option>
                      <option value="2">2x de R$ {(grandTotal / 2).toFixed(2).replace('.', ',')} (sem juros)</option>
                      <option value="3">3x de R$ {(grandTotal / 3).toFixed(2).replace('.', ',')} (sem juros)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCompleteFinalOrder('credit_card')}
                  disabled={processingOrder}
                  className="w-full bg-[#17372D] hover:bg-[#1f4a3d] text-white py-4 rounded-xl font-bold uppercase tracking-wider text-sm shadow-lg shadow-[#17372D]/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] mt-4"
                >
                  {processingOrder ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-white" />
                      <span>Processando Cartão...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-white" />
                      <span>Pagar R$ {grandTotal.toFixed(2).replace('.', ',')}</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* TAB: BOLETO */}
            {paymentMethod === 'boleto' && (
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-4 animate-in fade-in duration-200">
                <div className="text-xs text-gray-600 space-y-2">
                  <p>• O boleto bancário será gerado após clicar no botão abaixo.</p>
                  <p>• Você pode pagar pelo aplicativo do seu banco ou em qualquer lotérica.</p>
                  <p>• A compensação bancária ocorre em até 1 a 3 dias úteis.</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleCompleteFinalOrder('boleto')}
                  disabled={processingOrder}
                  className="w-full bg-[#17372D] hover:bg-[#1f4a3d] text-white py-4 rounded-xl font-bold uppercase tracking-wider text-sm shadow-lg shadow-[#17372D]/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
                >
                  {processingOrder ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-white" />
                      <span>Gerando Boleto...</span>
                    </>
                  ) : (
                    <>
                      <Barcode className="w-5 h-5 text-white" />
                      <span>Gerar Boleto de R$ {grandTotal.toFixed(2).replace('.', ',')}</span>
                    </>
                  )}
                </button>
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="text-xs font-semibold text-gray-500 hover:text-gray-800 flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar para etapa de Entrega</span>
              </button>
            </div>
          </div>
        )}

        {/* Security badges at bottom */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-xs">
            <ShieldCheck className="w-5 h-5 text-[#17372D] mx-auto mb-1" />
            <span className="text-[10px] font-bold text-gray-700 uppercase block">
              100% Seguro
            </span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-xs">
            <Zap className="w-5 h-5 text-[#17372D] mx-auto mb-1" />
            <span className="text-[10px] font-bold text-gray-700 uppercase block">
              Envio Rápido
            </span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-xs">
            <BadgeCheck className="w-5 h-5 text-[#17372D] mx-auto mb-1" />
            <span className="text-[10px] font-bold text-gray-700 uppercase block">
              Garantia 7 Dias
            </span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-xs">
            <Sparkles className="w-5 h-5 text-[#17372D] mx-auto mb-1" />
            <span className="text-[10px] font-bold text-gray-700 uppercase block">
              Original Primacial
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
