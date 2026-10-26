import {
    FiX,
    FiPrinter,
    FiEdit2,
    FiTrash2,
    FiUser,
    FiPhone,
    FiMail,
    FiSettings,
    FiHash,
    FiGlobe,
} from "react-icons/fi";

export default function ViewUser({
    user,
    onClose,
    onEdit,
    onDelete,
    deletingId,
}) {
    if (!user) return null;

    // Support both the nested API response and a flattened user object.
    const details = user.systemUser
        ? { ...user.systemUser, ...user }
        : user;

    const active =
        details.status != null
            ? String(details.status).toLowerCase() === "active"
            : details.active === undefined ||
              details.active === null
                ? true
                : details.active === true ||
                  Number(details.active) === 1;

    const locked =
        details.isLocked === true ||
        String(details.isLocked).toLowerCase() === "true" ||
        String(details.isLocked) === "1";

    const userId =
        details.entityBusinessID ??
        details.systemUserID ??
        details.userID ??
        details.id;

    const userName =
        details.entityBusinessName ||
        details.userName ||
        details.fullName ||
        details.name ||
        details.loginID ||
        `User ${userId ?? ""}`;

    const formatValue = (value) => {
        if (value === null || value === undefined || value === "") {
            return "-";
        }

        if (typeof value === "boolean") {
            return value ? "Yes" : "No";
        }

        if (typeof value === "object") {
            return JSON.stringify(value);
        }

        return String(value);
    };

    const Row = ({ label, value }) => (
        <div className="flex flex-col gap-1 border-b border-gray-100 py-3 last:border-0 sm:flex-row sm:justify-between sm:gap-4">
            <span className="shrink-0 text-sm text-gray-500">
                {label}
            </span>

            <span className="wrap-break-words text-sm font-medium text-gray-900 sm:text-right">
                {formatValue(value)}
            </span>
        </div>
    );

    const Section = ({ title, icon: Icon, children }) => (
        <section className="min-w-0 border border-gray-200">
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
        onEdit(user);
    };

    const handleDeactivate = async () => {
        if (typeof onDelete !== "function") return;

        await onDelete(user);
    };

    // All fields returned by the API, including fields added later.
    const excludedFields = [
        "id",
        "name",
        "loginID",
        "email",
        "mobile",
        "designation",
        "qualification",
        "role",
        "roleID",
        "status",
        "systemUser",
    ];

    const additionalFields = Object.entries(details).filter(
        ([key, value]) =>
            !excludedFields.includes(key) &&
            value !== undefined &&
            value !== null &&
            typeof value !== "object"
    );

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
                            User Report
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            User ID: {formatValue(userId)}
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
                    id="user-report-content"
                    className="flex-1 space-y-5 overflow-y-auto p-5 print:overflow-visible print:p-0"
                >
                    {/* User Summary */}
                    <div className="flex flex-col justify-between gap-4 border border-gray-200 p-4 sm:flex-row sm:items-center">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                {userName}
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Login ID: {formatValue(details.loginID)}
                            </p>

                            <p className="mt-2 text-sm text-gray-600">
                                {formatValue(details.designation)}
                            </p>
                        </div>

                        <span
                            className={`w-fit border px-3 py-1 text-xs font-medium ${
                                locked
                                    ? "border-yellow-200 bg-yellow-50 text-yellow-700"
                                    : active
                                        ? "border-green-200 bg-green-50 text-green-700"
                                        : "border-red-200 bg-red-50 text-red-700"
                            }`}
                        >
                            {locked
                                ? "Locked"
                                : active
                                    ? "Active"
                                    : "Inactive"}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        {/* Basic Information */}
                        <Section
                            title="Basic Information"
                            icon={FiUser}
                        >
                            <Row
                                label="Entity Business Name"
                                value={details.entityBusinessName}
                            />

                            <Row
                                label="Login ID"
                                value={details.loginID}
                            />

                            <Row
                                label="Designation"
                                value={details.designation}
                            />

                            <Row
                                label="Qualification"
                                value={details.qualification}
                            />

                            <Row
                                label="Role ID"
                                value={details.roleID}
                            />

                            <Row
                                label="Role"
                                value={details.role}
                            />
                        </Section>

                        {/* Contact Information */}
                        <Section
                            title="Contact Information"
                            icon={FiPhone}
                        >
                            <Row
                                label="Email"
                                value={details.email}
                            />

                            <Row
                                label="Mobile Number"
                                value={details.mobileNumber}
                            />

                            <Row
                                label="Contact Number"
                                value={details.contactNumber}
                            />

                            <Row
                                label="Contact Person"
                                value={details.contactPerson}
                            />

                            <Row
                                label="WhatsApp Number"
                                value={
                                    details.whatsAppNumber ??
                                    details.whatsApp
                                }
                            />

                            <Row
                                label="Address"
                                value={details.address}
                            />
                        </Section>

                        {/* Account Configuration */}
                        <Section
                            title="Account Configuration"
                            icon={FiSettings}
                        >
                            <Row
                                label="Company ID"
                                value={details.companyID}
                            />

                            <Row
                                label="Entity Business ID"
                                value={details.entityBusinessID}
                            />

                            <Row
                                label="Created By"
                                value={details.createdBy}
                            />

                            <Row
                                label="Created IP"
                                value={details.createdIP}
                            />

                            <Row
                                label="Account Locked"
                                value={locked}
                            />

                            <Row
                                label="Active"
                                value={active}
                            />

                            <Row
                                label="Refresh Time"
                                value={details.refreshTime}
                            />
                        </Section>

                        {/* Additional Information */}
                        <Section
                            title="Additional Information"
                            icon={FiGlobe}
                        >
                            <Row
                                label="Signature Path"
                                value={details.signaturePath}
                            />

                            <Row
                                label="Employee ID"
                                value={
                                    details.employeeID ??
                                    details.employeeId
                                }
                            />

                            <Row
                                label="Department"
                                value={
                                    details.departmentName ??
                                    details.department
                                }
                            />

                            <Row
                                label="Company Name"
                                value={details.companyName}
                            />

                            <Row
                                label="Created Date"
                                value={
                                    details.createdDate ??
                                    details.createdOn
                                }
                            />

                            <Row
                                label="Updated Date"
                                value={
                                    details.updatedDate ??
                                    details.updatedOn
                                }
                            />
                        </Section>

                        {/* All remaining scalar API fields */}
                        {additionalFields.length > 0 && (
                            <div className="md:col-span-2">
                                <Section
                                    title="All API Fields"
                                    icon={FiHash}
                                >
                                    {additionalFields.map(([key, value]) => (
                                        <Row
                                            key={key}
                                            label={key.replace(
                                                /([A-Z])/g,
                                                " $1"
                                            ).replace(/^./, (char) =>
                                                char.toUpperCase()
                                            )}
                                            value={value}
                                        />
                                    ))}
                                </Section>
                            </div>
                        )}
                    </div>

                    {/* Printable footer */}
                    <div className="hidden border-t border-gray-300 pt-3 text-xs text-gray-500 print:block">
                        User Report — {userName} — ID: {formatValue(userId)}
                    </div>
                </div>

                {/* Footer Actions */}
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
                        Edit User
                    </button>

                    {!locked && active && (
                        <button
                            type="button"
                            onClick={handleDeactivate}
                            disabled={
                                deletingId !== null &&
                                deletingId !== undefined &&
                                String(deletingId) === String(userId)
                            }
                            className="inline-flex items-center gap-2 border border-red-200 bg-white px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                            <FiTrash2 size={16} />

                            {String(deletingId) === String(userId)
                                ? "Deactivating..."
                                : "Deactivate"}
                        </button>
                    )}
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden !important;
                    }

                    #user-report-content,
                    #user-report-content * {
                        visibility: visible !important;
                    }

                    #user-report-content {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        height: auto !important;
                        overflow: visible !important;
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