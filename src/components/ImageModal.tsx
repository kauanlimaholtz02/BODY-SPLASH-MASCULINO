import { X } from 'lucide-react';

interface ImageModalProps {
  src: string | null;
  onClose: () => void;
}

export function ImageModal({ src, onClose }: ImageModalProps) {
  if (!src) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 transition-all"
      onClick={onClose}
    >
      <div
        className="relative max-w-2xl w-full bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl p-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black text-white rounded-full transition-colors z-10 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
        <img
          src={src}
          alt="Visualização"
          referrerPolicy="no-referrer"
          className="w-full h-auto max-h-[85vh] object-contain rounded-xl"
        />
      </div>
    </div>
  );
}
