import SidebarContent from "./SidebarContent";

function Sidebar() {
  return (
    <aside className="fixed right-0 top-0 z-30 hidden h-screen w-64 border-l border-ink/10 bg-white lg:block">
      <SidebarContent />
    </aside>
  );
}

export default Sidebar;