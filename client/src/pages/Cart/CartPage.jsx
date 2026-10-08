import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence } from "framer-motion";
import { fetchCart } from "../../redux/slices/cartSlice";
import ErrorState from "../../components/ErrorState";
import CartItemRow from "./CartItemRow";
import CartSkeleton from "./CartSkeleton";
import EmptyCart from "./EmptyCart";
import OrderSummary from "./OrderSummary";

function CartPage() {
  const dispatch = useDispatch();
  const { items, status, mutatingItemId } = useSelector((state) => state.cart);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  return (
    <div className="py-8 md:py-10">
      <h1 className="font-heading text-ink text-2xl font-bold mb-8">سبد خرید</h1>

      {status === "loading" || status === "idle" ? (
        <CartSkeleton />
      ) : status === "unauthenticated" ? (
        <EmptyCart needsLogin />
      ) : status === "failed" ? (
        <ErrorState message="خطا در دریافت سبد خرید" onRetry={() => dispatch(fetchCart())} />
      ) : items.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="grid md:grid-cols-3 gap-10">
          <div className="md:col-span-2">
            <AnimatePresence>
              {items.map((item) => (
                <CartItemRow key={item._id} item={item} isMutating={mutatingItemId === item._id} />
              ))}
            </AnimatePresence>
          </div>
          <div>
            <OrderSummary items={items} />
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;