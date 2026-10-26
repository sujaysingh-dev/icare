
import {
    FiX,
    FiPrinter,
    FiEdit2,
    FiTrash2,
    FiMapPin,
    FiPhone,
    FiMail,
    FiUser,
    FiSettings,
    FiHash,
    FiGlobe,
} from "react-icons/fi";

export default function ViewCenter({
    center,
    onClose,
    onEdit,
    onDelete,
    deletingId,
}) {
    if (!center) return null;

    const detail = center.centerDetail || {};
    const config = center.centerConfig || {};

    const centerName =
        detail.displayCenterName ||
        detail.entityBusinessName ||
        `Center ${center.entityBusinessID}`;

    const active = Number(center.active) === 1;

    const formatValue = (value) =>
        value === null || value === undefined || value === ""
            ? "-"
            : String(value);

    const formatBalance = (value) => {
        if (value === null || value === undefined || value === "") {
            return "-";
        }

        const amount = Number(value);

        return Number.isFinite(amount)
            ? amount.toLocaleString("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 2,
            })
            : String(value);
    };

    const Row = ({ label, value }) => (
        <div className="flex flex-col gap-1 border-b border-gray-100 py-3 last:border-0 sm:flex-row sm:justify-between sm:gap-4">
            <span className="text-sm text-gray-500">{label}</span>
            <span className="wrap-break-words text-sm font-medium text-gray-900 sm:text-right">
                {formatValue(value)}
            </span>
        </div>
    );

    const Section = ({ title, icon: Icon, children }) => (
        <section className="border border-gray-200">
            <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-3">
                <Icon size={17} className="text-gray-600" />
                <h3 className="text-sm font-semibold text-gray-800">
                    {title}
                </h3>
            </div>
            <div className="px-4">{children}</div>
        </section>
    );

    const handlePrint = () => {
        window.print();
    };

    const handleEdit = () => {
        onClose();
        onEdit(center);
    };

    const handleDeactivate = async () => {
        const success = await onDelete(center);

        if (success) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-3 sm:p-5 print:static print:block print:bg-white print:p-0"
            onClick={onClose}
        >
            <div
                className="flex max-h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-sm bg-white shadow-2xl print:max-h-none print:max-w-none print:overflow-visible print:shadow-none"
                onClick={(event) => event.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 print:hidden">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Center Report
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Center ID: {formatValue(center.entityBusinessID)}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        title="Close report"
                        className="border border-gray-200 p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                    >
                        <FiX size={21} />
                    </button>
                </div>

                {/* Printable report */}
                <div
                    id="center-report-content"
                    className="flex-1 space-y-5 overflow-y-auto p-5 print:overflow-visible print:p-0"
                >
                    <div className="flex flex-col justify-between gap-4 border border-gray-200 p-4 sm:flex-row sm:items-center">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                {centerName}
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Business Name:{" "}
                                {formatValue(detail.entityBusinessName)}
                            </p>
                            <p className="mt-2 text-sm text-gray-600">
                                {formatValue(detail.address)}
                            </p>
                        </div>

                        <span
                            className={`w-fit border px-3 py-1 text-xs font-medium ${active
                                    ? "border-green-200 bg-green-50 text-green-700"
                                    : "border-gray-200 bg-gray-100 text-gray-600"
                                }`}
                        >
                            {active ? "Active" : "Inactive"}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <Section title="Basic Information" icon={FiHash}>
                            <Row
                                label="Center ID"
                                value={center.entityBusinessID}
                            />
                            <Row
                                label="Display Name"
                                value={detail.displayCenterName}
                            />
                            <Row
                                label="Business Entity Name"
                                value={detail.entityBusinessName}
                            />
                            <Row
                                label="Category"
                                value={detail.categoryName}
                            />
                            <Row
                                label="Facility Type"
                                value={
                                    detail.facilities
                                        ?.map((facility) => facility.facilityType)
                                        .filter(Boolean)
                                        .join(", ") ||
                                    detail.facilityType
                                }
                            />
                            <Row
                                label="Status"
                                value={active ? "Active" : "Inactive"}
                            />
                        </Section>

                        <Section title="Contact Information" icon={FiPhone}>
                            <Row
                                label="Contact Person"
                                value={detail.contactPerson}
                            />
                            <Row
                                label="Contact Number"
                                value={detail.contactNumber}
                            />
                            <Row
                                label="Email"
                                value={detail.contactEmail}
                            />
                            <Row
                                label="WhatsApp"
                                value={
                                    detail.whatsAppNumber ||
                                    detail.whatsApp
                                }
                            />
                        </Section>

                        <Section title="Center Configuration" icon={FiSettings}>
                            <Row
                                label="Auto Assign"
                                value={
                                    (config.allowAutoAssign ??
                                        detail.allowAutoAssign) == null
                                        ? "-"
                                        : Number(
                                            config.allowAutoAssign ??
                                            detail.allowAutoAssign
                                        ) === 1
                                            ? "Yes"
                                            : "No"
                                }
                            />
                            <Row
                                label="Priority"
                                value={config.priorityName}
                            />
                            <Row
                                label="TAT"
                                value={
                                    config.tat == null
                                        ? "-"
                                        : `${config.tat} minutes`
                                }
                            />
                            <Row
                                label="Prepaid Balance"
                                value={formatBalance(config.prePaidBalance)}
                            />
                            <Row
                                label="Duration"
                                value={config.duration}
                            />
                            <Row
                                label="Payment Method"
                                value={config.paymentMethod}
                            />
                            <Row
                                label="Billing Cycle"
                                value={config.billingCycle}
                            />
                        </Section>

                        <Section title="Address & Location" icon={FiGlobe}>
                            <Row
                                label="Address"
                                value={detail.address}
                            />
                            <Row
                                label="State ID"
                                value={detail.stateID}
                            />
                            <Row
                                label="District ID"
                                value={detail.districtID}
                            />
                            <Row
                                label="Latitude"
                                value={detail.latitude}
                            />
                            <Row
                                label="Longitude"
                                value={detail.longitude}
                            />

                            {detail.latitude != null &&
                                detail.longitude != null && (
                                    <a
                                        href={`https://www.google.com/maps?q=${encodeURIComponent(
                                            `${detail.latitude},${detail.longitude}`
                                        )}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="my-3 inline-flex items-center gap-2 text-sm text-blue-600 hover:underline print:hidden"
                                    >
                                        <FiMapPin size={15} />
                                        Open in Google Maps
                                    </a>
                                )}
                        </Section>
                    </div>

                    {Array.isArray(detail.facilities) &&
                        detail.facilities.length > 0 && (
                            <Section title="Facilities" icon={FiSettings}>
                                <div className="flex flex-wrap gap-2 py-4">
                                    {detail.facilities.map((facility, index) => (
                                        <span
                                            key={
                                                facility.facilityType || index
                                            }
                                            className="border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                                        >
                                            {facility.facilityType || "Facility"}
                                        </span>
                                    ))}
                                </div>
                            </Section>
                        )}

                    <div className="hidden border-t border-gray-300 pt-3 text-xs text-gray-500 print:block">
                        Center Report — {centerName} — ID:{" "}
                        {center.entityBusinessID}
                    </div>
                </div>

                {/* Footer actions */}
                <div className="flex flex-wrap justify-end gap-2 border-t border-gray-200 bg-gray-50 px-5 py-4 print:hidden">
                    <button
                        type="button"
                        onClick={onClose}
                        className="border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-100"
                    >
                        Close
                    </button>

                    <button
                        type="button"
                        onClick={handlePrint}
                        className="inline-flex items-center gap-2 border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-100"
                    >
                        <FiPrinter size={16} />
                        Print
                    </button>

                    <button
                        type="button"
                        onClick={handleEdit}
                        className="inline-flex items-center gap-2 bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                    >
                        <FiEdit2 size={16} />
                        Edit Center
                    </button>

                    {active && (
                        <button
                            type="button"
                            onClick={handleDeactivate}
                            disabled={deletingId === center.entityBusinessID}
                            className="inline-flex items-center gap-2 border border-red-200 bg-white px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                            <FiTrash2 size={16} />
                            {deletingId === center.entityBusinessID
                                ? "Deactivating..."
                                : "Deactivate"}
                        </button>
                    )}
                </div>
            </div>

            <style>{`
                @media print {
                    body * {
                        visibility: hidden !important;
                    }

                    #center-report-content,
                    #center-report-content * {
                        visibility: visible !important;
                    }

                    #center-report-content {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        height: auto !important;
                    }

                    @page {
                        size: A4;
                        margin: 12mm;
                    }
                }
            `}</style>
        </div>
    );
}
