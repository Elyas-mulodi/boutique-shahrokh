import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function Gallery({ images = [] }) {
  const [active, setActive] = useState(0);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [zooming, setZooming] = useState(false);
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[3/4] rounded-2xl bg-ink/5 flex items-center justify-center">
        <span className="font-body text-ink/30 text-sm">بدون تصویر</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col-reverse md:flex-row gap-3">
      {/* تامبنیل‌ها */}
      <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`relative flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
              active === i ? "border-blue" : "border-transparent opacity-60 hover:opacity-100"
            }`}
          >
            <img src={img} alt={`تصویر ${i + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {/* تصویر اصلی با ذره‌بین */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setZooming(true)}
        onMouseLeave={() => setZooming(false)}
        className="relative flex-1 aspect-[3/4] rounded-2xl overflow-hidden bg-ink/5 cursor-zoom-in"
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={active}
            src={images[active]}
            alt="تصویر محصول"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* لایه ذره‌بین - فقط دسکتاپ */}
        {zooming && (
          <div
            className="hidden md:block absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `url(${images[active]})`,
              backgroundSize: "220%",
              backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
            }}
          />
        )}
      </div>
    </div>
  );
}

export default Gallery;