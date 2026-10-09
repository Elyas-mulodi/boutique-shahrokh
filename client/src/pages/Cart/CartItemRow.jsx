import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { Minus, Plus, Trash2 } from "lucide-react";
import { changeItemQuantity, removeItem } from "../../redux/slices/cartSlice";

function CartItemRow({ item, isMutating }) {
  const dispatch = useDispatch();

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: isMutating ? 0.5 : 1 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25 }}
      className="flex gap-4 py-5 border-b border-ink/10"
    >
      <div className="w-20 h-24 rounded-xl overflow-hidden bg-ink/5 flex-shrink-0">
        {item.product?.images?.[0] && (
          <img
            src={item.product.images[0]}
            alt={item.product.name}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-body text-ink text-sm font-bold">
            {item.product?.name}
          </h3>
          <p className="font-body text-ink/50 text-xs mt-1 flex items-center gap-1.5">
            سایز: {item.size} • رنگ: {item.color}
            <span
              className="inline-block w-3 h-3 rounded-full border border-ink/15"
              style={{ backgroundColor: item.colorHex || "#D4D4D8" }}
            />
          </p>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="inline-flex items-center border border-ink/15 rounded-full">
            <button
              disabled={isMutating}
              onClick={() =>
                dispatch(
                  changeItemQuantity({
                    itemId: item._id,
                    quantity: Math.max(1, item.quantity - 1),
                  }),
                )
              }
              className="w-8 h-8 flex items-center justify-center text-ink disabled:opacity-30"
            >
              <Minus size={13} />
            </button>
            <span className="w-7 text-center font-body text-sm text-ink">
              {item.quantity}
            </span>
            <button
              disabled={isMutating}
              onClick={() =>
                dispatch(
                  changeItemQuantity({
                    itemId: item._id,
                    quantity: item.quantity + 1,
                  }),
                )
              }
              className="w-8 h-8 flex items-center justify-center text-ink disabled:opacity-30"
            >
              <Plus size={13} />
            </button>
          </div>

          <span className="font-heading text-ink font-bold text-sm">
            {(item.price * item.quantity).toLocaleString("fa-IR")} تومان
          </span>
        </div>
      </div>

      <button
        disabled={isMutating}
        onClick={() => dispatch(removeItem(item._id))}
        className="self-start text-ink/30 hover:text-red-500 transition-colors"
        aria-label="حذف"
      >
        <Trash2 size={17} />
      </button>
    </motion.div>
  );
}

export default CartItemRow;
