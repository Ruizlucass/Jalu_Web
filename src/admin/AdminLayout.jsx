import AdminHeader from "./components/AdminHeader.jsx";
import AdminSidebar from "./components/AdminSidebar.jsx";
import { panelConfigs } from "./data/adminData.js";

export default function AdminLayout({ panelType = "admin", currentPathname, children }) {
  const config = panelConfigs[panelType] || panelConfigs.admin;

  return (
    <main className="min-h-screen min-w-0 bg-[#080808] text-white">
      <div className="xl:flex xl:min-h-screen">
        <AdminSidebar config={config} currentPathname={currentPathname} />

        <div className="min-w-0 flex-1">
          <AdminHeader config={config} currentPathname={currentPathname} />

          {children}
        </div>
      </div>
    </main>
  );
}
