import { useState } from "react";
import { ImageOff } from "lucide-react";
import { resolveImage } from "../../utils/image";

function Thumb({ src, alt = "", className = "h-11 w-9" }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={`flex flex-shrink-0 items-center justify-center rounded-lg bg-ink/5 ${className}`}>
        <ImageOff size={14} className="text-ink/25" />
      </div>
    );
  }

  return (
    <img
      src={resolveImage(src)}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`flex-shrink-0 rounded-lg object-cover ${className}`}
    />
  );
}

export default Thumb;