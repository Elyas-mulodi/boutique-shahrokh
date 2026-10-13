import { NavLink } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ExternalLink, LogOut, X } from "lucide-react";
import { NAV_ITEMS } from "../../constants/nav";
import { logout } from "../../redux/slices/authSlice";

const SHOP_URL = import.meta.env.VITE_SHOP_URL || "http://localhost:5173";

function SidebarContent({ onNavigate, onClose }) {
  const dispatch = useDispatch();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 flex-shrink-0 items-center justify-between border-b border-ink/10 px-6">
        <div>
          <p className="font-heading font-bold leading-tight text-ink">بوتیک شاهرخ</p>
          <p className="text-[11px] text-ink/40">پنل مدیریت</p>
        </div>
        {onClose && (
          <button onClick={onClose} aria-label="بستن منو" className="text-ink/50 hover:text-ink">
            <X size={22} />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${
                isActive ? "bg-blue/10 font-bold text-blue" : "text-ink/60 hover:bg-ink/5 hover:text-ink"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={19} />
                <span>{label}</span>
                {isActive && (
                  <span className="absolute right-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-l-full bg-blue" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="flex-shrink-0 space-y-1 border-t border-ink/10 p-3">
        <a
          href={SHOP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-ink/60 transition-colors hover:bg-ink/5 hover:text-ink"
        >
          <ExternalLink size={19} />
          مشاهده فروشگاه
        </a>
        <button
          onClick={() => dispatch(logout())}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-red-600 transition-colors hover:bg-red-50"
        >
          <LogOut size={19} />
          خروج
        </button>
      </div>
    </div>
  );
}

export default SidebarContent;