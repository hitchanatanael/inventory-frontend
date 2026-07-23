import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import {
    ChartNoAxesColumn,
    ChevronDown,
    CircleDollarSign,
    FileText,
    Grid2X2,
    Boxes,
    Package,
    PackageMinus,
    PackagePlus,
    UsersRound
} from "lucide-react";
import { useSidebar } from "../context/SidebarContext";

const MenuDots = () => <span className="text-lg leading-none">...</span>;

const navItems = [
    {
        icon: <Grid2X2 />,
        name: "Dashboard",
        path: "/"
    }
];

const transactionItems = [
    {
        icon: <PackagePlus />,
        name: "Barang Masuk",
        path: "/barang-masuk"
    },
    {
        icon: <PackageMinus />,
        name: "Barang Keluar",
        path: "/barang-keluar"
    }
];

const masterDataItems = [
    {
        icon: <UsersRound />,
        name: "Master Anggota",
        path: "/master-anggota"
    },
    {
        icon: <Boxes />,
        name: "Master Barang",
        path: "/master-barang"
    }
];

const stockItems = [
    {
        icon: <Package />,
        name: "Stok",
        path: "/stok"
    }
];

const reportItems = [
    {
        icon: <CircleDollarSign />,
        name: "Biaya Keluar",
        path: "/biaya-keluar"
    },
    {
        icon: <ChartNoAxesColumn />,
        name: "Loan Anggota",
        path: "/loan-anggota"
    },
    {
        icon: <FileText />,
        name: "Laporan Keuangan",
        path: "/laporan-keuangan"
    },
];

const menuSections = [
    { key: "main", title: "Menu", items: navItems },
    { key: "master-data", title: "Data Master", items: masterDataItems },
    { key: "transactions", title: "Transaksi", items: transactionItems },
    { key: "stock", title: "Stok", items: stockItems },
    { key: "reports", title: "Laporan", items: reportItems }
];

const AppSidebar = () => {
    const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
    const location = useLocation();
    const [openSubmenu, setOpenSubmenu] = useState(null);
    const [subMenuHeight, setSubMenuHeight] = useState(
        {}
    );
    const subMenuRefs = useRef({});
    const isActive = useCallback(
        (path) => location.pathname === path,
        [location.pathname]
    );
    useEffect(() => {
        let submenuMatched = false;
        menuSections.forEach((section) => {
            section.items.forEach((nav, index) => {
                if (nav.subItems) {
                    nav.subItems.forEach((subItem) => {
                        if (isActive(subItem.path)) {
                            setOpenSubmenu({
                                type: section.key,
                                index
                            });
                            submenuMatched = true;
                        }
                    });
                }
            });
        });
        if (!submenuMatched) {
            setOpenSubmenu(null);
        }
    }, [location, isActive]);
    useEffect(() => {
        if (openSubmenu !== null) {
            const key = `${openSubmenu.type}-${openSubmenu.index}`;
            if (subMenuRefs.current[key]) {
                setSubMenuHeight((prevHeights) => ({
                    ...prevHeights,
                    [key]: subMenuRefs.current[key]?.scrollHeight || 0
                }));
            }
        }
    }, [openSubmenu]);
    const handleSubmenuToggle = (index, menuType) => {
        setOpenSubmenu((prevOpenSubmenu) => {
            if (prevOpenSubmenu && prevOpenSubmenu.type === menuType && prevOpenSubmenu.index === index) {
                return null;
            }
            return { type: menuType, index };
        });
    };
    const renderMenuItems = (items, menuType) => <ul className="flex flex-col gap-4">
        {items.map((nav, index) => <li key={nav.name}>
            {nav.subItems ? <button
                onClick={() => handleSubmenuToggle(index, menuType)}
                className={`menu-item group ${openSubmenu?.type === menuType && openSubmenu?.index === index ? "menu-item-active" : "menu-item-inactive"} cursor-pointer ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`}
            >
                <span
                    className={`menu-item-icon-size  ${openSubmenu?.type === menuType && openSubmenu?.index === index ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}
                >
                    {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && <span className="menu-item-text">{nav.name}</span>}
                {(isExpanded || isHovered || isMobileOpen) && <ChevronDown
                    className={`ml-auto w-5 h-5 transition-transform duration-200 ${openSubmenu?.type === menuType && openSubmenu?.index === index ? "rotate-180 text-brand-500" : ""}`}
                />}
            </button> : nav.path && <Link
                to={nav.path}
                className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"}`}
            >
                <span
                    className={`menu-item-icon-size ${isActive(nav.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}
                >
                    {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && <span className="menu-item-text">{nav.name}</span>}
            </Link>}
            {nav.subItems && (isExpanded || isHovered || isMobileOpen) && <div
                ref={(el) => {
                    subMenuRefs.current[`${menuType}-${index}`] = el;
                }}
                className="overflow-hidden transition-all duration-300"
                style={{
                    height: openSubmenu?.type === menuType && openSubmenu?.index === index ? `${subMenuHeight[`${menuType}-${index}`]}px` : "0px"
                }}
            >
                <ul className="mt-2 space-y-1 ml-9">
                    {nav.subItems.map((subItem) => <li key={subItem.name}>
                        <Link
                            to={subItem.path}
                            className={`menu-dropdown-item ${isActive(subItem.path) ? "menu-dropdown-item-active" : "menu-dropdown-item-inactive"}`}
                        >
                            {subItem.name}
                            <span className="flex items-center gap-1 ml-auto">
                                {subItem.new && <span
                                    className={`ml-auto ${isActive(subItem.path) ? "menu-dropdown-badge-active" : "menu-dropdown-badge-inactive"} menu-dropdown-badge`}
                                >
                                    new
                                </span>}
                                {subItem.pro && <span
                                    className={`ml-auto ${isActive(subItem.path) ? "menu-dropdown-badge-active" : "menu-dropdown-badge-inactive"} menu-dropdown-badge`}
                                >
                                    pro
                                </span>}
                            </span>
                        </Link>
                    </li>)}
                </ul>
            </div>}
        </li>)}
    </ul>;
    return <aside
        className={`fixed mt-16 flex flex-col top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 xl:hidden
        ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        onMouseEnter={() => !isExpanded && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
    >
        <div
            className={`py-6 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}
        >
            <Link to="/">
                {isExpanded || isHovered || isMobileOpen ? <>
                    <div className="flex items-center gap-3">
                        <img
                            src="/images/mandiri-tani-logo.png"
                            alt="Mandiri Tani Sejahtera"
                            className="h-12 w-12 rounded-lg object-contain"
                        />
                        <div className="min-w-0">
                            <p className="text-lg font-semibold leading-5 text-gray-900 dark:text-white">
                                Mandiri Tani Sejahtera
                            </p>
                            <p className="text-xs leading-4 text-gray-500 dark:text-gray-400">
                                KSP CU Mutiara Mandiri
                            </p>
                        </div>
                    </div>
                </> : <img
                    src="/images/mandiri-tani-logo.png"
                    alt="Mandiri Tani Sejahtera"
                    className="h-11 w-11 rounded-lg object-contain"
                />}
            </Link>
        </div>
        <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
            <nav className="mb-6">
                <div className="flex flex-col gap-4">
                    <div>
                        {menuSections.map((section) => <div key={section.key} className="mb-6">
                            <h2
                                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}
                            >
                                {isExpanded || isHovered || isMobileOpen ? section.title : <MenuDots />}
                            </h2>
                            {renderMenuItems(section.items, section.key)}
                        </div>)}
                    </div>
                </div>
            </nav>
        </div>
    </aside>;
};
var stdin_default = AppSidebar;
export {
    stdin_default as default
};
