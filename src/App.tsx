import { useState } from 'react';
import { ProductPage } from './components/ProductPage';
import { ImageModal } from './components/ImageModal';
import { KITS_DATA } from './data/storeData';
import { KitOption } from './types';

export default function App() {
  const [selectedKit, setSelectedKit] = useState<KitOption>(KITS_DATA[0]);
  const [modalImage, setModalImage] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <ProductPage
        selectedKit={selectedKit}
        onSelectKit={setSelectedKit}
        onOpenImage={(src) => setModalImage(src)}
      />

      {/* Image Lightbox Modal */}
      <ImageModal src={modalImage} onClose={() => setModalImage(null)} />
    </div>
  );
}
