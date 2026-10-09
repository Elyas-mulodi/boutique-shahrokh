import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";

function InfoPageLayout({ title, subtitle, children }) {
  return (
    <div className="py-8 md:py-12 max-w-3xl mx-auto">
      <div className="flex items-center gap-1.5 text-xs font-body text-ink/50 mb-6">
        <Link to="/" className="hover:text-ink transition-colors">
          خانه
        </Link>
        <ChevronLeft size={12} />
        <span className="text-ink">{title}</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="font-heading text-ink text-2xl md:text-3xl font-bold">{title}</h1>
        {subtitle && (
          <p className="font-body text-ink/60 text-sm md:text-base mt-3 leading-7">{subtitle}</p>
        )}
        <div className="mt-8">{children}</div>
      </motion.div>
    </div>
  );
}

export default InfoPageLayout;