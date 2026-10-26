import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = "http://localhost:5000/api/centers/update";

const initialDetail = {
    entityBusinessName: "",
    displayCenterName: "",
    address: "",
    contactNumber: "",
    contactEmail: "",
    contactPerson: "",
    whatsAppNumber: "",
    stateID: 2,
    districtID: 3,
    categoryID: 1,
    facilityType: ["CR"],
    latitude: "",
    longitude: "",
    studyDescCategory: 0,
    ignoreUploadCount: 0,
    allowAutoAssign: 1,
};

const initialConfig = {
    verifyFlag: 1,
    newMsWordVersion: 0,
    duration: 45,
    tatTrackFlag: 1,
    tat: 120,
    eskGroup: 0,
    editFlag: 1,
    gst: 1,
    autoBillGeneration: 1,
    paymentMethod: "Bank Transfer",
    gracePeriod: 15,
    maxAmountAllowed: 500000,
    billingCycle: "Monthly",
    reportDateFormat: 1,
    validity: 365,
    minAmountAllowed: 100,
    prePaidBalance: 0,
    limbsBillingApplicable: 0,
    imageTransferBilling: 1,
    lookupType: 0,
    markForDuplicateNew: 0,
    markForDuplicateRead: 0,
    markForDuplicateFinal: 0,
    whatsAppIntegration: 1,
    emailIntegration: 1,
    smsIntegration: 1,
    billGeneration: 1,
    priority: 1,
};

const centerFields = [
    { name: "displayCenterName", label: "Display Center Name", required: true },
    { name: "entityBusinessName", label: "Business Entity Name", required: true },
    { name: "address", label: "Address", required: true },
    { name: "contactPerson", label: "Contact Person", required: true },
    { name: "contactNumber", label: "Contact Number", required: true },
    { name: "contactEmail", label: "Email ID", type: "email", required: true },
    { name: "whatsAppNumber", label: "WhatsApp Number" },
    { name: "latitude", label: "Latitude" },
    { name: "longitude", label: "Longitude" },
    { name: "stateID", label: "State ID", type: "number", required: true },
    { name: "districtID", label: "District ID", type: "number", required: true },
    { name: "categoryID", label: "Category ID", type: "number", required: true },
];

const configFields = [
    { name: "duration", label: "Duration (Min)", type: "number" },
    { name: "tat", label: "TAT (Min)", type: "number" },
    { name: "gracePeriod", label: "Grace Period", type: "number" },
    { name: "validity", label: "Validity (Days)", type: "number" },
    { name: "minAmountAllowed", label: "Minimum Amount", type: "number" },
    { name: "maxAmountAllowed", label: "Maximum Amount", type: "number" },
    { name: "prePaidBalance", label: "Prepaid Balance", type: "number" },
];

const toggleFields = [
    { name: "active", label: "Active Center", section: "center" },
    { name: "allowAutoAssign", label: "Allow Auto Assign", section: "detail" },
    { name: "verifyFlag", label: "Verify Flag" },
    { name: "tatTrackFlag", label: "TAT Tracking" },
    { name: "editFlag", label: "Allow Editing" },
    { name: "gst", label: "GST" },
    { name: "autoBillGeneration", label: "Auto Bill Generation" },
    { name: "billGeneration", label: "Bill Generation" },
    { name: "imageTransferBilling", label: "Image Transfer Billing" },
    { name: "limbsBillingApplicable", label: "LIMBS Billing" },
    { name: "whatsAppIntegration", label: "WhatsApp Integration" },
    { name: "emailIntegration", label: "Email Integration" },
    { name: "smsIntegration", label: "SMS Integration" },
    { name: "newMsWordVersion", label: "New MS Word Version" },
    { name: "ignoreUploadCount", label: "Ignore Upload Count", section: "detail" },
    { name: "markForDuplicateNew", label: "Duplicate Check - New" },
    { name: "markForDuplicateRead", label: "Duplicate Check - Read" },
    { name: "markForDuplicateFinal", label: "Duplicate Check - Final" },
];

const facilityOptions = [
    { value: "CR", label: "CR" },
    { value: "DR", label: "DR" },
    { value: "CT", label: "CT" },
    { value: "MR", label: "MR" },
];

const selectOptions = {
    paymentMethod: [
        { value: "", label: "Select Payment Method" },
        { value: "Bank Transfer", label: "Bank Transfer" },
        { value: "Cash", label: "Cash" },
        { value: "Online", label: "Online" },
    ],
    billingCycle: [
        { value: "", label: "Select Billing Cycle" },
        { value: "Monthly", label: "Monthly" },
        { value: "Weekly", label: "Weekly" },
        { value: "Daily", label: "Daily" },
        { value: "Yearly", label: "Yearly" },
    ],
    priority: [
        { value: "", label: "Select Priority" },
        { value: "1", label: "High" },
        { value: "2", label: "Medium" },
        { value: "3", label: "Low" },
    ],
    reportDateFormat: [
        { value: "", label: "Select Report Date Format" },
        { value: "0", label: "0" },
        { value: "1", label: "1" },
        { value: "2", label: "2" },
    ],
    eskGroup: [
        { value: "", label: "Select ESK Group" },
        { value: "0", label: "0" },
        { value: "1", label: "1" },
        { value: "2", label: "2" },
    ],
    lookupType: [
        { value: "", label: "Select Lookup Type" },
        { value: "0", label: "0" },
        { value: "1", label: "1" },
        { value: "2", label: "2" },
    ],
    studyDescCategory: [
        { value: "", label: "Select Study Description" },
        { value: "0", label: "0" },
        { value: "1", label: "1" },
        { value: "2", label: "2" },
    ],
};

function Section({ title, children }) {
    return (
        <section className="min-w-0 border border-gray-200 bg-white">
            <h3 className="border-b border-gray-200 bg-gray-50 px-4 py-3 font-semibold text-gray-800">
                {title}
            </h3>

            <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
                {children}
            </div>
        </section>
    );
}

function Field({ field, value, onChange }) {
    return (
        <label className="block w-full min-w-0">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500"> *</span>}
            </span>

            <input
                type={field.type || "text"}
                name={field.name}
                value={value ?? ""}
                required={field.required}
                onChange={onChange}
                step={field.type === "number" ? "any" : undefined}
                className="block h-9.5 w-full min-w-0 border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
        </label>
    );
}

function SelectField({ label, name, value, options, onChange }) {
    return (
        <label className="block w-full min-w-0">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">
                {label}
            </span>

            <select
                name={name}
                value={value ?? ""}
                onChange={onChange}
                className="block h-9.5 w-full min-w-0 appearance-none border border-gray-300 bg-white px-3 pr-9 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                style={{
                    backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 10px center",
                    backgroundSize: "16px",
                }}
            >
                {options.map((option) => (
                    <option key={String(option.value)} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </label>
    );
}

function ToggleField({ label, checked, onChange }) {
    return (
        <div className="flex min-w-0 items-center justify-between gap-3 border border-gray-200 px-3 py-3">
            <span className="text-sm font-medium text-gray-700">
                {label}
            </span>

            <button
                type="button"
                role="switch"
                aria-label={label}
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center transition-colors ${
                    checked ? "bg-blue-600" : "bg-gray-300"
                }`}
            >
                <span
                    className={`inline-block h-4 w-4 transform bg-white transition-transform ${
                        checked ? "translate-x-6" : "translate-x-1"
                    }`}
                />
            </button>
        </div>
    );
}

function FacilityTypeSelect({ value, onChange }) {
    const selectedFacilities = Array.isArray(value) ? value : [];

    const handleToggle = (type) => {
        const selected = selectedFacilities.includes(type)
            ? selectedFacilities.filter((item) => item !== type)
            : [...selectedFacilities, type];

        onChange(selected);
    };

    return (
        <div className="min-w-0">
            <span className="mb-2 block text-sm font-medium text-gray-700">
                Facility Types <span className="text-red-500">*</span>
            </span>

            <div className="grid grid-cols-2 gap-3 border border-gray-300 p-3 sm:grid-cols-4">
                {facilityOptions.map((facility) => (
                    <label
                        key={facility.value}
                        className="flex cursor-pointer items-center gap-2 text-sm"
                    >
                        <input
                            type="checkbox"
                            checked={selectedFacilities.includes(facility.value)}
                            onChange={() => handleToggle(facility.value)}
                            className="h-4 w-4 accent-blue-600"
                        />
                        {facility.label}
                    </label>
                ))}
            </div>

            <p className="mt-1 text-xs text-gray-500">
                Selected:{" "}
                {selectedFacilities.length
                    ? selectedFacilities.join(", ")
                    : "None"}
            </p>
        </div>
    );
}

function toBoolean(value) {
    return value === true || Number(value) === 1;
}

export default function UpdateCenter({ center, onUpdated, onCancel }) {
    const [detail, setDetail] = useState(initialDetail);
    const [config, setConfig] = useState(initialConfig);
    const [active, setActive] = useState(true);
    const [companyID, setCompanyID] = useState(1);
    const [createdBy, setCreatedBy] = useState(1);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!center) return;

        const centerDetail = center.centerDetail || {};
        const centerConfig = center.centerConfig || {};

        const facilities =
            Array.isArray(centerDetail.facilities) &&
            centerDetail.facilities.length > 0
                ? centerDetail.facilities
                      .map((item) =>
                          typeof item === "string" ? item : item.facilityType
                      )
                      .filter(Boolean)
                : typeof centerDetail.facilityType === "string" &&
                    centerDetail.facilityType
                  ? centerDetail.facilityType
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean)
                  : ["CR"];

        setDetail({
            ...initialDetail,
            ...centerDetail,
            facilityType: facilities,
            whatsAppNumber:
                centerDetail.whatsAppNumber ??
                centerDetail.whatsappNumber ??
                "",
        });

        setConfig({
            ...initialConfig,
            ...centerConfig,
        });

        setActive(toBoolean(center.active ?? 1));
        setCompanyID(Number(center.companyID ?? 1));
        setCreatedBy(Number(center.createdBy ?? 1));
    }, [center]);

    const handleDetailChange = (event) => {
        const { name, value, type } = event.target;

        setDetail((current) => ({
            ...current,
            [name]:
                type === "number"
                    ? value === ""
                        ? ""
                        : Number(value)
                    : value,
        }));
    };

    const handleConfigChange = (event) => {
        const { name, value, type } = event.target;

        setConfig((current) => ({
            ...current,
            [name]:
                type === "number"
                    ? value === ""
                        ? ""
                        : Number(value)
                    : value,
        }));
    };

    const handleFacilityChange = (selected) => {
        setDetail((current) => ({
            ...current,
            facilityType: selected,
        }));
    };

    const handleDetailToggle = (name, checked) => {
        setDetail((current) => ({
            ...current,
            [name]: checked ? 1 : 0,
        }));
    };

    const handleConfigToggle = (name, checked) => {
        setConfig((current) => ({
            ...current,
            [name]: checked ? 1 : 0,
        }));
    };

    const getToken = () => {
        try {
            const savedResponse = JSON.parse(
                localStorage.getItem("responseList") || "[]"
            );

            const user = Array.isArray(savedResponse)
                ? savedResponse[0]
                : savedResponse?.responseList?.[0] ?? savedResponse;

            return user?.token || null;
        } catch {
            return null;
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (loading) return;

        if (!center?.entityBusinessID) {
            toast.error("Center ID is missing");
            return;
        }

        if (!detail.facilityType?.length) {
            toast.error("Please select at least one facility type.");
            return;
        }

        const rawToken = getToken();

        if (!rawToken) {
            localStorage.removeItem("responseList");
            window.location.replace("/login");
            return;
        }

        const token = rawToken.startsWith("Bearer ")
            ? rawToken
            : `Bearer ${rawToken}`;

        const toNumber = (value) => {
            if (value === "" || value === null || value === undefined) {
                return 0;
            }

            const number = Number(value);
            return Number.isFinite(number) ? number : 0;
        };

        const centerDetail = {
            entityBusinessName: detail.entityBusinessName,
            address: detail.address,
            contactNumber: detail.contactNumber,
            contactEmail: detail.contactEmail,
            contactPerson: detail.contactPerson,
            stateID: toNumber(detail.stateID),
            districtID: toNumber(detail.districtID),
            facilityType: detail.facilityType[0],
            displayCenterName: detail.displayCenterName,
            whatsAppNumber: detail.whatsAppNumber,
            latitude: String(detail.latitude ?? ""),
            longitude: String(detail.longitude ?? ""),
            categoryID: toNumber(detail.categoryID),
            studyDescCategory: toNumber(detail.studyDescCategory),
            ignoreUploadCount: toNumber(detail.ignoreUploadCount),
            allowAutoAssign: toNumber(detail.allowAutoAssign),
            facilities: detail.facilityType.map((facilityType) => ({
                facilityType,
                imageUrl: 0,
            })),
        };

        const centerConfig = { ...config };

        Object.keys(centerConfig).forEach((key) => {
            if (!["paymentMethod", "billingCycle"].includes(key)) {
                centerConfig[key] = toNumber(centerConfig[key]);
            }
        });

        const payload = {
            centerMaster: {
                companyID,
                createdBy,
                centerDetail,
                centerConfig,
                entityBusinessID: Number(center.entityBusinessID),
                active: Number(active),
            },
        };

        setLoading(true);

        try {
            const response = await axios.post(API_URL, payload, {
                headers: {
                    Authorization: token,
                    "Content-Type": "application/json",
                },
            });

            const data = response.data;

            if (
                data?.success === false ||
                (data?.statusCode != null &&
                    Number(data.statusCode) >= 400) ||
                data?.responseStatus === false
            ) {
                throw new Error(
                    data?.errorMessage ||
                        data?.message ||
                        "Unable to update center."
                );
            }

            toast.success(data?.message || "Center updated successfully.");
            onUpdated?.(data);
        } catch (error) {
            console.error(
                "Update center error:",
                error.response?.data || error.message
            );

            if (error.response?.status === 401) {
                localStorage.removeItem("responseList");
                window.location.replace("/login");
                return;
            }

            toast.error(
                error.response?.data?.errorMessage ||
                    error.response?.data?.message ||
                    error.message ||
                    "Failed to update center."
            );
        } finally {
            setLoading(false);
        }
    };

    if (!center) return null;

    const detailToggleFields = toggleFields.filter(
        (field) => field.section === "detail"
    );

    const integrationToggleFields = toggleFields.filter(
        (field) => !field.section || field.section === "center"
    );

    return (
        <div className="mx-auto w-full min-w-0 max-w-7xl space-y-4">
            <div className="flex flex-col gap-3 border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                        Update Center
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Center ID: {center.entityBusinessID}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <Section title="Center Details">
                    {centerFields.map((field) => (
                        <Field
                            key={field.name}
                            field={field}
                            value={detail[field.name]}
                            onChange={handleDetailChange}
                        />
                    ))}

                    <FacilityTypeSelect
                        value={detail.facilityType}
                        onChange={handleFacilityChange}
                    />

                    <Field
                        field={{
                            name: "studyDescCategory",
                            label: "Study Description Category",
                            type: "number",
                        }}
                        value={detail.studyDescCategory}
                        onChange={handleDetailChange}
                    />

                    {detailToggleFields.map((field) => (
                        <ToggleField
                            key={field.name}
                            label={field.label}
                            checked={toBoolean(detail[field.name])}
                            onChange={(checked) =>
                                handleDetailToggle(field.name, checked)
                            }
                        />
                    ))}
                </Section>

                <Section title="Center Configuration">
                    {configFields.map((field) => (
                        <Field
                            key={field.name}
                            field={field}
                            value={config[field.name]}
                            onChange={handleConfigChange}
                        />
                    ))}

                    {[
                        "paymentMethod",
                        "billingCycle",
                        "priority",
                        "reportDateFormat",
                        "eskGroup",
                        "lookupType",
                        "studyDescCategory",
                    ].map((name) => (
                        <SelectField
                            key={name}
                            label={
                                {
                                    paymentMethod: "Payment Method",
                                    billingCycle: "Billing Cycle",
                                    priority: "Priority",
                                    reportDateFormat: "Report Date Format",
                                    eskGroup: "ESK Group",
                                    lookupType: "Lookup Type",
                                    studyDescCategory:
                                        "Study Description Category",
                                }[name]
                            }
                            name={name}
                            value={config[name]}
                            onChange={handleConfigChange}
                            options={selectOptions[name].map((option) => ({
                                ...option,
                                value: String(option.value),
                            }))}
                        />
                    ))}
                </Section>

                <Section title="Status & Integrations">
                    <ToggleField
                        label="Active Center"
                        checked={active}
                        onChange={setActive}
                    />

                    {integrationToggleFields
                        .filter((field) => field.name !== "active")
                        .map((field) => (
                            <ToggleField
                                key={field.name}
                                label={field.label}
                                checked={toBoolean(config[field.name])}
                                onChange={(checked) =>
                                    handleConfigToggle(field.name, checked)
                                }
                            />
                        ))}

                    <Field
                        field={{
                            name: "companyID",
                            label: "Company ID",
                            type: "number",
                        }}
                        value={companyID}
                        onChange={(event) =>
                            setCompanyID(Number(event.target.value))
                        }
                    />

                    <Field
                        field={{
                            name: "createdBy",
                            label: "Created By",
                            type: "number",
                        }}
                        value={createdBy}
                        onChange={(event) =>
                            setCreatedBy(Number(event.target.value))
                        }
                    />
                </Section>

                <div className="flex flex-col-reverse justify-end gap-2 border border-gray-200 bg-white p-4 sm:flex-row">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Updating..." : "Update Center"}
                    </button>
                </div>
            </form>
        </div>
    );
}
