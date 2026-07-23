import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet } from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";
const LayoutContent = () => {
  const { isMobileOpen } = useSidebar();
  return <div className="min-h-screen overflow-x-hidden xl:flex">
    <div>
      <AppSidebar />
      <Backdrop />
    </div>
    <div
      className={`min-w-0 flex-1 overflow-x-hidden transition-all duration-300 ease-in-out ${isMobileOpen ? "ml-0 w-full" : "w-full"}`}
    >
      <AppHeader />
      <div className="pt-[73px] lg:pt-[81px]">
        <div className="min-w-0 px-3 py-4 sm:px-4 md:px-5 md:py-5">
          <Outlet />
        </div>
      </div>
    </div>
  </div>;
};
const AppLayout = () => {
  return <SidebarProvider>
    <LayoutContent />
  </SidebarProvider>;
};
var stdin_default = AppLayout;
export {
  stdin_default as default
};
