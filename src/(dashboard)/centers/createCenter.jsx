
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = "https://icareteleradiology-backend.vercel.app/api/centers/create";

const initialForm = {
    entityBusinessName: "",
    displayCenterName: "",
    address: "",
    contactNumber: "",
    contactEmail: "",
    contactPerson: "",
    whatsAppNumber: "",
    stateID: "",
    districtID: "",
    categoryID: "",
    facilityType: [],
    latitude: "",
    longitude: "",
    studyDescCategory: "",
    ignoreUploadCount: false,
    allowAutoAssign: false,
    verifyFlag: false,
    newMsWordVersion: false,
    duration: "",
    tatTrackFlag: false,
    tat: "",
    eskGroup: "",
    editFlag: false,
    gst: false,
    autoBillGeneration: false,
    paymentMethod: "",
    gracePeriod: "",
    maxAmountAllowed: "",
    billingCycle: "",
    reportDateFormat: "",
    validity: "",
    minAmountAllowed: "",
    prePaidBalance: "",
    limbsBillingApplicable: false,
    imageTransferBilling: false,
    lookupType: "",
    markForDuplicateNew: false,
    markForDuplicateRead: false,
    markForDuplicateFinal: false,
    whatsAppIntegration: false,
    emailIntegration: false,
    smsIntegration: false,
    billGeneration: false,
    priority: "",
    active: true,
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
    { name: "active", label: "Active Center" },
    { name: "allowAutoAssign", label: "Allow Auto Assign" },
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
    { name: "ignoreUploadCount", label: "Ignore Upload Count" },
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

function SelectField({
    label,
    name,
    value,
    options,
    onChange,
    required = false,
}) {
    return (
        <label className="block w-full min-w-0">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">
                {label}
                {required && <span className="text-red-500"> *</span>}
            </span>

            <select
                name={name}
                value={value ?? ""}
                onChange={onChange}
                required={required}
                className="block h-9.5 w-full min-w-0 appearance-none border border-gray-300 bg-white px-3 pr-9 text-sm text-gray-800 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                style={{
                    backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 10px center",
                    backgroundSize: "16px",
                }}
            >
                {options.map((option) => (
                    <option
                        key={String(option.value)}
                        value={option.value}
                    >
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
                className={`relative inline-flex h-6 w-11 shrink-0 items-center transition-colors ${checked ? "bg-blue-600" : "bg-gray-300"
                    }`}
            >
                <span
                    className={`inline-block h-4 w-4 transform bg-white transition-transform ${checked ? "translate-x-6" : "translate-x-1"
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

export default function CreateCenter({ onCreated, onCancel }) {
    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        const { name, value, type } = event.target;

        setForm((current) => ({
            ...current,
            [name]:
                type === "number"
                    ? value === ""
                        ? ""
                        : Number(value)
                    : value,
        }));
    };

    const handleToggle = (name, checked) => {
        setForm((current) => ({
            ...current,
            [name]: checked,
        }));
    };

    const resetForm = () => {
        setForm({
            ...initialForm,
            facilityType: [],
        });

        toast.success("Form reset successfully.");
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

        if (!form.facilityType.length) {
            toast.error("Please select at least one facility type.");
            return;
        }

        setLoading(true);

        try {
            const token = getToken();

            if (!token) {
                throw new Error("Token not found. Please login again.");
            }

            const primaryFacility = form.facilityType[0];

            const payload = {
                centerMaster: {
                    companyID: 1,
                    createdBy: 1,

                    centerDetail: {
                        entityBusinessName: form.entityBusinessName,
                        address: form.address,
                        contactNumber: form.contactNumber,
                        contactEmail: form.contactEmail,
                        contactPerson: form.contactPerson,
                        stateID: Number(form.stateID),
                        districtID: Number(form.districtID),
                        facilityType: primaryFacility,
                        displayCenterName: form.displayCenterName,
                        whatsAppNumber: form.whatsAppNumber,
                        latitude: form.latitude,
                        longitude: form.longitude,
                        categoryID: Number(form.categoryID),
                        studyDescCategory: Number(form.studyDescCategory || 0),
                        ignoreUploadCount: Number(form.ignoreUploadCount),
                        allowAutoAssign: Number(form.allowAutoAssign),
                        facilities: form.facilityType.map((type) => ({
                            facilityType: type,
                            imageUrl: 0,
                        })),
                    },

                    centerConfig: {
                        verifyFlag: Number(form.verifyFlag),
                        newMsWordVersion: Number(form.newMsWordVersion),
                        duration: Number(form.duration || 0),
                        tatTrackFlag: Number(form.tatTrackFlag),
                        tat: Number(form.tat || 0),
                        eskGroup: Number(form.eskGroup || 0),
                        editFlag: Number(form.editFlag),
                        gst: Number(form.gst),
                        autoBillGeneration: Number(form.autoBillGeneration),
                        paymentMethod: form.paymentMethod,
                        gracePeriod: Number(form.gracePeriod || 0),
                        maxAmountAllowed: Number(form.maxAmountAllowed || 0),
                        billingCycle: form.billingCycle,
                        reportDateFormat: Number(form.reportDateFormat || 0),
                        validity: Number(form.validity || 0),
                        minAmountAllowed: Number(form.minAmountAllowed || 0),
                        prePaidBalance: Number(form.prePaidBalance || 0),
                        limbsBillingApplicable: Number(form.limbsBillingApplicable),
                        imageTransferBilling: Number(form.imageTransferBilling),
                        lookupType: Number(form.lookupType || 0),
                        markForDuplicateNew: Number(form.markForDuplicateNew),
                        markForDuplicateRead: Number(form.markForDuplicateRead),
                        markForDuplicateFinal: Number(form.markForDuplicateFinal),
                        whatsAppIntegration: Number(form.whatsAppIntegration),
                        emailIntegration: Number(form.emailIntegration),
                        smsIntegration: Number(form.smsIntegration),
                        billGeneration: Number(form.billGeneration),
                        studyDescCategory: Number(form.studyDescCategory || 0),
                        ignoreUploadCount: Number(form.ignoreUploadCount),
                        allowAutoAssign: Number(form.allowAutoAssign),
                        priority: Number(form.priority || 0),
                    },

                    active: Number(form.active),
                },
            };

            console.log("Create Center Payload:", payload);

            const response = await axios.post(API_URL, payload, {
                headers: {
                    Authorization: token.startsWith("Bearer ")
                        ? token
                        : `Bearer ${token}`,
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
                    "Unable to create center."
                );
            }

            toast.success(data?.message || "Center created successfully.");

            if (onCreated) {
                onCreated(data);
            } else {
                setForm({
                    ...initialForm,
                    facilityType: [],
                });
            }
        } catch (err) {
            console.error(
                "Create center error:",
                err.response?.data || err.message
            );

            const apiData = err.response?.data;

            toast.error(
                apiData?.errorMessage ||
                apiData?.message ||
                (Array.isArray(apiData?.errors)
                    ? apiData.errors.join(", ")
                    : null) ||
                err.message ||
                "Unable to create center."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto w-full min-w-0 max-w-7xl space-y-4">
            <div className="flex flex-col gap-3 border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                        Create Center
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Add a new center and configure its services
                    </p>
                </div>

                <button
                    type="button"
                    onClick={resetForm}
                    disabled={loading}
                    className="border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
                >
                    Reset Form
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <Section title="Center Details">
                    {centerFields.map((field) => (
                        <Field
                            key={field.name}
                            field={field}
                            value={form[field.name]}
                            onChange={handleChange}
                        />
                    ))}

                    <FacilityTypeSelect
                        value={form.facilityType}
                        onChange={(selected) =>
                            setForm((current) => ({
                                ...current,
                                facilityType: selected,
                            }))
                        }
                    />
                </Section>

                <Section title="Center Configuration">
                    {configFields.map((field) => (
                        <Field
                            key={field.name}
                            field={field}
                            value={form[field.name]}
                            onChange={handleChange}
                        />
                    ))}

                    <SelectField
                        label="Payment Method"
                        name="paymentMethod"
                        value={form.paymentMethod}
                        onChange={handleChange}
                        options={[
                            { value: "", label: "Select Payment Method" },
                            { value: "Bank Transfer", label: "Bank Transfer" },
                            { value: "Cash", label: "Cash" },
                            { value: "Online", label: "Online" },
                        ]}
                    />

                    <SelectField
                        label="Billing Cycle"
                        name="billingCycle"
                        value={form.billingCycle}
                        onChange={handleChange}
                        options={[
                            { value: "", label: "Select Billing Cycle" },
                            { value: "Monthly", label: "Monthly" },
                            { value: "Weekly", label: "Weekly" },
                            { value: "Daily", label: "Daily" },
                            { value: "Yearly", label: "Yearly" },
                        ]}
                    />

                    <SelectField
                        label="Priority"
                        name="priority"
                        value={form.priority}
                        onChange={handleChange}
                        options={[
                            { value: "", label: "Select Priority" },
                            { value: "1", label: "High" },
                            { value: "2", label: "Medium" },
                            { value: "3", label: "Low" },
                        ]}
                    />

                    <SelectField
                        label="Report Date Format"
                        name="reportDateFormat"
                        value={form.reportDateFormat}
                        onChange={handleChange}
                        options={[
                            { value: "", label: "Select Report Date Format" },
                            { value: "1", label: "Format 1" },
                            { value: "2", label: "Format 2" },
                        ]}
                    />

                    <SelectField
                        label="ESK Group"
                        name="eskGroup"
                        value={form.eskGroup}
                        onChange={handleChange}
                        options={[
                            { value: "", label: "Select ESK Group" },
                            { value: "0", label: "None (0)" },
                            { value: "1", label: "Group 1" },
                        ]}
                    />

                    <SelectField
                        label="Lookup Type"
                        name="lookupType"
                        value={form.lookupType}
                        onChange={handleChange}
                        options={[
                            { value: "", label: "Select Lookup Type" },
                            { value: "0", label: "Default (0)" },
                            { value: "1", label: "Type 1" },
                        ]}
                    />

                    <SelectField
                        label="Study Description Category"
                        name="studyDescCategory"
                        value={form.studyDescCategory}
                        onChange={handleChange}
                        options={[
                            { value: "", label: "Select Study Description" },
                            { value: "0", label: "Default (0)" },
                            { value: "1", label: "Category 1" },
                        ]}
                    />
                </Section>

                <Section title="Status & Integrations">
                    {toggleFields.map((field) => (
                        <ToggleField
                            key={field.name}
                            label={field.label}
                            checked={form[field.name]}
                            onChange={(checked) =>
                                handleToggle(field.name, checked)
                            }
                        />
                    ))}
                </Section>

                <div className="flex flex-col-reverse justify-end gap-2 border border-gray-200 bg-white p-4 sm:flex-row">
                    <button
                        type="button"
                        onClick={() => {
                            if (onCancel) {
                                onCancel();
                            } else {
                                resetForm();
                            }
                        }}
                        disabled={loading}
                        className="border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={loading || form.facilityType.length === 0}
                        className="bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Creating..." : "Create Center"}
                    </button>
                </div>
            </form>
        </div>
    );
}
