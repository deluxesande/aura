import React from "react";
import { Edit, Trash, ChevronLeft, ChevronRight } from "lucide-react";
import { Invoice } from "@/utils/typesDefinitions";
import { useRouter } from "next/navigation";

// Extend the Invoice interface
interface ExtendedInvoice extends Invoice {
    itemName?: string;
    totalQuantity?: number;
}
export default function InvoicesTable({
    title,
    invoices,
    handleDelete,
}: {
    title: string;
    invoices: ExtendedInvoice[];
    handleDelete: (invoiceId: string) => void;
}) {
    const router = useRouter();

    const handleRowClick = (invoiceId: string) => {
        router.push(`/invoice?id=${invoiceId}`);
    };

    return (
        <div className="p-4 card bg-white shadow-lg rounded-lg mt-4">
            <h1 className="text-2xl font-bold mb-6 text-gray-400">{title}</h1>

            {/* Table for larger screens */}
            <div className="hidden lg:block">
                <div className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                            <thead>
                                <tr>
                                    <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-400">
                                        ID
                                    </th>
                                    <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-400">
                                        Product Name
                                    </th>
                                    <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-400">
                                        M-pesa Ref.
                                    </th>
                                    <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-400">
                                        Quantity
                                    </th>
                                    <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-400">
                                        Amount
                                    </th>
                                    <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-400">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="py-2 px-4 text-black text-lg text-center"
                                        >
                                            No Invoices
                                        </td>
                                    </tr>
                                ) : (
                                    invoices?.map((invoice, index) => (
                                        <tr
                                            key={index}
                                            className="hover:bg-gray-100 cursor-pointer"
                                        >
                                            <td className="py-2 px-4 border-b text-black text-sm border-gray-100">
                                                <p className="truncate w-20">
                                                    {invoice.id}
                                                </p>
                                            </td>
                                            <td className="py-2 px-4 border-b text-black text-sm border-gray-100">
                                                <p>{invoice.itemName}</p>
                                            </td>
                                            <td className="py-2 px-4 border-b text-black text-sm border-gray-100">
                                                OOOP-{index + 1}
                                            </td>
                                            <td className="py-2 px-4 border-b text-black text-sm border-gray-100">
                                                {invoice.totalQuantity}
                                            </td>
                                            <td className="py-2 px-4 border-b text-black text-sm border-gray-100">
                                                ${invoice.totalAmount}
                                            </td>
                                            <td className="py-2 px-4 border-b border-gray-100 flex items-center">
                                                <button
                                                    className="btn btn-sm btn-ghost text-black"
                                                    onClick={() =>
                                                        handleRowClick(
                                                            String(invoice.id)
                                                        )
                                                    }
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <div className="border-l border-gray-300 h-4 mx-1"></div>
                                                <button
                                                    className="btn btn-sm btn-ghost text-black"
                                                    onClick={() =>
                                                        handleDelete(
                                                            String(invoice.id)
                                                        )
                                                    }
                                                >
                                                    <Trash className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Card tiles for smaller screens */}
            <div className="block lg:hidden">
                {invoices.length === 0 ? (
                    <p className="text-black text-lg text-center">
                        No Invoices
                    </p>
                ) : (
                    <div className="flex flex-col space-y-4">
                        {invoices.map((invoice, index) => (
                            <div
                                key={index}
                                className="p-4 border rounded-lg shadow-sm bg-gray-50"
                            >
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg font-bold">
                                        {invoice.itemName}
                                    </h3>
                                    <span className="text-sm text-gray-600">
                                        {invoice.totalQuantity}
                                    </span>
                                </div>
                                <p className="text-sm truncate w-32 text-gray-400 mt-1">
                                    {invoice.id}
                                </p>
                                <div className="flex justify-between items-center mt-2">
                                    <p className="text-lg  text-gray-800">
                                        ${invoice.totalAmount}
                                    </p>
                                    <div className="flex space-x-2">
                                        <button
                                            className="btn btn-sm btn-ghost text-black"
                                            onClick={() =>
                                                handleRowClick(
                                                    String(invoice.id)
                                                )
                                            }
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            className="btn btn-sm btn-ghost text-black"
                                            onClick={() =>
                                                handleDelete(String(invoice.id))
                                            }
                                        >
                                            <Trash className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center pt-4 my-4 space-x-4">
                <button className="btn btn-sm btn-ghost text-black flex items-center bg-gray-100">
                    <ChevronLeft className="w-4 h-4" />
                    <span className="ml-2">Back</span>
                </button>
                <div className="flex space-x-2">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <button
                            key={index}
                            className={`btn btn-sm ${
                                index === 0
                                    ? "bg-black text-white"
                                    : "btn-ghost"
                            } text-black`}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
                <button className="btn btn-sm btn-ghost text-black flex items-center bg-gray-100">
                    <span className="mr-2">Next</span>
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
