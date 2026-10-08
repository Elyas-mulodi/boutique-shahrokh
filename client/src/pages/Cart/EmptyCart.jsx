import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

function EmptyCart({ needsLogin }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
      <div className="w-16 h-16 rounded-full bg-ink/5 flex items-center justify-center">
        <ShoppingBag size={28} className="text-ink/30" />
      </div>
      <p className="font-body text-ink/60">
        {needsLogin ? "برای مشاهده سبد خرید ابتدا وارد حساب کاربری شوید" : "سبد خرید شما خالی است"}
      </p>
      <Link
        to={needsLogin ? "/account" : "/products"}
        className="bg-ink text-paper font-body font-bold px-6 py-2.5 rounded-full hover:bg-blue transition-colors"
      >
        {needsLogin ? "ورود به حساب کاربری" : "مشاهده محصولات"}
      </Link>
    </div>
  );
}

export default EmptyCart;