import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

function InventoryPlaceholder({ title, description }) {
    return (
        <>
            <PageMeta
                title={`${title} | Mandiri Tani Sejahtera`}
                description={description}
            />
            <PageBreadcrumb pageTitle={title} />
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
                    {title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {description}
                </p>
            </div>
        </>
    );
}

export default InventoryPlaceholder;
