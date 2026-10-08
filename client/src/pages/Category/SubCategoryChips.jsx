import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function SubCategoryChips({ items }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
      {items.map((item, i) => (
        <motion.div
          key={item._id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04, duration: 0.25 }}
          className="flex-shrink-0"
        >
          <Link
            to={`/category/${item.slug}`}
            className="block whitespace-nowrap border border-ink/15 rounded-full px-4 py-2 text-sm font-body text-ink hover:bg-ink hover:text-paper hover:border-ink transition-colors"
          >
            {item.name}
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

export default SubCategoryChips;