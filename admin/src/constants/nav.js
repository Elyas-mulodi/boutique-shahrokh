import { LayoutDashboard, TrendingUp, ShoppingBag,Image, Shirt, LayoutGrid, Users, Ticket } from "lucide-react";

export const NAV_ITEMS = [
  { to: "/", label: "داشبورد", icon: LayoutDashboard, end: true },
  { to: "/reports", label: "آمار و گزارش‌ها", icon: TrendingUp },
  { to: "/orders", label: "سفارش‌ها", icon: ShoppingBag },
  { to: "/products", label: "محصولات", icon: Shirt },
  { to: "/categories", label: "دسته‌بندی‌ها", icon: LayoutGrid },
  { to: "/users", label: "کاربران", icon: Users },
  { to: "/banners", label: "بنرها", icon: Image },
  { to: "/coupons", label: "کدهای تخفیف", icon: Ticket },
];