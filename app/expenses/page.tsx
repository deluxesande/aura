"use client";

import Navbar from "@/components/Navbar";
import { apiClient } from "@/utils/apiClient";
import {
    Loader2,
    Plus,
    Search,
    ChevronLeft,
    ChevronRight,
    Trash2,
    Edit,
} from "lucide-react";
import React, { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "@/store";
import { setExpenses as setExpensesInStore } from "@/store/slices/expenseSlice";
import ExpenseModal from "@/components/modals/ExpenseModal";
import EditExpenseModal from "@/components/modals/EditExpenseModal";
import Image from "next/image";

export default function ExpensesPage() {
    const dispatch = useDispatch();
    const user = useSelector((state: AppState) => state.auth.user);
    const expenses = useSelector((state: AppState) => state.expense.expenses);

    const [loading, setLoading] = useState(expenses.length === 0);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<any>(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState("All");
    const [filterBranch, setFilterBranch] = useState("All");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchExpenses = useCallback(async () => {
        try {
            const res = await apiClient.get("/expenses");
            dispatch(setExpensesInStore(res.data || []));
        } catch (error) {
            toast.error("Failed to load expenses");
        } finally {
            setLoading(false);
        }
    }, [dispatch]);

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterCategory, filterBranch]);

    const handleVoid = async (expenseId: string) => {
        if (
            !window.confirm(
                "Are you sure you want to void this expense? This action cannot be undone.",
            )
        )
            return;

        const voidPromise = apiClient.delete(`/expenses/${expenseId}`);

        toast.promise(voidPromise, {
            loading: "Voiding expense...",
            success: () => {
                fetchExpenses();
                return "Expense voided successfully.";
            },
            error: (err) =>
                err.response?.data?.error || "Failed to void expense.",
        });
    };

    const categories = [
        "All",
        ...Array.from(new Set(expenses.map((e) => e.category).filter(Boolean))),
    ];

    const branches = [
        "All",
        ...Array.from(
            new Set(expenses.map((e) => e.Store?.name || "All Branches")),
        ),
    ];

    const filteredExpenses = expenses.filter((expense) => {
        const matchesSearch =
            expense.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (expense.notes &&
                expense.notes
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()));
        const matchesCategory =
            filterCategory === "All" || expense.category === filterCategory;
        const matchesBranch =
            filterBranch === "All" ||
            (expense.Store?.name || "All Branches") === filterBranch;

        return matchesSearch && matchesCategory && matchesBranch;
    });

    const totalExpenses = filteredExpenses.reduce(
        (sum, exp) => sum + (exp.amount || 0),
        0,
    );

    // Pagination Calculations
    const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedExpenses = filteredExpenses.slice(startIndex, endIndex);

    const handlePreviousPage = () =>
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    const handleNextPage = () =>
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    const handlePageClick = (page: number) => setCurrentPage(page);

    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 3;
        let startPage = Math.max(
            1,
            currentPage - Math.floor(maxPagesToShow / 2),
        );
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        return pages;
    };

    return (
        <Navbar>
            <div className="p-4 md:p-8 mx-auto min-h-screen font-sans">
                <div className="bg-white shadow-lg rounded-lg p-4 border border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Expense Tracking
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Log and monitor your business operational costs.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowExpenseModal(true)}
                            className="flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2.5 rounded-lg hover:bg-green-600 transition-colors font-bold text-sm shadow-sm shadow-green-100"
                        >
                            <Plus className="w-4 h-4 stroke-white" />
                            Log Expense
                        </button>
                    </div>

                    {/* Filters & Summary */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <div className="relative w-full sm:w-64">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 stroke-green-500" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search expenses..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-sm"
                                />
                            </div>
                            <select
                                value={filterCategory}
                                onChange={(e) =>
                                    setFilterCategory(e.target.value)
                                }
                                className="px-4 py-2.5 text-sm border border-gray-200 rounded-lg outline-none bg-slate-50 focus:ring-2 focus:ring-green-500/20 transition-all font-medium text-gray-600 w-full sm:w-auto cursor-pointer"
                            >
                                {categories.map((cat, idx) => (
                                    <option
                                        key={`filter-cat-${cat}-${idx}`}
                                        value={cat}
                                    >
                                        {cat}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={filterBranch}
                                onChange={(e) =>
                                    setFilterBranch(e.target.value)
                                }
                                className="px-4 py-2.5 text-sm border border-gray-200 rounded-lg outline-none bg-slate-50 focus:ring-2 focus:ring-green-500/20 transition-all font-medium text-gray-600 w-full sm:w-auto cursor-pointer"
                            >
                                {branches.map((branch, idx) => (
                                    <option
                                        key={`filter-branch-${branch}-${idx}`}
                                        value={branch}
                                    >
                                        {branch === "All"
                                            ? "All Branches"
                                            : branch}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200 flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
                            <span className="text-sm text-gray-500 font-bold uppercase tracking-wider">
                                Total:
                            </span>
                            <span className="text-lg font-semibold text-gray-900">
                                KSh {totalExpenses.toLocaleString()}
                            </span>
                        </div>
                    </div>

                    {/* Table View */}
                    <div className="overflow-x-auto rounded-lg border border-gray-100">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Date
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Expense Details
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Branch
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Logged By
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Amount
                                    </th>
                                    {user?.role !== "user" && (
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">
                                            Actions
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={
                                                user?.role !== "user" ? 6 : 5
                                            }
                                            className="px-6 py-12 text-center"
                                        >
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : paginatedExpenses.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={
                                                user?.role !== "user" ? 6 : 5
                                            }
                                            className="px-6 py-12 text-center text-sm text-gray-500"
                                        >
                                            No expenses found matching your
                                            criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedExpenses.map((expense, index) => {
                                        const currentUserStoreId =
                                            user?.storeId;
                                        const canModify =
                                            user?.role === "admin" ||
                                            (user?.role === "manager" &&
                                                expense.storeId ===
                                                    currentUserStoreId);

                                        return (
                                            <tr
                                                key={`exp-row-${expense?.id || "noid"}-${index}`}
                                                className="hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                                                    {new Date(
                                                        expense.date,
                                                    ).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {expense.title}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600 uppercase tracking-wider">
                                                            {expense.category}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                                                    {!expense.storeId ? (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wider">
                                                            All Branches
                                                        </span>
                                                    ) : (
                                                        expense.Store?.name ||
                                                        "Unknown Branch"
                                                    )}
                                                </td>
                                                <td className="p-4 whitespace-nowrap">
                                                    {expense.CreatedBy ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 ring-1 ring-gray-200 bg-gray-100">
                                                                <Image
                                                                    src={
                                                                        expense
                                                                            .CreatedBy
                                                                            .imageUrl ||
                                                                        "/images/user.png"
                                                                    }
                                                                    width={32}
                                                                    height={32}
                                                                    alt={`${expense.CreatedBy.firstName || "User"} Profile`}
                                                                    className="object-cover"
                                                                />
                                                            </div>
                                                            <div className="flex flex-col overflow-hidden">
                                                                <p className="text-sm font-semibold text-gray-900 truncate">
                                                                    {
                                                                        expense
                                                                            .CreatedBy
                                                                            .firstName
                                                                    }{" "}
                                                                    {
                                                                        expense
                                                                            .CreatedBy
                                                                            .lastName
                                                                    }
                                                                </p>
                                                                <p className="text-xs text-gray-500 truncate capitalize">
                                                                    {expense
                                                                        .CreatedBy
                                                                        .role ||
                                                                        "User"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm italic">
                                                            Unknown
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <span className="text-sm font-semibold text-gray-900">
                                                        KSh{" "}
                                                        {(
                                                            expense.amount || 0
                                                        ).toLocaleString()}
                                                    </span>
                                                </td>
                                                {user?.role !== "user" && (
                                                    <td className="p-4 whitespace-nowrap text-right text-sm font-medium">
                                                        {canModify ? (
                                                            <div className="flex items-center justify-end gap-1">
                                                                <button
                                                                    onClick={(
                                                                        e,
                                                                    ) => {
                                                                        e.stopPropagation();
                                                                        setSelectedExpense(
                                                                            expense,
                                                                        );
                                                                        setShowEditModal(
                                                                            true,
                                                                        );
                                                                    }}
                                                                    className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-all"
                                                                    title="Edit Expense"
                                                                >
                                                                    <Edit
                                                                        size={
                                                                            18
                                                                        }
                                                                        className="stroke-green-500"
                                                                    />
                                                                </button>
                                                                <button
                                                                    onClick={(
                                                                        e,
                                                                    ) => {
                                                                        e.stopPropagation();
                                                                        handleVoid(
                                                                            expense.id,
                                                                        );
                                                                    }}
                                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                                    title="Void Expense"
                                                                >
                                                                    <Trash2
                                                                        size={
                                                                            18
                                                                        }
                                                                        className="stroke-red-500"
                                                                    />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-gray-400 mr-2">
                                                                Restricted
                                                            </span>
                                                        )}
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {!loading && paginatedExpenses.length > 0 && (
                        <div className="flex flex-wrap justify-center items-center pt-4 my-4 gap-2 sm:gap-4">
                            <button
                                className="btn btn-xs btn-ghost flex items-center bg-green-400 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600"
                                onClick={handlePreviousPage}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="w-4 h-4 stroke-white" />
                                <span className="hidden sm:inline text-sm text-white">
                                    Back
                                </span>
                            </button>

                            <div className="flex space-x-1 sm:space-x-2">
                                {getPageNumbers().map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageClick(page)}
                                        className={`btn btn-xs border-0 ${
                                            currentPage === page
                                                ? "bg-green-400 text-white hover:bg-green-600"
                                                : "btn-ghost text-black hover:bg-green-100"
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>

                            <button
                                className="btn btn-xs btn-ghost flex items-center bg-green-400 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600"
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                            >
                                <span className="hidden sm:inline text-sm text-white">
                                    Next
                                </span>
                                <ChevronRight className="w-4 h-4 stroke-white" />
                            </button>
                        </div>
                    )}

                    {/* Page info */}
                    {!loading && filteredExpenses.length > 0 && (
                        <div className="text-center text-sm text-gray-500 my-2">
                            Page {currentPage} of {totalPages} | Showing{" "}
                            {startIndex + 1}-
                            {Math.min(endIndex, filteredExpenses.length)} of{" "}
                            {filteredExpenses.length} expenses
                        </div>
                    )}
                </div>
            </div>

            {/* Modals outside AnimatePresence to prevent Key Crash */}
            {showExpenseModal && (
                <ExpenseModal
                    isOpen={showExpenseModal}
                    onClose={() => setShowExpenseModal(false)}
                    onSuccess={fetchExpenses}
                />
            )}

            {showEditModal && (
                <EditExpenseModal
                    isOpen={showEditModal}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedExpense(null);
                    }}
                    onSuccess={fetchExpenses}
                    expense={selectedExpense}
                />
            )}
        </Navbar>
    );
}
