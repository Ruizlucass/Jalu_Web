import AdminHeader from "./components/AdminHeader.jsx";
import AdminSidebar from "./components/AdminSidebar.jsx";
import { panelConfigs } from "./data/adminData.js";

export default function AdminLayout({ panelType = "admin", children }) {
  const config = panelConfigs[panelType] || panelConfigs.admin;

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <div className="lg:flex lg:min-h-screen">
        <AdminSidebar config={config} />

        <div className="min-w-0 flex-1">
          <AdminHeader config={config} />

          {children}
        </div>
      </div>
    </main>
  );
}
