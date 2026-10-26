import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
    FiUser,
    FiShield,
    FiUpload,
    FiFileText,
    FiX,
    FiCheck,
    FiLock,
} from "react-icons/fi";

const API_URL = "https://icareteleradiology-backend.vercel.app/api/users/create";

const initialForm = {
    entityBusinessName: "",
    loginID: "",
    email: "",
    mobileNumber: "",
    designation: "",
    qualification: "",
    roleID: "2",
    role: "2",
    offlinePassword: "",
    refreshTime: "5",
    isLocked: false,
};

const userFields = [
    { name: "entityBusinessName", label: "Full Name", required: true },
    { name: "loginID", label: "Login ID", required: true },
    { name: "email", label: "Email Address", type: "email", required: true },
    { name: "mobileNumber", label: "Mobile Number", type: "tel", required: true },
    { name: "designation", label: "Designation", required: true },
    { name: "qualification", label: "Qualification" },
    { name: "roleID", label: "Role ID", type: "number", required: true },
    { name: "role", label: "Role", type: "number", required: true },
    {
        name: "offlinePassword",
        label: "Password",
        type: "password",
        required: true,
    },
    {
        name: "refreshTime",
        label: "Refresh Time (minutes)",
        type: "number",
    },
];

function getToken() {
    try {
        const saved = JSON.parse(
            localStorage.getItem("responseList") || "null"
        );

        const user = Array.isArray(saved)
            ? saved[0]
            : saved?.responseList?.[0] ?? saved;

        const token = user?.token || localStorage.getItem("token");

        if (!token) return null;

        return token.startsWith("Bearer ")
            ? token
            : `Bearer ${token}`;
    } catch {
        const token = localStorage.getItem("token");

        if (!token) return null;

        return token.startsWith("Bearer ")
            ? token
            : `Bearer ${token}`;
    }
}

function Section({ title, description, icon: Icon, children }) {
    return (
        <section className="overflow-hidden border border-gray-200 bg-white">
            <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-4">
                <div className="flex h-10 w-10 items-center justify-center bg-blue-50 text-blue-600">
                    <Icon size={20} />
                </div>

                <div>
                    <h3 className="font-semibold text-gray-800">
                        {title}
                    </h3>
                    <p className="mt-0.5 text-sm text-gray-500">
                        {description}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 xl:grid-cols-3">
                {children}
            </div>
        </section>
    );
}

function Field({ field, value, onChange }) {
    return (
        <label className="block min-w-0">
            <span className="mb-2 block text-sm font-medium text-gray-700">
                {field.label}
                {field.required && (
                    <span className="ml-1 text-red-500">*</span>
                )}
            </span>

            <input
                type={field.type || "text"}
                name={field.name}
                value={value ?? ""}
                onChange={onChange}
                required={field.required}
                autoComplete="off"
                min={field.type === "number" ? 1 : undefined}
                className="h-10 w-full border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
        </label>
    );
}

function ToggleField({ label, description, checked, onChange }) {
    return (
        <div className="flex items-center justify-between gap-4 border border-gray-200 p-4">
            <div className="flex items-start gap-3">
                <FiLock className="mt-1 text-gray-500" size={18} />

                <div>
                    <p className="text-sm font-medium text-gray-800">
                        {label}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                        {description}
                    </p>
                </div>
            </div>

            <button
                type="button"
                role="switch"
                aria-checked={checked}
                aria-label={label}
                onClick={() => onChange(!checked)}
                className={`relative h-6 w-11 shrink-0 transition ${
                    checked ? "bg-blue-600" : "bg-gray-300"
                }`}
            >
                <span
                    className={`absolute top-1 h-4 w-4 bg-white transition-all ${
                        checked ? "left-6" : "left-1"
                    }`}
                />
            </button>
        </div>
    );
}

export default function CreateUser({ onSuccess, onClose }) {
    const [form, setForm] = useState({ ...initialForm });
    const [signatureFile, setSignatureFile] = useState(null);
    const [signaturePreview, setSignaturePreview] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!signatureFile) {
            setSignaturePreview("");
            return;
        }

        const previewUrl = URL.createObjectURL(signatureFile);
        setSignaturePreview(previewUrl);

        return () => URL.revokeObjectURL(previewUrl);
    }, [signatureFile]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleSignatureChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        const allowedTypes = [
            "image/png",
            "image/jpeg",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            toast.error("Upload a PNG, JPG, or WEBP signature image.");
            event.target.value = "";
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error("Signature image must be smaller than 2 MB.");
            event.target.value = "";
            return;
        }

        setSignatureFile(file);
    };

    const removeSignature = () => {
        setSignatureFile(null);

        const input = document.getElementById("signature-upload");

        if (input) {
            input.value = "";
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (loading) return;

        const requiredFields = [
            "entityBusinessName",
            "loginID",
            "email",
            "mobileNumber",
            "designation",
            "offlinePassword",
        ];

        const hasMissingFields = requiredFields.some(
            (name) => !String(form[name] ?? "").trim()
        );

        if (hasMissingFields) {
            toast.error("Please fill all required fields.");
            return;
        }

        if (!/^\d{10}$/.test(form.mobileNumber.trim())) {
            toast.error("Mobile number must be exactly 10 digits.");
            return;
        }

        const roleID = Number(form.roleID);
        const role = Number(form.role);
        const refreshTime = Number(form.refreshTime || 5);

        if (
            !Number.isInteger(roleID) ||
            roleID <= 0 ||
            !Number.isInteger(role) ||
            role <= 0
        ) {
            toast.error("Enter valid Role ID and Role.");
            return;
        }

        if (!Number.isFinite(refreshTime) || refreshTime <= 0) {
            toast.error("Enter a valid refresh time.");
            return;
        }

        const token = getToken();

        if (!token) {
            toast.error("Session expired. Please login again.");

            localStorage.removeItem("responseList");
            localStorage.removeItem("token");

            window.location.replace("/login");
            return;
        }

        const systemUser = {
            entityBusinessName: form.entityBusinessName.trim(),
            loginID: form.loginID.trim(),
            email: form.email.trim(),
            mobileNumber: form.mobileNumber.trim(),
            designation: form.designation.trim(),
            qualification: form.qualification.trim(),
            roleID,
            role,
            offlinePassword: form.offlinePassword,
            companyID: 1,
            createdBy: 1,
            createdIP: "127.0.0.1",
            isLocked: form.isLocked,
            refreshTime: String(refreshTime),

            // Do not send a fake temporary file reference.
            // Replace null with a real upload reference if the API provides one.
            signaturePath: null,
        };

        setLoading(true);

        try {
            const response = await axios.post(
                API_URL,
                { systemUser },
                {
                    headers: {
                        Authorization: token,
                        "Content-Type": "application/json",
                    },
                }
            );

            const result = response.data;

            const failed =
                result?.success === false ||
                result?.responseStatus === false ||
                result?.status === "ERROR" ||
                result?.status === "FAILED" ||
                (result?.statusCode != null &&
                    Number(result.statusCode) >= 400);

            if (failed) {
                throw new Error(
                    result?.errorMessage ||
                    result?.message ||
                    "Unable to create user."
                );
            }

            toast.success(
                result?.message || "User created successfully."
            );

            setForm({ ...initialForm });
            setSignatureFile(null);

            const input = document.getElementById("signature-upload");

            if (input) {
                input.value = "";
            }

            if (onSuccess) {
                await onSuccess(result);
            }
        } catch (error) {
            const apiData = error.response?.data;

            console.error(
                "Create user error:",
                apiData || error.message
            );

            if (error.response?.status === 401) {
                toast.error("Session expired. Please login again.");

                localStorage.removeItem("responseList");
                localStorage.removeItem("token");

                window.location.replace("/login");
                return;
            }

            toast.error(
                apiData?.errorMessage ||
                apiData?.message ||
                error.message ||
                "Unable to create user."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto w-full max-w-7xl space-y-5">
            

            <form onSubmit={handleSubmit} className="space-y-5">
                <Section
                    title="Personal Information"
                    description="Enter contact and professional details"
                    icon={FiUser}
                >
                    {userFields.slice(0, 6).map((field) => (
                        <Field
                            key={field.name}
                            field={field}
                            value={form[field.name]}
                            onChange={handleChange}
                        />
                    ))}
                </Section>

                <Section
                    title="Access & Security"
                    description="Configure login credentials and user role"
                    icon={FiShield}
                >
                    {userFields.slice(6).map((field) => (
                        <Field
                            key={field.name}
                            field={field}
                            value={form[field.name]}
                            onChange={handleChange}
                        />
                    ))}

                    <div className="sm:col-span-2 xl:col-span-3">
                        <ToggleField
                            label="Account Locked"
                            description="Create the account in a locked state."
                            checked={form.isLocked}
                            onChange={(checked) =>
                                setForm((current) => ({
                                    ...current,
                                    isLocked: checked,
                                }))
                            }
                        />
                    </div>
                </Section>

                <Section
                    title="Digital Signature"
                    description="Select an optional signature image"
                    icon={FiFileText}
                >
                    <div className="sm:col-span-2 xl:col-span-3">
                        <label
                            htmlFor="signature-upload"
                            className="flex min-h-36 cursor-pointer flex-col items-center justify-center border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center transition hover:border-blue-500 hover:bg-blue-50/50"
                        >
                            {signaturePreview ? (
                                <img
                                    src={signaturePreview}
                                    alt="Signature preview"
                                    className="mb-3 max-h-20 max-w-full object-contain"
                                />
                            ) : (
                                <span className="mb-3 flex h-12 w-12 items-center justify-center bg-blue-100 text-blue-600">
                                    <FiUpload size={23} />
                                </span>
                            )}

                            <span className="text-sm font-semibold text-gray-800">
                                {signatureFile
                                    ? signatureFile.name
                                    : "Click to select signature"}
                            </span>

                            <span className="mt-1 text-xs text-gray-500">
                                PNG, JPG or WEBP · Maximum 2 MB
                            </span>

                            <input
                                id="signature-upload"
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                onChange={handleSignatureChange}
                                className="hidden"
                            />
                        </label>

                        {signatureFile && (
                            <div className="mt-3 flex flex-wrap items-center gap-3">
                                <span className="text-xs text-gray-500">
                                    {(signatureFile.size / 1024).toFixed(1)} KB
                                </span>

                                <button
                                    type="button"
                                    onClick={removeSignature}
                                    className="inline-flex items-center gap-2 border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                    <FiX size={15} />
                                    Remove selected file
                                </button>
                            </div>
                        )}

                        <p className="mt-3 text-xs text-amber-700">
                            The selected image is only previewed in this form.
                            It is not uploaded by this JSON request.
                        </p>
                    </div>
                </Section>

                <div className="flex flex-col-reverse gap-3 border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-gray-500">
                        <span className="text-red-500">*</span> Required fields
                    </p>

                    <div className="flex flex-col-reverse gap-2 sm:flex-row">
                        {onClose && (
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center justify-center gap-2 bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? (
                                <>
                                    <span className="h-4 w-4 animate-spin border-2 border-white/40 border-t-white" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <FiCheck size={17} />
                                    Create User
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
