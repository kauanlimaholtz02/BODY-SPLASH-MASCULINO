export interface KitOption {
  qty: number;
  unitPrice: number;
  totalPrice: number;
  originalPrice: number;
  label: string;
  badge?: string;
  name: string;
  subtitle: string;
  images: string[];
  volume: string;
  fragrances: string[];
  description: string;
  specs: {
    volumeTotal: string;
    itens: string;
    fragrancias: string;
    tipo: string;
    duracao: string;
    indicacao: string;
  };
  discountText: string;
}

export interface CustomerData {
  name: string;
  email: string;
  phone: string;
  cpf: string;
}

export interface AddressData {
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

export type ShippingMethod = 'padrao' | 'full' | 'gratis' | 'pac' | 'sedex';

export interface ShippingOption {
  id: ShippingMethod;
  name: string;
  price: number;
  deliveryTime: string;
  badge?: string;
}

export type PaymentMethod = 'pix' | 'credit_card' | 'boleto';

export interface Testimonial {
  id: string;
  name: string;
  date: string;
  text: string;
  avatar?: string;
  initials?: string;
  photos?: string[];
  verified: boolean;
  stars: number;
}
