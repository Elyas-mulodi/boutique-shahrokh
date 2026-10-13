import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Menu } from "lucide-react";
import { NAV_ITEMS } from "../../constants/nav";

function getTitle(pathname) {
  const matches = NAV_ITEMS.filter((item) => (item.end ? pathname === item.to : pathname.startsWith(item.to)));
  matches.sort((a, b) => b.to.length - a.to.length);
  return matches[0]?.label || "پنل مدیریت";
}

function Topbar({ onMenu }) {
  const { pathname } = useLocation();
  const user = useSelector((state) => state.auth.user);

  return (
    <header
      className="sticky top-0 z-20 border-b border-ink/10 bg-paper/90 backdrop-blur-md"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button onClick={onMenu} aria-label="باز کردن منو" className="text-ink lg:hidden">
            <Menu size={24} />
          </button>
          <h2 className="truncate font-heading font-bold text-ink">{getTitle(pathname)}</h2>
        </div>

        <div className="flex flex-shrink-0 items-center gap-3">
          <div className="hidden text-left sm:block">
            <p className="text-sm font-bold leading-tight text-ink">{user?.name}</p>
            <p className="text-[11px] text-ink/40">مدیر</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink font-heading font-bold text-paper">
            {user?.name?.[0] || "؟"}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;