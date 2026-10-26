import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
    FiEdit2,
    FiEye,
    FiTrash2,
    FiRefreshCw,
    FiPlus,
    FiX,
    FiCheck,
    FiChevronLeft,
    FiChevronRight,
    FiColumns,
} from "react-icons/fi";

import CreateCenter from "./createCenter";
import UpdateCenter from "./updateCenter";
import ViewCenter from "./viewCenter";

const API_URL = "https://icareteleradiology-backend.vercel.app/api/centers";
const ACTIVATE_API_URL = `${API_URL}/activate`;
const DEACTIVATE_API_URL = `${API_URL}/deactivate`;

const INITIAL_COLUMN_WIDTHS = {
    action: 140,
    id: 100,
    displayName: 200,
    businessName: 220,
    category: 130,
    facility: 120,
    priority: 100,
    tat: 100,
    contactPerson: 160,
    email: 200,
    balance: 140,
    status: 100,
};

const MIN_COLUMN_WIDTH = 80;
const MAX_COLUMN_WIDTH = 600;

export default function AllCenters() {
    const [centers, setCenters] = useState([]);
    const [loading, setLoading] = useState(false);

    const [deletingId, setDeletingId] = useState(null);
    const [activatingId, setActivatingId] = useState(null);

    const [sortKey, setSortKey] = useState("id");
    const [sortOrder, setSortOrder] = useState("asc");

    const [filters, setFilters] = useState({});

    const [showColumnMenu, setShowColumnMenu] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState({});
    const columnPopupRef = useRef(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showUpdateForm, setShowUpdateForm] = useState(false);
    const [showViewForm, setShowViewForm] = useState(false);

    const [selectedCenter, setSelectedCenter] = useState(null);
    const [viewCenter, setViewCenter] = useState(null);

    const [columnWidths, setColumnWidths] = useState(
        INITIAL_COLUMN_WIDTHS
    );
    const [resizeState, setResizeState] = useState(null);

    // --------------------------------------------------
    // COLUMN DEFINITIONS
    // --------------------------------------------------

    const columnDefinitions = useMemo(
        () => [
            { key: "action", label: "Actions" },
            { key: "id", label: "Center ID" },
            { key: "displayName", label: "Display Name" },
            { key: "businessName", label: "Business Entity Name" },
            { key: "category", label: "Category" },
            { key: "facility", label: "Facility" },
            { key: "priority", label: "Priority" },
            { key: "tat", label: "TAT (Min)" },
            { key: "contactPerson", label: "Contact Person" },
            { key: "email", label: "Email ID" },
            { key: "balance", label: "Balance" },
            { key: "status", label: "Status" },
        ],
        []
    );

    const isColumnVisible = useCallback(
        (key) => {
            if (key === "action") return true;
            return visibleColumns[key] !== false;
        },
        [visibleColumns]
    );

    const toggleColumn = (key) => {
        if (key === "action") return;

        const currentlyVisible = isColumnVisible(key);

        if (currentlyVisible) {
            const visibleCount = columnDefinitions.filter((column) =>
                isColumnVisible(column.key)
            ).length;

            if (visibleCount <= 1) {
                toast.error(
                    "At least one column must remain visible."
                );
                return;
            }
        }

        setVisibleColumns((current) => ({
            ...current,
            [key]: !currentlyVisible,
        }));
    };

    const showAllColumns = () => {
        setVisibleColumns({});
        toast.success("All columns are visible.");
    };

    const hideAllColumns = () => {
        const nextVisibility = {};

        columnDefinitions.forEach((column) => {
            nextVisibility[column.key] = column.key === "action";
        });

        setVisibleColumns(nextVisibility);
        toast.success("All columns hidden except Actions.");
    };

    useEffect(() => {
        if (!showColumnMenu) return;

        const handleOutsideClick = (event) => {
            if (
                columnPopupRef.current &&
                !columnPopupRef.current.contains(event.target)
            ) {
                setShowColumnMenu(false);
            }
        };

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                setShowColumnMenu(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );
            document.removeEventListener("keydown", handleEscape);
        };
    }, [showColumnMenu]);

    // --------------------------------------------------
    // AUTHENTICATION
    // --------------------------------------------------

    const getToken = () => {
        try {
            const responseList = JSON.parse(
                localStorage.getItem("responseList") || "[]"
            );

            return responseList[0]?.token || null;
        } catch {
            return null;
        }
    };

    const getAuthHeaders = () => {
        const token = getToken();

        if (!token) {
            toast.error("Session expired. Please login again.");
            localStorage.removeItem("responseList");
            window.location.replace("/login");
            return null;
        }

        return {
            Authorization: token.startsWith("Bearer ")
                ? token
                : `Bearer ${token}`,
            "Content-Type": "application/json",
        };
    };

    // --------------------------------------------------
    // FETCH CENTERS
    // --------------------------------------------------

    const getAllCenters = useCallback(async (showMessage = false) => {
        setLoading(true);

        try {
            const headers = getAuthHeaders();

            if (!headers) return null;

            const response = await axios.post(
                API_URL,
                {
                    genericRequestEntity: {
                        companyID: 1,
                        dropDown: false,
                        detailFlag: false,
                    },
                },
                { headers }
            );

            const data = response.data;

            if (
                data?.success === false ||
                (data?.statusCode &&
                    Number(data.statusCode) >= 400)
            ) {
                throw new Error(
                    data?.errorMessage ||
                    data?.message ||
                    "Unable to fetch centers."
                );
            }

            const centerList = Array.isArray(data?.responseList)
                ? data.responseList
                : [];

            setCenters(centerList);

            if (showMessage) {
                toast.success("Centers refreshed successfully.");
            }

            return centerList;
        } catch (err) {
            console.error(
                "Get centers error:",
                err.response?.data || err.message
            );

            if (err.response?.status === 401) {
                toast.error("Session expired. Please login again.");
                localStorage.removeItem("responseList");
                window.location.replace("/login");
                return null;
            }

            toast.error(
                err.response?.data?.errorMessage ||
                err.response?.data?.message ||
                err.message ||
                "Unable to fetch centers."
            );

            setCenters([]);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        getAllCenters();
    }, [getAllCenters]);

    // --------------------------------------------------
    // COLUMN RESIZING
    // --------------------------------------------------

    const handleResizeStart = (event, columnKey) => {
        event.preventDefault();
        event.stopPropagation();

        setResizeState({
            key: columnKey,
            startX: event.clientX,
            startWidth:
                columnWidths[columnKey] ||
                INITIAL_COLUMN_WIDTHS[columnKey] ||
                120,
        });
    };

    useEffect(() => {
        if (!resizeState) return;

        const previousUserSelect = document.body.style.userSelect;
        const previousCursor = document.body.style.cursor;

        document.body.style.userSelect = "none";
        document.body.style.cursor = "col-resize";

        const handleMouseMove = (event) => {
            const difference = event.clientX - resizeState.startX;

            const newWidth = Math.min(
                MAX_COLUMN_WIDTH,
                Math.max(
                    MIN_COLUMN_WIDTH,
                    resizeState.startWidth + difference
                )
            );

            setColumnWidths((current) => ({
                ...current,
                [resizeState.key]: newWidth,
            }));
        };

        const handleMouseUp = () => setResizeState(null);

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);

            document.body.style.userSelect = previousUserSelect;
            document.body.style.cursor = previousCursor;
        };
    }, [resizeState]);

    // --------------------------------------------------
    // VIEW / EDIT
    // --------------------------------------------------

    const handleViewCenter = (center) => {
        setViewCenter(center);
        setShowViewForm(true);
    };

    const closeViewCenter = () => {
        setShowViewForm(false);
        setViewCenter(null);
    };

    const handleEditCenter = (center) => {
        setSelectedCenter(center);
        setShowUpdateForm(true);
    };

    const closeUpdateForm = () => {
        setShowUpdateForm(false);
        setSelectedCenter(null);
    };

    const handleCenterUpdated = async () => {
        closeUpdateForm();
        closeViewCenter();
        await getAllCenters();
    };

    // --------------------------------------------------
    // ACTIVATE / DEACTIVATE
    // --------------------------------------------------

    const checkApiError = (data, action) => {
        if (
            data?.success === false ||
            (data?.statusCode &&
                Number(data.statusCode) >= 400) ||
            data?.responseStatus === false ||
            data?.status === "ERROR" ||
            data?.status === "FAILED"
        ) {
            throw new Error(
                data?.errorMessage ||
                data?.message ||
                `Unable to ${action} center.`
            );
        }
    };

    const confirmCenterStatus = (centerName, action) => {
        const isActivate = action === "activate";
        const actionText = isActivate ? "Activate" : "Deactivate";

        return new Promise((resolve) => {
            let resolved = false;
            let toastId;

            const finish = (result) => {
                if (resolved) return;

                resolved = true;
                toast.dismiss(toastId);
                resolve(result);
            };

            toastId = toast(
                () => (
                    <div className="w-72">
                        <p className="mb-2 text-sm font-semibold text-gray-100">
                            Confirm {actionText}
                        </p>

                        <p className="mb-4 text-sm text-gray-300">
                            Are you sure you want to{" "}
                            {action.toLowerCase()}{" "}
                            <span className="font-semibold">
                                "{centerName}"
                            </span>
                            ?
                        </p>

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => finish(false)}
                                className="border border-gray-300 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-100"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={() => finish(true)}
                                className={`px-3 py-1.5 text-sm text-white ${isActivate
                                    ? "bg-green-600 hover:bg-green-700"
                                    : "bg-red-600 hover:bg-red-700"
                                    }`}
                            >
                                {actionText}
                            </button>
                        </div>
                    </div>
                ),
                { duration: Infinity }
            );
        });
    };

    const handleCenterStatus = async (center, action) => {
        const centerId = center?.entityBusinessID;

        if (
            centerId === undefined ||
            centerId === null ||
            centerId === "" ||
            !Number.isFinite(Number(centerId))
        ) {
            toast.error("Center ID is missing or invalid.");
            console.error("Invalid center object:", center);
            return false;
        }

        if (deletingId !== null || activatingId !== null) {
            toast.error(
                "Please wait. Another request is in progress."
            );
            return false;
        }

        const isActivate = action === "activate";

        const centerName =
            center?.centerDetail?.displayCenterName ||
            center?.centerDetail?.entityBusinessName ||
            `Center ${centerId}`;

        const confirmed = await confirmCenterStatus(
            centerName,
            action
        );

        if (!confirmed) return false;

        if (isActivate) {
            setActivatingId(centerId);
        } else {
            setDeletingId(centerId);
        }

        try {
            const headers = getAuthHeaders();

            if (!headers) return false;

            const payload = {
                genericManipulationRequestEntity: {
                    companyID: 1,
                    createdBy: 1,
                    entityBusinessID: Number(centerId),
                },
            };

            const response = await axios.post(
                isActivate ? ACTIVATE_API_URL : DEACTIVATE_API_URL,
                payload,
                { headers }
            );

            checkApiError(response.data, action);

            toast.success(
                `${centerName} ${isActivate ? "activated" : "deactivated"
                } successfully.`
            );

            if (
                String(viewCenter?.entityBusinessID) ===
                String(centerId)
            ) {
                closeViewCenter();
            }

            const refreshedCenters = await getAllCenters();

            if (refreshedCenters === null) {
                toast.error(
                    "Status updated, but refreshing centers failed."
                );
            }

            return true;
        } catch (err) {
            console.error(
                `${action} center error:`,
                err.response?.data || err.message
            );

            if (err.response?.status === 401) {
                toast.error("Session expired. Please login again.");
                localStorage.removeItem("responseList");
                window.location.replace("/login");
                return false;
            }

            if (err.response?.status === 404) {
                toast.error(
                    "API route not found. Check your backend route."
                );
                return false;
            }

            toast.error(
                err.response?.data?.errorMessage ||
                err.response?.data?.message ||
                err.message ||
                `Unable to ${action} center.`
            );

            return false;
        } finally {
            setDeletingId(null);
            setActivatingId(null);
        }
    };

    const handleDeleteCenter = (center) =>
        handleCenterStatus(center, "deactivate");

    const handleActivateCenter = (center) =>
        handleCenterStatus(center, "activate");

    // --------------------------------------------------
    // FORMAT BALANCE
    // --------------------------------------------------

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

    // --------------------------------------------------
    // TABLE COLUMNS
    // --------------------------------------------------

    const columns = useMemo(
        () => [
            {
                key: "action",
                label: "Actions",
                value: () => "View Edit Activate Deactivate",
                render: (item) => {
                    const id = item.entityBusinessID;
                    const isDeleting =
                        String(deletingId) === String(id);
                    const isActivating =
                        String(activatingId) === String(id);

                    const isBusy =
                        isDeleting ||
                        isActivating ||
                        deletingId !== null ||
                        activatingId !== null;

                    const isActive = Number(item.active) === 1;

                    return (
                        <div className="flex items-center gap-2 whitespace-nowrap">
                            <button
                                type="button"
                                onClick={() => handleViewCenter(item)}
                                title="View center"
                                aria-label={`View center ${id}`}
                                className="inline-flex h-8 w-8 shrink-0 items-center justify-center border border-gray-300 text-gray-600 hover:bg-gray-100"
                            >
                                <FiEye size={16} />
                            </button>

                            <button
                                type="button"
                                onClick={() => handleEditCenter(item)}
                                title="Edit center"
                                aria-label={`Edit center ${id}`}
                                className="inline-flex h-8 w-8 shrink-0 items-center justify-center border border-blue-200 text-blue-600 hover:bg-blue-50"
                            >
                                <FiEdit2 size={16} />
                            </button>

                            {isActive ? (
                                <button
                                    type="button"
                                    onClick={() => handleDeleteCenter(item)}
                                    disabled={isBusy}
                                    title="Deactivate center"
                                    aria-label={`Deactivate center ${id}`}
                                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-40"
                                >
                                    {isDeleting ? (
                                        <FiRefreshCw
                                            className="animate-spin"
                                            size={16}
                                        />
                                    ) : (
                                        <FiTrash2 size={16} />
                                    )}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => handleActivateCenter(item)}
                                    disabled={isBusy}
                                    title="Activate center"
                                    aria-label={`Activate center ${id}`}
                                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center border border-green-200 text-green-600 hover:bg-green-50 disabled:opacity-40"
                                >
                                    {isActivating ? (
                                        <FiRefreshCw
                                            className="animate-spin"
                                            size={16}
                                        />
                                    ) : (
                                        <FiCheck size={16} />
                                    )}
                                </button>
                            )}
                        </div>
                    );
                },
            },
            {
                key: "id",
                label: "Center ID",
                value: (item) => item?.entityBusinessID,
            },
            {
                key: "displayName",
                label: "Display Name",
                value: (item) =>
                    item?.centerDetail?.displayCenterName,
            },
            {
                key: "businessName",
                label: "Business Entity Name",
                value: (item) =>
                    item?.centerDetail?.entityBusinessName,
            },
            {
                key: "category",
                label: "Category",
                value: (item) => item?.centerDetail?.categoryName,
            },
            {
                key: "facility",
                label: "Facility",
                value: (item) =>
                    item?.centerDetail?.facilities
                        ?.map((facility) => facility.facilityType)
                        .filter(Boolean)
                        .join(", ") || "-",
            },
            {
                key: "priority",
                label: "Priority",
                value: (item) => item?.centerConfig?.priorityName,
            },
            {
                key: "tat",
                label: "TAT (Min)",
                value: (item) => item?.centerConfig?.tat,
            },
            {
                key: "contactPerson",
                label: "Contact Person",
                value: (item) =>
                    item?.centerDetail?.contactPerson,
            },
            {
                key: "email",
                label: "Email ID",
                value: (item) => item?.centerDetail?.contactEmail,
            },
            {
                key: "balance",
                label: "Balance",
                value: (item) =>
                    item?.centerConfig?.prePaidBalance,
                render: (item) =>
                    formatBalance(item?.centerConfig?.prePaidBalance),
            },
            {
                key: "status",
                label: "Status",
                value: (item) =>
                    Number(item?.active) === 1 ? "Active" : "Inactive",
                render: (item) => (
                    <span
                        className={`whitespace-nowrap border px-2 py-1 text-sm font-medium ${Number(item?.active) === 1
                            ? "border-green-200 bg-green-50 text-green-700"
                            : "border-gray-200 bg-gray-50 text-gray-600"
                            }`}
                    >
                        {Number(item?.active) === 1
                            ? "Active"
                            : "Inactive"}
                    </span>
                ),
            },
        ],
        [deletingId, activatingId, viewCenter]
    );

    const getColumnValue = useCallback((column, item) => {
        if (typeof column?.value !== "function") return "";

        try {
            return column.value(item) ?? "";
        } catch (error) {
            console.error(
                `Error reading column "${column?.key}":`,
                error
            );
            return "";
        }
    }, []);

    const getColumnCell = useCallback(
        (column, item) => {
            if (typeof column?.render === "function") {
                return column.render(item);
            }

            return getColumnValue(column, item);
        },
        [getColumnValue]
    );

    // --------------------------------------------------
    // FILTERING AND SORTING
    // --------------------------------------------------

    const filteredCenters = useMemo(() => {
        let result = centers.filter((item) =>
            columns.every((column) => {
                const searchText = (filters[column.key] || "")
                    .trim()
                    .toLowerCase();

                if (!searchText) return true;

                const value = getColumnValue(column, item);

                return String(value ?? "-")
                    .toLowerCase()
                    .includes(searchText);
            })
        );

        result = [...result].sort((a, b) => {
            const column = columns.find(
                (col) => col.key === sortKey
            );

            if (!column) return 0;

            const first = getColumnValue(column, a);
            const second = getColumnValue(column, b);

            let comparison;

            if (
                first !== "" &&
                second !== "" &&
                first != null &&
                second != null &&
                Number.isFinite(Number(first)) &&
                Number.isFinite(Number(second))
            ) {
                comparison = Number(first) - Number(second);
            } else {
                comparison = String(first ?? "").localeCompare(
                    String(second ?? ""),
                    undefined,
                    {
                        numeric: true,
                        sensitivity: "base",
                    }
                );
            }

            return sortOrder === "asc"
                ? comparison
                : -comparison;
        });

        return result;
    }, [
        centers,
        columns,
        filters,
        sortKey,
        sortOrder,
        getColumnValue,
    ]);

    const displayedColumns = useMemo(
        () =>
            columns.filter((column) =>
                isColumnVisible(column.key)
            ),
        [columns, isColumnVisible]
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [filters, pageSize]);

    // --------------------------------------------------
    // PAGINATION
    // --------------------------------------------------

    const totalEntries = filteredCenters.length;
    const totalPages = Math.max(
        1,
        Math.ceil(totalEntries / pageSize)
    );

    useEffect(() => {
        setCurrentPage((page) => Math.min(page, totalPages));
    }, [totalPages]);

    const startIndex =
        totalEntries === 0 ? 0 : (currentPage - 1) * pageSize;

    const endIndex = Math.min(
        startIndex + pageSize,
        totalEntries
    );

    const paginatedCenters = useMemo(
        () => filteredCenters.slice(startIndex, endIndex),
        [filteredCenters, startIndex, endIndex]
    );

    const handleSort = (key) => {
        if (sortKey === key) {
            setSortOrder((current) =>
                current === "asc" ? "desc" : "asc"
            );
        } else {
            setSortKey(key);
            setSortOrder("asc");
        }

        setCurrentPage(1);
    };

    const tableWidth = displayedColumns.reduce(
        (total, column) =>
            total + (columnWidths[column.key] || 120),
        0
    );

    const renderCellText = (value) => (
        <div
            className="block w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap"
            title={String(value ?? "-")}
        >
            {value ?? "-"}
        </div>
    );

    const pageNumbers = Array.from(
        { length: totalPages },
        (_, index) => index + 1
    ).filter(
        (page) =>
            page === 1 ||
            page === totalPages ||
            Math.abs(page - currentPage) <= 2
    );

    // --------------------------------------------------
    // UI
    // --------------------------------------------------

    return (
        <div className="w-full min-w-0 max-w-full space-y-2">
            {/* Header */}
            <div className="flex min-w-0 flex-col gap-3 border border-gray-200 bg-white px-3 py-2 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-4">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                        All Centers
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage and view all registered centers
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => getAllCenters(true)}
                        disabled={loading}
                        className="inline-flex items-center gap-2 border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                    >
                        <FiRefreshCw
                            className={loading ? "animate-spin" : ""}
                        />
                        Refresh
                    </button>

                    <button
                        type="button"
                        onClick={() => setShowCreateForm(true)}
                        className="inline-flex items-center gap-2 bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                    >
                        <FiPlus size={17} />
                        Add Center
                    </button>
                </div>
            </div>

            <div className="px-3 space-y-2">
                {/* Show / Hide Columns */}
                <div className="flex items-center justify-between gap-1">
                    <div className="relative" ref={columnPopupRef}>
                        <button
                            type="button"
                            onClick={() =>
                                setShowColumnMenu((previous) => !previous)
                            }
                            aria-expanded={showColumnMenu}
                            className="inline-flex items-center gap-2 border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            <FiColumns size={17} />
                            Show / Hide Columns
                        </button>

                        {showColumnMenu && (
                            <div className="absolute left-0 top-full z-40 mt-2 w-80 max-w-[calc(100vw-2rem)] border border-gray-200 bg-white shadow-xl">
                                <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-800">
                                            Column Visibility
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Choose which columns to display
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setShowColumnMenu(false)}
                                        aria-label="Close column popup"
                                        className="p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                                    >
                                        <FiX size={18} />
                                    </button>
                                </div>

                                <div className="flex gap-2 border-b border-gray-200 p-3">
                                    <button
                                        type="button"
                                        onClick={showAllColumns}
                                        className="flex-1 border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
                                    >
                                        Show All
                                    </button>

                                    <button
                                        type="button"
                                        onClick={hideAllColumns}
                                        className="flex-1 border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Hide All
                                    </button>
                                </div>

                                <div className="max-h-80 space-y-1 overflow-y-auto p-3">
                                    {columnDefinitions.map((column) => (
                                        <label
                                            key={column.key}
                                            className={`flex items-center gap-3 px-3 py-2 text-sm ${column.key === "action"
                                                ? "cursor-not-allowed bg-gray-50 text-gray-400"
                                                : "cursor-pointer text-gray-700 hover:bg-gray-50"
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isColumnVisible(column.key)}
                                                disabled={column.key === "action"}
                                                onChange={() =>
                                                    toggleColumn(column.key)
                                                }
                                                className="h-4 w-4 shrink-0 accent-blue-600"
                                            />

                                            <span>{column.label}</span>

                                            {column.key === "action" && (
                                                <span className="ml-auto text-sm">
                                                    Fixed
                                                </span>
                                            )}
                                        </label>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
                                    <span className="text-sm text-gray-500">
                                        {displayedColumns.length} of{" "}
                                        {columns.length} visible
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() => setShowColumnMenu(false)}
                                        className="bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                    >
                                        Done
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <span className="text-sm text-gray-500">
                        {displayedColumns.length} columns visible
                    </span>
                </div>

                {/* Table: fills container width, scrolls when columns exceed it */}
                <div className="w-full min-w-0 border border-gray-200 bg-white shadow-sm">
                    <div className="max-h-[calc(100vh-280px)] min-h-64 w-full overflow-auto overscroll-contain">
                        <table
                            className="w-full table-fixed border-collapse text-sm"
                            style={{ width: "100%", minWidth: `${Math.max(tableWidth, 1)}px`, }}
                        >
                            <colgroup>
                                {displayedColumns.map((column) => (
                                    <col
                                        key={column.key}
                                        style={{ width: `${columnWidths[column.key] || 120}px`, }}
                                    />
                                ))}
                            </colgroup>

                            <thead className="sticky top-0 z-10 bg-gray-100 text-gray-700">
                                <tr>
                                    {displayedColumns.map((column) => (
                                        <th
                                            key={column.key}
                                            className="relative border-b border-gray-200 px-3 py-2 text-left sm:px-4"
                                        >
                                            <div className="flex min-w-0 items-center gap-2 pr-2">
                                                <span className="truncate font-semibold">
                                                    {column.label}
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleSort(column.key)
                                                    }
                                                    title={`Sort ${column.label}`}
                                                    className="shrink-0 px-1 text-gray-500 hover:bg-gray-200 hover:text-gray-900"
                                                >
                                                    {sortKey === column.key
                                                        ? sortOrder === "asc"
                                                            ? "↑"
                                                            : "↓"
                                                        : "↕"}
                                                </button>
                                            </div>

                                            <div
                                                role="separator"
                                                aria-orientation="vertical"
                                                aria-label={`Resize ${column.label} column`}
                                                title="Drag to resize; double-click to reset"
                                                onMouseDown={(event) =>
                                                    handleResizeStart(
                                                        event,
                                                        column.key
                                                    )
                                                }
                                                onDoubleClick={() =>
                                                    setColumnWidths((current) => ({
                                                        ...current,
                                                        [column.key]:
                                                            INITIAL_COLUMN_WIDTHS[
                                                            column.key
                                                            ],
                                                    }))
                                                }
                                                className={`absolute right-0 top-0 z-20 h-full w-2 cursor-col-resize touch-none select-none ${resizeState?.key === column.key
                                                    ? "bg-blue-500"
                                                    : "hover:bg-blue-400"
                                                    }`}
                                            />
                                        </th>
                                    ))}
                                </tr>

                                <tr className="bg-white">
                                    {displayedColumns.map((column) => (
                                        <th
                                            key={column.key}
                                            className="border-b border-gray-200 p-2"
                                        >
                                            <input
                                                type="text"
                                                value={filters[column.key] || ""}
                                                onChange={(event) => {
                                                    const value = event.target.value;

                                                    setFilters((current) => ({
                                                        ...current,
                                                        [column.key]: value,
                                                    }));

                                                    setCurrentPage(1);
                                                }}
                                                placeholder="Filter..."
                                                aria-label={`Filter ${column.label}`}
                                                className="w-full min-w-0 border border-gray-300 px-2 py-1.5 text-sm font-normal outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            />
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={displayedColumns.length}
                                            className="px-4 py-10 text-center text-gray-500"
                                        >
                                            Loading centers...
                                        </td>
                                    </tr>
                                ) : paginatedCenters.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={displayedColumns.length}
                                            className="px-4 py-10 text-center text-gray-500"
                                        >
                                            No matching centers found.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedCenters.map((item) => (
                                        <tr
                                            key={item.entityBusinessID}
                                            className="hover:bg-blue-50/60"
                                        >
                                            {displayedColumns.map((column) => {
                                                const cellContent = getColumnCell(
                                                    column,
                                                    item
                                                );

                                                return (
                                                    <td
                                                        key={column.key}
                                                        className="overflow-hidden px-3 py-2 sm:px-4"
                                                    >
                                                        {column.key === "action" ||
                                                            column.key === "status" ? (
                                                            cellContent
                                                        ) : (
                                                            renderCellText(cellContent)
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination pinned to bottom */}
                <div className="mt-auto w-full border border-gray-300 bg-white px-2 py-2 sm:px-3">
                    {/* Rows per page and entry count */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <label htmlFor="pageSize">Rows per page:</label>

                            <select
                                id="pageSize"
                                value={pageSize}
                                onChange={(event) => {
                                    setPageSize(Number(event.target.value));
                                    setCurrentPage(1);
                                }}
                                className="border border-gray-300 bg-white px-2 py-1 text-sm outline-none focus:border-blue-500"
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>

                        <p className="text-sm text-gray-600">
                            Showing {" "}
                            <span className="font-semibold text-gray-800">
                                {startIndex + (totalEntries > 0 ? 1 : 0)} – {endIndex}
                            </span>{"  "}
                            of {" "}
                            <span className="font-semibold text-gray-800">
                                {totalEntries}
                            </span>{" "}
                            entries
                            {totalEntries !== centers.length && (
                                <span className="text-gray-500">
                                    {" "}
                                    (filtered from {centers.length})
                                </span>
                            )}
                        </p>
                    </div>

                    {/* Page navigation */}
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 pt-2">
                        <button
                            type="button"
                            onClick={() =>
                                setCurrentPage((page) => Math.max(1, page - 1))
                            }
                            disabled={currentPage === 1 || totalEntries === 0}
                            className="inline-flex items-center gap-1 border border-gray-300 px-2 py-1 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <FiChevronLeft size={14} />
                            Previous
                        </button>

                        <div className="flex flex-wrap items-center gap-1">
                            {pageNumbers.map((page, index) => {
                                const previousPage = pageNumbers[index - 1];
                                const showEllipsis =
                                    previousPage && page - previousPage > 1;

                                return (
                                    <span
                                        key={page}
                                        className="inline-flex items-center gap-1"
                                    >
                                        {showEllipsis && (
                                            <span className="px-1 text-sm text-gray-400">
                                                ...
                                            </span>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => setCurrentPage(page)}
                                            aria-current={
                                                currentPage === page ? "page" : undefined
                                            }
                                            className={`min-w-8 border px-2 py-1 text-sm ${currentPage === page
                                                ? "border-blue-600 bg-blue-600 text-white"
                                                : "border-gray-300 text-gray-700 hover:bg-gray-50"
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    </span>
                                );
                            })}
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                setCurrentPage((page) =>
                                    Math.min(totalPages, page + 1)
                                )
                            }
                            disabled={
                                currentPage >= totalPages || totalEntries === 0
                            }
                            className="inline-flex items-center gap-1 border border-gray-300 px-2 py-1 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Next
                            <FiChevronRight size={14} />
                        </button>
                    </div>

                    {/* Page info and clear filters */}
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-2 text-sm text-gray-500">
                        <span>
                            Page {currentPage} of {totalPages}
                        </span>

                        <button
                            type="button"
                            onClick={() => {
                                setFilters({});
                                setSortKey("id");
                                setSortOrder("asc");
                                setCurrentPage(1);
                                toast.success("Filters and sorting cleared.");
                            }}
                            className="text-blue-600 hover:underline"
                        >
                            Clear filters & sorting
                        </button>
                    </div>
                </div>
            </div>


            {/* Create Center popup */}
            {showCreateForm && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                    onClick={() => setShowCreateForm(false)}
                >
                    <div
                        className="max-h-[90vh] w-full max-w-7xl overflow-y-auto bg-white shadow-xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-5 py-4">
                            <h2 className="text-lg font-semibold">Add New Center</h2>

                            <button
                                type="button"
                                onClick={() => setShowCreateForm(false)}
                                aria-label="Close popup"
                                className="border border-gray-200 p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                            >
                                <FiX size={22} />
                            </button>
                        </div>

                        <div className="p-5">
                            <CreateCenter
                                onCreated={async () => {
                                    setShowCreateForm(false);
                                    await getAllCenters();
                                    setCurrentPage(1);
                                }}
                                onCancel={() => setShowCreateForm(false)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Update Center popup */}
            {showUpdateForm && selectedCenter && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                    onClick={closeUpdateForm}
                >
                    <div
                        className="max-h-[90vh] w-full max-w-7xl overflow-y-auto bg-white shadow-xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-5 py-4">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    Update Center
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Center ID:{" "}
                                    {selectedCenter.entityBusinessID}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeUpdateForm}
                                aria-label="Close popup"
                                className="border border-gray-200 p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                            >
                                <FiX size={22} />
                            </button>
                        </div>

                        <div className="p-5">
                            <UpdateCenter
                                center={selectedCenter}
                                onUpdated={handleCenterUpdated}
                                onCancel={closeUpdateForm}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* View Center popup */}
            {showViewForm && viewCenter && (
                <ViewCenter
                    center={viewCenter}
                    onClose={closeViewCenter}
                    onEdit={handleEditCenter}
                    onDelete={handleDeleteCenter}
                    deletingId={deletingId}
                />
            )}
        </div>
    );
}
