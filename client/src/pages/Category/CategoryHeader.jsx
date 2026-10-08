import { useState } from "react";
import { motion } from "framer-motion";

function CategoryHeader({ category }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="relative rounded-3xl overflow-hidden bg-ink h-40 md:h-56">
      {category.image && !imgError ? (
        <img
          src={category.image}
          alt={category.name}
          onError={() => setImgError(true)}
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-ink via-blue/30 to-ink" />
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-blue/20 blur-3xl" />
        </>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent" />

      <div className="relative h-full flex flex-col justify-end p-6 md:p-8">
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="font-heading text-paper text-2xl md:text-4xl font-bold"
        >
          {category.name}
        </motion.h1>
      </div>
    </div>
  );
}

export default CategoryHeader;