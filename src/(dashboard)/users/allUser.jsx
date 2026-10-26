import {
    useCallback,
    useEffect,
    useMemo,
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
    FiChevronLeft,
    FiChevronRight,
    FiColumns,
    FiX,
    FiCheck,
} from "react-icons/fi";

import CreateUser from "./createUser";
import UpdateUser from "./updateUser";
import ViewUser from "./viewUser";

const API_URL = "https://icareteleradiology-backend.vercel.app/api/users";
const ACTIVATE_URL = `${API_URL}/activate`;
const DEACTIVATE_URL = `${API_URL}/deactivate`;

const INITIAL_COLUMN_WIDTHS = {
    action: 120,
    name: 180,
    loginID: 160,
    email: 220,
    mobile: 140,
    designation: 180,
    qualification: 140,
    role: 120,
    status: 100,
};

export default function AllUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [statusUpdating, setStatusUpdating] = useState(null);

    const [filters, setFilters] = useState({});
    const [sortKey, setSortKey] = useState("name");
    const [sortOrder, setSortOrder] = useState("asc");

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [showColumnMenu, setShowColumnMenu] = useState(false);
    const [showCreateUser, setShowCreateUser] = useState(false);
    const [showUpdateUser, setShowUpdateUser] = useState(false);
    const [showViewUser, setShowViewUser] = useState(false);

    const [selectedUser, setSelectedUser] = useState(null);
    const [viewUser, setViewUser] = useState(null);

    const [visibleColumns, setVisibleColumns] = useState({});
    const [columnWidths, setColumnWidths] = useState(
        INITIAL_COLUMN_WIDTHS
    );

    // COLUMNS
    const columns = useMemo(
        () => [
            { key: "action", label: "Actions" },
            { key: "name", label: "Name" },
            { key: "loginID", label: "Login ID" },
            { key: "email", label: "Email ID" },
            { key: "mobile", label: "Mobile No" },
            { key: "designation", label: "Designation" },
            { key: "qualification", label: "Qualification" },
            { key: "role", label: "Role ID" },
            { key: "status", label: "Status" },
        ],
        []
    );

    const isColumnVisible = useCallback(
        (key) => key === "action" || visibleColumns[key] !== false,
        [visibleColumns]
    );

    const displayedColumns = useMemo(
        () => columns.filter((column) => isColumnVisible(column.key)),
        [columns, isColumnVisible]
    );

    const toggleColumn = (key) => {
        if (key === "action") return;

        const visibleCount = columns.filter((column) =>
            isColumnVisible(column.key)
        ).length;

        if (isColumnVisible(key) && visibleCount <= 2) {
            toast.error(
                "At least one data column must remain visible."
            );
            return;
        }

        setVisibleColumns((previous) => ({
            ...previous,
            [key]: !isColumnVisible(key),
        }));
    };

    const showAllColumns = () => setVisibleColumns({});

    const hideAllColumns = () => {
        const hidden = {};

        columns.forEach((column) => {
            hidden[column.key] = column.key !== "action";
        });

        setVisibleColumns(hidden);
    };

    // AUTHENTICATION
    const getToken = () => {
        try {
            const savedResponse = JSON.parse(
                localStorage.getItem("responseList") || "null"
            );

            const user = Array.isArray(savedResponse)
                ? savedResponse[0]
                : savedResponse?.responseList?.[0] ?? savedResponse;

            return (
                user?.token ||
                localStorage.getItem("token") ||
                null
            );
        } catch {
            return localStorage.getItem("token");
        }
    };

    const getAuthHeaders = () => {
        const token = getToken();

        if (!token) {
            toast.error("Session expired. Please login again.");

            localStorage.removeItem("responseList");
            localStorage.removeItem("token");

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

    // FETCH USERS
    const getAllUsers = useCallback(async (showMessage = false) => {
        setLoading(true);

        try {
            const headers = getAuthHeaders();

            if (!headers) return;

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
                data?.responseStatus === false ||
                (
                    data?.statusCode != null &&
                    Number(data.statusCode) >= 400
                ) ||
                data?.status === "ERROR" ||
                data?.status === "FAILED"
            ) {
                throw new Error(
                    data?.errorMessage ||
                    data?.message ||
                    "Unable to fetch users."
                );
            }

            const responseList = Array.isArray(data?.responseList)
                ? data.responseList
                : [];

            const formattedUsers = responseList.map((item, index) => {
                const user = item?.systemUser ?? item;

                const isLocked =
                    user?.isLocked === true ||
                    String(user?.isLocked).toLowerCase() === "true" ||
                    String(user?.isLocked) === "1";

                const isInactive =
                    user?.active === false ||
                    String(user?.active).toLowerCase() === "false" ||
                    String(user?.active) === "0";

                return {
                    ...user,

                    id:
                        user?.entityBusinessID ??
                        user?.systemUserID ??
                        user?.userID ??
                        index + 1,

                    name: user?.entityBusinessName ?? "-",
                    loginID: user?.loginID ?? "-",
                    email: user?.email ?? "-",
                    mobile: user?.mobileNumber ?? "-",
                    designation: user?.designation ?? "-",
                    qualification: user?.qualification ?? "",
                    role: user?.roleID ?? user?.role ?? "-",

                    status: isLocked
                        ? "Locked"
                        : isInactive
                            ? "Inactive"
                            : "Active",
                };
            });

            setUsers(formattedUsers);

            if (showMessage) {
                toast.success("Users refreshed successfully.");
            }
        } catch (error) {
            console.error(
                "Get all users error:",
                error.response?.data || error.message
            );

            if (error.response?.status === 401) {
                toast.error("Session expired. Please login again.");

                localStorage.removeItem("responseList");
                localStorage.removeItem("token");

                window.location.replace("/login");
                return;
            }

            toast.error(
                error.response?.data?.errorMessage ||
                error.response?.data?.message ||
                error.message ||
                "Unable to fetch users."
            );

            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        getAllUsers();
    }, [getAllUsers]);

    // REFRESH
    const handleRefresh = () => {
        setFilters({});
        setSortKey("name");
        setSortOrder("asc");
        setCurrentPage(1);

        getAllUsers(true);
    };

    // ACTIVATE / DEACTIVATE USER
    const checkApiError = (data, action) => {
        if (
            data?.success === false ||
            (
                data?.statusCode != null &&
                Number(data.statusCode) >= 400
            ) ||
            data?.responseStatus === false ||
            data?.status === "ERROR" ||
            data?.status === "FAILED"
        ) {
            throw new Error(
                data?.errorMessage ||
                data?.message ||
                `Unable to ${action} user.`
            );
        }
    };

    const confirmUserStatus = (userName, action) => {
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
                                "{userName}"
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
                                className={`px-3 py-1.5 text-sm text-white ${
                                    isActivate
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

    const handleDelete = async (user) => {
        if (statusUpdating !== null) {
            toast.error("Please wait. Another request is in progress.");
            return;
        }

        const entityBusinessID =
            user?.entityBusinessID ??
            user?.systemUserID ??
            user?.userID;

        if (
            entityBusinessID === undefined ||
            entityBusinessID === null ||
            entityBusinessID === ""
        ) {
            toast.error("User ID is missing. Cannot update status.");
            return;
        }

        if (user.status === "Locked") {
            toast.error(
                "This user is locked. Activate/Deactivate cannot unlock a user."
            );
            return;
        }

        const shouldActivate = user.status === "Inactive";
        const action = shouldActivate ? "activate" : "deactivate";

        const userName =
            user?.userName ||
            user?.name ||
            user?.loginID ||
            `User ${entityBusinessID}`;

        const confirmed = await confirmUserStatus(userName, action);

        if (!confirmed) return;

        const headers = getAuthHeaders();

        if (!headers) return;

        const endpoint = shouldActivate
            ? ACTIVATE_URL
            : DEACTIVATE_URL;

        const payload = {
            genericManipulationRequestEntity: {
                companyID: user.companyID ?? 1,
                createdBy: user.createdBy ?? 1,
                entityBusinessID: Number(entityBusinessID),
            },
        };

        setStatusUpdating(entityBusinessID);

        try {
            const response = await axios.post(
                endpoint,
                payload,
                { headers }
            );

            checkApiError(response.data, action);

            toast.success(
                `${userName} ${
                    shouldActivate ? "activated" : "deactivated"
                } successfully.`
            );

            await getAllUsers();

            // Update the open ViewUser component after status change.
            if (
                viewUser &&
                String(
                    viewUser.entityBusinessID ??
                    viewUser.systemUserID ??
                    viewUser.userID
                ) === String(entityBusinessID)
            ) {
                setViewUser((previous) => ({
                    ...previous,
                    status: shouldActivate ? "Active" : "Inactive",
                    active: shouldActivate ? 1 : 0,
                }));
            }
        } catch (error) {
            console.error(
                `${action} user error:`,
                error.response?.data || error.message
            );

            if (error.response?.status === 401) {
                toast.error("Session expired. Please login again.");

                localStorage.removeItem("responseList");
                localStorage.removeItem("token");

                window.location.replace("/login");
                return;
            }

            if (error.response?.status === 404) {
                toast.error("API route not found. Check your backend route.");
                return;
            }

            toast.error(
                error.response?.data?.errorMessage ||
                error.response?.data?.message ||
                error.message ||
                `Unable to ${action} user.`
            );
        } finally {
            setStatusUpdating(null);
        }
    };

    // CREATE USER POPUP
    const handleAdd = () => {
        setShowViewUser(false);
        setViewUser(null);
        setShowUpdateUser(false);
        setSelectedUser(null);
        setShowCreateUser(true);
    };

    const handleCreateSuccess = async () => {
        setShowCreateUser(false);
        await getAllUsers();
    };

    const handleCloseCreateUser = () => {
        setShowCreateUser(false);
    };

    // UPDATE USER POPUP
    const handleEdit = (user) => {
        setSelectedUser(user);
        setShowCreateUser(false);
        setShowViewUser(false);
        setViewUser(null);
        setShowUpdateUser(true);
    };

    const handleUpdateSuccess = async () => {
        setShowUpdateUser(false);
        setSelectedUser(null);
        await getAllUsers();
    };

    const handleCloseUpdateUser = () => {
        setShowUpdateUser(false);
        setSelectedUser(null);
    };

    // SHOW USER POPUP
    const handleViewUser = (user) => {
        setViewUser(user);
        setShowViewUser(true);
    };

    const handleCloseViewUser = () => {
        setShowViewUser(false);
        setViewUser(null);
    };

    // EDIT USER FROM VIEW POPUP
    const handleEditFromView = (user) => {
        handleEdit(user);
    };

    // CLOSE POPUPS USING ESCAPE
    useEffect(() => {
        if (
            !showCreateUser &&
            !showUpdateUser &&
            !showViewUser
        ) {
            return;
        }

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setShowCreateUser(false);
                setShowUpdateUser(false);
                setShowViewUser(false);
                setSelectedUser(null);
                setViewUser(null);
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [showCreateUser, showUpdateUser, showViewUser]);

    // COLUMN RESIZING
    const handleResizeStart = (event, key) => {
        event.preventDefault();

        const startX = event.clientX;
        const startWidth =
            columnWidths[key] || INITIAL_COLUMN_WIDTHS[key] || 120;

        const handleMove = (moveEvent) => {
            const width = Math.max(
                80,
                Math.min(600, startWidth + moveEvent.clientX - startX)
            );

            setColumnWidths((previous) => ({
                ...previous,
                [key]: width,
            }));
        };

        const handleUp = () => {
            window.removeEventListener("mousemove", handleMove);
            window.removeEventListener("mouseup", handleUp);
        };

        window.addEventListener("mousemove", handleMove);
        window.addEventListener("mouseup", handleUp);
    };

    // FILTERING AND SORTING
    const filteredUsers = useMemo(() => {
        const result = users.filter((user) =>
            columns.every((column) => {
                const search = (filters[column.key] || "")
                    .trim()
                    .toLowerCase();

                if (!search || column.key === "action") return true;

                return String(user[column.key] ?? "-")
                    .toLowerCase()
                    .includes(search);
            })
        );

        result.sort((a, b) => {
            const comparison = String(a[sortKey] ?? "").localeCompare(
                String(b[sortKey] ?? ""),
                undefined,
                {
                    numeric: true,
                    sensitivity: "base",
                }
            );

            return sortOrder === "asc" ? comparison : -comparison;
        });

        return result;
    }, [users, filters, sortKey, sortOrder, columns]);

    const handleSort = (key) => {
        if (key === "action") return;

        if (sortKey === key) {
            setSortOrder((previous) =>
                previous === "asc" ? "desc" : "asc"
            );
        } else {
            setSortKey(key);
            setSortOrder("asc");
        }

        setCurrentPage(1);
    };

    // PAGINATION
    const totalEntries = filteredUsers.length;

    const totalPages = Math.max(
        1,
        Math.ceil(totalEntries / pageSize)
    );

    const safePage = Math.min(currentPage, totalPages);

    const startIndex = totalEntries
        ? (safePage - 1) * pageSize
        : 0;

    const endIndex = Math.min(
        startIndex + pageSize,
        totalEntries
    );

    const paginatedUsers = filteredUsers.slice(
        startIndex,
        endIndex
    );

    const pageNumbers = Array.from(
        { length: totalPages },
        (_, index) => index + 1
    ).filter(
        (page) =>
            page === 1 ||
            page === totalPages ||
            Math.abs(page - safePage) <= 2
    );

    useEffect(() => {
        setCurrentPage((page) => Math.min(page, totalPages));
    }, [totalPages]);

    return (
        <div className="w-full min-w-0 max-w-full space-y-2">
            {/* HEADER */}
            <div className="flex min-w-0 flex-col gap-3 border border-gray-200 bg-white px-3 py-2 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-4">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                        All Users
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage and view all registered users
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={handleRefresh}
                        disabled={loading}
                        className="inline-flex items-center gap-2 border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                    >
                        <FiRefreshCw
                            className={loading ? "animate-spin" : ""}
                            size={16}
                        />
                        Refresh
                    </button>

                    <button
                        type="button"
                        onClick={handleAdd}
                        className="inline-flex items-center gap-2 bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                    >
                        <FiPlus size={17} />
                        Add User
                    </button>
                </div>
            </div>

            <div className="space-y-2 px-3">
                {/* COLUMN VISIBILITY */}
                <div className="relative flex items-center justify-between gap-2">
                    <button
                        type="button"
                        onClick={() =>
                            setShowColumnMenu((previous) => !previous)
                        }
                        aria-expanded={showColumnMenu}
                        className="inline-flex items-center gap-2 border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                        <FiColumns size={17} />
                        Show / Hide Columns
                    </button>

                    <span className="text-sm text-gray-500">
                        {displayedColumns.length} columns visible
                    </span>

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
                                    aria-label="Close column menu"
                                    className="p-1 text-gray-500 hover:bg-gray-100"
                                >
                                    <FiX size={18} />
                                </button>
                            </div>

                            <div className="flex gap-2 border-b border-gray-200 p-3">
                                <button
                                    type="button"
                                    onClick={showAllColumns}
                                    className="flex-1 border border-blue-200 px-3 py-2 text-sm text-blue-700 hover:bg-blue-50"
                                >
                                    Show All
                                </button>

                                <button
                                    type="button"
                                    onClick={hideAllColumns}
                                    className="flex-1 border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    Hide All
                                </button>
                            </div>

                            <div className="max-h-80 space-y-1 overflow-y-auto p-3">
                                {columns.map((column) => (
                                    <label
                                        key={column.key}
                                        className={`flex items-center gap-3 px-3 py-2 text-sm ${
                                            column.key === "action"
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
                                            <span className="ml-auto">
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
                                    className="bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* TABLE */}
                <div className="w-full min-w-0 border border-gray-200 bg-white shadow-sm">
                    <div className="max-h-[calc(100vh-280px)] min-h-64 w-full overflow-auto overscroll-contain">
                        <table
                            className="table-fixed border-collapse text-sm"
                            style={{
                                width: "100%",
                                minWidth: `${displayedColumns.reduce(
                                    (total, column) =>
                                        total +
                                        (columnWidths[column.key] || 120),
                                    0
                                )}px`,
                            }}
                        >
                            <colgroup>
                                {displayedColumns.map((column) => (
                                    <col
                                        key={column.key}
                                        style={{
                                            width: `${
                                                columnWidths[column.key] || 120
                                            }px`,
                                        }}
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

                                                {column.key !== "action" && (
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
                                                )}
                                            </div>

                                            <div
                                                role="separator"
                                                aria-orientation="vertical"
                                                aria-label={`Resize ${column.label}`}
                                                title="Drag to resize; double-click to reset"
                                                onMouseDown={(event) =>
                                                    handleResizeStart(
                                                        event,
                                                        column.key
                                                    )
                                                }
                                                onDoubleClick={() =>
                                                    setColumnWidths(
                                                        (previous) => ({
                                                            ...previous,
                                                            [column.key]:
                                                                INITIAL_COLUMN_WIDTHS[
                                                                    column.key
                                                                ],
                                                        })
                                                    )
                                                }
                                                className="absolute right-0 top-0 z-20 h-full w-2 cursor-col-resize touch-none select-none hover:bg-blue-400"
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
                                            {column.key !== "action" && (
                                                <input
                                                    type="text"
                                                    value={
                                                        filters[column.key] || ""
                                                    }
                                                    onChange={(event) => {
                                                        setFilters((previous) => ({
                                                            ...previous,
                                                            [column.key]:
                                                                event.target.value,
                                                        }));

                                                        setCurrentPage(1);
                                                    }}
                                                    placeholder="Filter..."
                                                    aria-label={`Filter ${column.label}`}
                                                    className="w-full min-w-0 border border-gray-300 px-2 py-1.5 text-sm font-normal outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                                />
                                            )}
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
                                            <FiRefreshCw className="mr-2 inline animate-spin" />
                                            Loading users...
                                        </td>
                                    </tr>
                                ) : paginatedUsers.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={displayedColumns.length}
                                            className="px-4 py-10 text-center text-gray-500"
                                        >
                                            No matching users found.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedUsers.map((user) => {
                                        const userId =
                                            user.entityBusinessID ??
                                            user.systemUserID ??
                                            user.userID;

                                        const isInactive =
                                            user.status === "Inactive";

                                        const isLocked =
                                            user.status === "Locked";

                                        const isBusy =
                                            statusUpdating !== null;

                                        const isUpdating =
                                            String(statusUpdating) ===
                                            String(userId);

                                        return (
                                            <tr
                                                key={user.id}
                                                className="hover:bg-blue-50/60"
                                            >
                                                {displayedColumns.map((column) => (
                                                    <td
                                                        key={column.key}
                                                        className="overflow-hidden px-3 py-2 sm:px-4"
                                                    >
                                                        {column.key === "action" ? (
                                                            <div className="flex items-center gap-2 whitespace-nowrap">
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleViewUser(user)
                                                                    }
                                                                    title="View user"
                                                                    aria-label={`View user ${user.name}`}
                                                                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center border border-gray-300 text-gray-600 hover:bg-gray-100"
                                                                >
                                                                    <FiEye size={16} />
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleEdit(user)
                                                                    }
                                                                    title="Edit user"
                                                                    aria-label={`Edit ${user.name}`}
                                                                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center border border-blue-200 text-blue-600 hover:bg-blue-50"
                                                                >
                                                                    <FiEdit2 size={16} />
                                                                </button>

                                                                {isInactive ? (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleDelete(user)
                                                                        }
                                                                        disabled={isBusy || isLocked}
                                                                        title="Activate user"
                                                                        aria-label={`Activate ${user.name}`}
                                                                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center border border-green-200 text-green-600 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                                    >
                                                                        {isUpdating ? (
                                                                            <FiRefreshCw
                                                                                className="animate-spin"
                                                                                size={16}
                                                                            />
                                                                        ) : (
                                                                            <FiCheck size={16} />
                                                                        )}
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleDelete(user)
                                                                        }
                                                                        disabled={isBusy || isLocked}
                                                                        title={
                                                                            isLocked
                                                                                ? "User is locked"
                                                                                : "Deactivate user"
                                                                        }
                                                                        aria-label={
                                                                            isLocked
                                                                                ? `User ${user.name} is locked`
                                                                                : `Deactivate ${user.name}`
                                                                        }
                                                                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center border border-red-200 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                                    >
                                                                        {isUpdating ? (
                                                                            <FiRefreshCw
                                                                                className="animate-spin"
                                                                                size={16}
                                                                            />
                                                                        ) : (
                                                                            <FiTrash2 size={16} />
                                                                        )}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ) : column.key === "status" ? (
                                                            <span
                                                                className={`whitespace-nowrap border px-2 py-1 text-sm font-medium ${
                                                                    user.status === "Active"
                                                                        ? "border-green-200 bg-green-50 text-green-700"
                                                                        : user.status === "Locked"
                                                                            ? "border-yellow-200 bg-yellow-50 text-yellow-700"
                                                                            : "border-red-200 bg-red-50 text-red-700"
                                                                }`}
                                                            >
                                                                {user.status}
                                                            </span>
                                                        ) : (
                                                            <div
                                                                title={String(
                                                                    user[column.key] ?? "-"
                                                                )}
                                                                className="block w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap"
                                                            >
                                                                {user[column.key] ?? "-"}
                                                            </div>
                                                        )}
                                                    </td>
                                                ))}
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* BOTTOM PAGINATION */}
                <div className="mt-auto w-full border border-gray-300 bg-white px-2 py-2 sm:px-3">
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
                                {[10, 25, 50, 100].map((size) => (
                                    <option key={size} value={size}>
                                        {size}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <p className="text-sm text-gray-600">
                            Showing{" "}
                            <span className="font-semibold text-gray-800">
                                {totalEntries ? startIndex + 1 : 0} – {endIndex}
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold text-gray-800">
                                {totalEntries}
                            </span>{" "}
                            entries
                            {totalEntries !== users.length && (
                                <span className="text-gray-500">
                                    {" "}(filtered from {users.length})
                                </span>
                            )}
                        </p>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 pt-2">
                        <button
                            type="button"
                            onClick={() =>
                                setCurrentPage((page) => Math.max(1, page - 1))
                            }
                            disabled={safePage === 1 || totalEntries === 0}
                            className="inline-flex items-center gap-1 border border-gray-300 px-2 py-1 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <FiChevronLeft size={14} />
                            Previous
                        </button>

                        <div className="flex flex-wrap items-center gap-1">
                            {pageNumbers.map((page, index) => (
                                <span
                                    key={page}
                                    className="inline-flex items-center gap-1"
                                >
                                    {index > 0 &&
                                        page - pageNumbers[index - 1] > 1 && (
                                            <span className="px-1 text-sm text-gray-400">
                                                ...
                                            </span>
                                        )}

                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage(page)}
                                        aria-current={
                                            safePage === page ? "page" : undefined
                                        }
                                        className={`min-w-8 border px-2 py-1 text-sm ${
                                            safePage === page
                                                ? "border-blue-600 bg-blue-600 text-white"
                                                : "border-gray-300 text-gray-700 hover:bg-gray-50"
                                        }`}
                                    >
                                        {page}
                                    </button>
                                </span>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                setCurrentPage((page) =>
                                    Math.min(totalPages, page + 1)
                                )
                            }
                            disabled={
                                safePage >= totalPages || totalEntries === 0
                            }
                            className="inline-flex items-center gap-1 border border-gray-300 px-2 py-1 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Next
                            <FiChevronRight size={14} />
                        </button>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-2 text-sm text-gray-500">
                        <span>
                            Page {safePage} of {totalPages}
                        </span>

                        <button
                            type="button"
                            onClick={() => {
                                setFilters({});
                                setSortKey("name");
                                setSortOrder("asc");
                                setCurrentPage(1);
                            }}
                            className="text-blue-600 hover:underline"
                        >
                            Clear filters & sorting
                        </button>
                    </div>
                </div>
            </div>

            {/* CREATE USER POPUP */}
            {showCreateUser && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-5"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            handleCloseCreateUser();
                        }
                    }}
                >
                    <div
                        className="relative max-h-[90vh] w-full max-w-7xl overflow-y-auto border border-gray-200 bg-white shadow-xl"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="create-user-title"
                    >
                        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
                            <div>
                                <h2
                                    id="create-user-title"
                                    className="text-lg font-semibold text-gray-800"
                                >
                                    Add New User
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Enter the details to register a new user.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleCloseCreateUser}
                                aria-label="Close create user popup"
                                className="border border-gray-200 p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                            >
                                <FiX size={18} />
                            </button>
                        </div>

                        <div className="p-3 sm:p-5">
                            <CreateUser
                                onClose={handleCloseCreateUser}
                                onSuccess={handleCreateSuccess}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* UPDATE USER POPUP */}
            {showUpdateUser && selectedUser && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-5"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            handleCloseUpdateUser();
                        }
                    }}
                >
                    <div
                        className="relative max-h-[90vh] w-full max-w-7xl overflow-y-auto border border-gray-200 bg-white shadow-xl"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="update-user-title"
                    >
                        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
                            <div>
                                <h2
                                    id="update-user-title"
                                    className="text-lg font-semibold text-gray-800"
                                >
                                    Update User
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Update details for {selectedUser.name}.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleCloseUpdateUser}
                                aria-label="Close update user popup"
                                className="border border-gray-200 p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                            >
                                <FiX size={18} />
                            </button>
                        </div>

                        <div className="p-3 sm:p-5">
                            <UpdateUser
                                selectedUser={selectedUser}
                                onClose={handleCloseUpdateUser}
                                onSuccess={handleUpdateSuccess}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* VIEW USER COMPONENT */}
            {showViewUser && viewUser && (
                <ViewUser
                    user={viewUser}
                    onClose={handleCloseViewUser}
                    onEdit={handleEditFromView}
                    onDelete={handleDelete}
                    deletingId={statusUpdating}
                />
            )}
        </div>
    );
}
