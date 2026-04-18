"use client";

import CustomerModal from "@/components/CustomerModal";
import Navbar from "@/components/Navbar";
import { formatPhoneNumber } from "@/utils/formatPhoneNumber";
import { apiClient } from "@/utils/apiClient";
import {
    ChevronLeft,
    ChevronRight,
    ListFilter,
    Mail,
    Phone,
    Plus,
    Search,
    Trash2,
    User,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { toast } from "sonner";

interface Customer {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phoneNumber: string;
    createdAt: string;
    CreatedBy?: {
        firstName: string | null;
        lastName: string | null;
        imageUrl?: string | null;
        role?: string;
    } | null;
}

export default function Page() {
    const [customers, setCustomers] = React.useState<Customer[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [showAddCustomerModal, setShowAddCustomerModal] =
        React.useState(false);
    const [newCustomerDetails, setNewCustomerDetails] = React.useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
    });

    const [currentPage, setCurrentPage] = React.useState(1);
    const [itemsPerPage] = React.useState(10);
    const [searchTerm, setSearchTerm] = React.useState("");

    // New State for "Created By" Filter
    const [filterCreator, setFilterCreator] = React.useState<string>("All");

    const router = useRouter();

    // Extract unique creators for the dropdown
    const uniqueCreators = React.useMemo(() => {
        const creators = new Set<string>();
        customers.forEach((c) => {
            if (c.CreatedBy?.firstName) {
                creators.add(
                    `${c.CreatedBy.firstName} ${
                        c.CreatedBy.lastName || ""
                    }`.trim(),
                );
            } else {
                creators.add("Unknown");
            }
        });
        return ["All", ...Array.from(creators)];
    }, [customers]);

    const handleDelete = async (customerId: string) => {
        const promise = async () => {
            try {
                await apiClient.delete("/customer", {
                    data: { id: customerId },
                });

                setCustomers((prev) => prev.filter((c) => c.id !== customerId));
            } catch (error) {
                throw new Error("Failed to delete customer");
            }
        };

        toast.promise(promise(), {
            loading: "Deleting customer...",
            success: "Customer deleted successfully",
            error: "Error deleting customer",
        });
    };

    const handleSaveNewCustomer = async () => {
        if (!newCustomerDetails.firstName || !newCustomerDetails.lastName) {
            toast.warning("First and Last Name are required.");
            return;
        }
        if (!newCustomerDetails.phoneNumber) {
            toast.warning("Phone Number is required.");
            return;
        }

        try {
            const formattedPhone = formatPhoneNumber(
                newCustomerDetails.phoneNumber,
            );
            const emailToSave =
                newCustomerDetails.email.trim() === ""
                    ? null
                    : newCustomerDetails.email;

            const promise = async () => {
                const res = await apiClient.post("/customer", {
                    firstName: newCustomerDetails.firstName,
                    lastName: newCustomerDetails.lastName,
                    phoneNumber: formattedPhone,
                    email: emailToSave,
                });

                if (res.status === 201 || res.status === 200) {
                    setCustomers((prev) => [res.data, ...prev]);
                    setNewCustomerDetails({
                        firstName: "",
                        lastName: "",
                        email: "",
                        phoneNumber: "",
                    });
                    setShowAddCustomerModal(false);
                }
            };

            await toast.promise(promise(), {
                loading: "Saving customer...",
                success: "Customer saved successfully!",
                error: "Failed to save customer",
            });
        } catch (e) {
            toast.error("Failed to save customer.");
        }
    };

    useEffect(() => {
        setLoading(true);
        const fetchCustomers = async () => {
            try {
                const response = await apiClient.get("/customer");
                setCustomers(response.data);
            } catch (error) {
                toast.error("Failed to load customers");
            } finally {
                setLoading(false);
            }
        };

        fetchCustomers();
    }, []);

    const filteredCustomers = customers.filter((customer) => {
        const searchLower = searchTerm.toLowerCase();

        // 1. Search Filter
        const matchesSearch =
            customer.firstName.toLowerCase().includes(searchLower) ||
            customer.lastName.toLowerCase().includes(searchLower) ||
            customer.phoneNumber.includes(searchLower) ||
            (customer.email &&
                customer.email.toLowerCase().includes(searchLower));

        // 2. Creator Filter
        const creatorName = customer.CreatedBy
            ? `${customer.CreatedBy.firstName} ${
                  customer.CreatedBy.lastName || ""
              }`.trim()
            : "Unknown";

        const matchesCreator =
            filterCreator === "All" || creatorName === filterCreator;

        return matchesSearch && matchesCreator;
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterCreator]);

    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePageClick = (page: number) => {
        setCurrentPage(page);
    };

    const getPageNumbers = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 ||
                i === totalPages ||
                (i >= currentPage - 1 && i <= currentPage + 1)
            ) {
                pages.push(i);
            }
        }
        return Array.from(new Set(pages)).sort((a, b) => a - b);
    };

    return (
        <Navbar>
            <div className="p-4 md:p-8">
                {loading ? (
                    <div className="w-full h-64 flex flex-col items-center justify-center bg-white rounded-lg border border-gray-100">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden px-8 pb-8">
                        {/* Header with Search */}
                        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <h2 className="text-xl font-bold text-gray-800">
                                    Business Customers
                                </h2>
                                <span className="hidden md:inline-block px-3 py-1 bg-green-50 text-green-500 rounded-full text-xs font-semibold">
                                    {customers.length} Total
                                </span>
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap md:flex-nowrap">
                                {/* Search Bar */}
                                <div className="relative w-full md:w-64">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-4 w-4 stroke-green-500" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search customers..."
                                        className="pl-10 pr-4 py-2 w-full bg-slate-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                    />
                                </div>

                                {/* Creator Filter Dropdown */}
                                <div className="relative w-full md:w-48">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <ListFilter className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <select
                                        value={filterCreator}
                                        onChange={(e) =>
                                            setFilterCreator(e.target.value)
                                        }
                                        className="pl-10 pr-8 py-2 w-full bg-slate-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all appearance-none cursor-pointer text-gray-600"
                                    >
                                        {uniqueCreators.map((creator) => (
                                            <option
                                                key={creator}
                                                value={creator}
                                            >
                                                {creator === "All"
                                                    ? "All Creators"
                                                    : creator}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <button
                                    onClick={() =>
                                        setShowAddCustomerModal(true)
                                    }
                                    className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap w-full md:w-auto justify-center"
                                >
                                    <Plus size={16} className="stroke-white" />
                                    <span className="hidden md:inline text-white">
                                        Add Customer
                                    </span>
                                    <span className="md:hidden text-white">
                                        Add
                                    </span>
                                </button>
                            </div>
                        </div>

                        <div className="hidden lg:block overflow-x-auto rounded-lg border border-gray-200">
                            <table className="min-w-full bg-white">
                                <thead className="bg-gray-50">
                                    <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-xs tracking-wider">
                                        <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Phone No.
                                        </th>
                                        <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Added By
                                        </th>
                                        <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Date Added
                                        </th>
                                        <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {paginatedCustomers.length > 0 ? (
                                        paginatedCustomers.map((customer) => (
                                            <tr
                                                key={customer.id}
                                                onClick={() =>
                                                    router.push(
                                                        `/customers/${customer.id}`,
                                                    )
                                                }
                                                className="hover:bg-gray-50 transition-colors group cursor-pointer"
                                            >
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-sm shrink-0 border border-slate-200">
                                                            {customer.firstName?.charAt(
                                                                0,
                                                            ) || (
                                                                <User
                                                                    size={16}
                                                                />
                                                            )}
                                                            {customer.lastName?.charAt(
                                                                0,
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">
                                                                {
                                                                    customer.firstName
                                                                }{" "}
                                                                {
                                                                    customer.lastName
                                                                }
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                                                {new Date(
                                                                    customer.createdAt,
                                                                ).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="p-4">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <span className="">
                                                                {
                                                                    customer.phoneNumber
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="p-4">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <span>
                                                                {customer.email ||
                                                                    "N/A"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="p-4">
                                                    {customer.CreatedBy ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 ring-1 ring-gray-200">
                                                                <Image
                                                                    src={
                                                                        customer
                                                                            .CreatedBy
                                                                            .imageUrl ||
                                                                        "/images/user.png"
                                                                    }
                                                                    width={32}
                                                                    height={32}
                                                                    alt={`${customer.CreatedBy.firstName} Profile`}
                                                                    className="object-cover"
                                                                />
                                                            </div>
                                                            <div className="flex flex-col overflow-hidden">
                                                                <p className="text-sm font-semibold text-gray-900 truncate">
                                                                    {
                                                                        customer
                                                                            .CreatedBy
                                                                            .firstName
                                                                    }{" "}
                                                                    {
                                                                        customer
                                                                            .CreatedBy
                                                                            .lastName
                                                                    }
                                                                </p>
                                                                <p className="text-xs text-gray-500 truncate capitalize">
                                                                    {customer
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

                                                <td className="p-4 text-sm text-gray-500">
                                                    <div className="flex items-center gap-2">
                                                        {new Date(
                                                            customer.createdAt,
                                                        ).toLocaleDateString()}
                                                    </div>
                                                </td>

                                                <td className="p-4">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // Prevent row click
                                                            handleDelete(
                                                                customer.id,
                                                            );
                                                        }}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Delete Customer"
                                                    >
                                                        <Trash2
                                                            size={18}
                                                            className="stroke-red-500"
                                                        />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="p-12 text-center text-gray-400"
                                            >
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="p-4 bg-green-100 rounded-full">
                                                        <User className="h-8 w-8 stroke-green-500" />
                                                    </div>
                                                    <p>
                                                        {searchTerm ||
                                                        filterCreator !== "All"
                                                            ? "No customers found matching filters."
                                                            : "No customers found in this business."}
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="lg:hidden md:flex sm:flex flex-col divide-y divide-gray-100">
                            {paginatedCustomers.length > 0 ? (
                                paginatedCustomers.map((customer) => (
                                    <div
                                        key={customer.id}
                                        onClick={() =>
                                            router.push(
                                                `/customers/${customer.id}`,
                                            )
                                        }
                                        className="p-4 bg-white cursor-pointer"
                                    >
                                        {/* Top Row: Avatar, Name, Delete */}
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-sm shrink-0 border border-slate-200">
                                                    {customer.firstName?.charAt(
                                                        0,
                                                    ) || <User size={16} />}
                                                    {customer.lastName?.charAt(
                                                        0,
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">
                                                        {customer.firstName}{" "}
                                                        {customer.lastName}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                                        {new Date(
                                                            customer.createdAt,
                                                        ).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(customer.id);
                                                }}
                                                className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 rounded-lg"
                                            >
                                                <Trash2
                                                    size={16}
                                                    className="stroke-red-500"
                                                />
                                            </button>
                                        </div>

                                        {/* Middle: Contact Info */}
                                        <div className="pl-[52px] space-y-2 mb-3">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Phone
                                                    size={14}
                                                    className="text-gray-400"
                                                />
                                                <span className="">
                                                    {customer.phoneNumber}
                                                </span>
                                            </div>
                                            {customer.email && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Mail
                                                        size={14}
                                                        className="text-gray-400"
                                                    />
                                                    <span>
                                                        {customer.email}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Bottom: Added By */}
                                        <div className="pl-[52px] pt-3 border-t border-gray-50">
                                            <p className="text-xs text-gray-400 mb-2">
                                                Added by
                                            </p>
                                            {customer.CreatedBy ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full overflow-hidden ring-1 ring-gray-200">
                                                        <Image
                                                            src={
                                                                customer
                                                                    .CreatedBy
                                                                    .imageUrl ||
                                                                "/images/user.png"
                                                            }
                                                            width={24}
                                                            height={24}
                                                            alt="Creator"
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {
                                                            customer.CreatedBy
                                                                .firstName
                                                        }{" "}
                                                        {
                                                            customer.CreatedBy
                                                                .lastName
                                                        }
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">
                                                    Unknown
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-gray-400">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="p-4 bg-green-100 rounded-full">
                                            <User className="h-8 w-8 stroke-green-500" />
                                        </div>
                                        <p>
                                            {searchTerm ||
                                            filterCreator !== "All"
                                                ? "No customers found matching filters."
                                                : "No customers found."}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Pagination Controls */}
                        {!loading && paginatedCustomers.length > 0 && (
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
                                            onClick={() =>
                                                handlePageClick(page)
                                            }
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
                        {!loading && filteredCustomers.length > 0 && (
                            <div className="text-center text-sm text-gray-500 my-2">
                                Page {currentPage} of {totalPages} | Showing{" "}
                                {startIndex + 1}-
                                {Math.min(endIndex, filteredCustomers.length)}{" "}
                                of {filteredCustomers.length} customers
                            </div>
                        )}
                    </div>
                )}

                {/* --- MODAL Component --- */}
                {showAddCustomerModal && (
                    <CustomerModal
                        showAddCustomerModal={showAddCustomerModal}
                        setShowAddCustomerModal={setShowAddCustomerModal}
                        newCustomerDetails={newCustomerDetails}
                        setNewCustomerDetails={setNewCustomerDetails}
                        handleSaveNewCustomer={handleSaveNewCustomer}
                    />
                )}
            </div>
        </Navbar>
    );
}
