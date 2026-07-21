import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet } from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";
const LayoutContent = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  return <div className="min-h-screen overflow-x-hidden xl:flex">
    <div>
      <AppSidebar />
      <Backdrop />
    </div>
    <div
      className={`min-w-0 flex-1 overflow-x-hidden transition-all duration-300 ease-in-out ${isExpanded || isHovered ? "lg:ml-[290px] lg:w-[calc(100%-290px)]" : "lg:ml-[90px] lg:w-[calc(100%-90px)]"} ${isMobileOpen ? "ml-0 w-full" : "w-full"}`}
    >
      <AppHeader />
      <div className="mx-auto min-w-0 max-w-(--breakpoint-2xl) p-4 md:p-6">
        <Outlet />
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
