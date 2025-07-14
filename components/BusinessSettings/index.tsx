import React, { useState } from "react";
import { toast } from "sonner";

const BusinessSettingsForm: React.FC = () => {
    const [businessName, setBusinessName] = useState("");
    const [businessLogo, setBusinessLogo] = useState<File | null>(null);
    const [vatRate, setVatRate] = useState("");
    const [withholdingTaxRate, setWithholdingTaxRate] = useState("");
    const [invoicePrefix, setInvoicePrefix] = useState("");
    const [financialYearStart, setFinancialYearStart] = useState("");
    const [defaultPaymentTerms, setDefaultPaymentTerms] = useState("");

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setBusinessLogo(e.target.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission logic
        toast.warning("Business settings logic not implemented!");
    };

    return (
        <section>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Business Settings
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                    Configure your business information and default settings for
                    invoices and documents.
                </p>
            </header>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                <div>
                    <label
                        htmlFor="businessName"
                        className="block text-sm font-medium text-gray-900"
                    >
                        Business Name
                    </label>
                    <input
                        type="text"
                        id="businessName"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="outline-none bg-slate-50 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter your business name"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        This name will appear on all invoices and documents
                    </p>
                </div>

                <div>
                    <label
                        htmlFor="businessLogo"
                        className="block text-sm font-medium text-gray-900"
                    >
                        Business Logo
                    </label>
                    <input
                        type="file"
                        id="businessLogo"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-500 hover:file:bg-green-100"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        Upload a logo for your documents and invoices
                    </p>
                </div>

                <button
                    type="submit"
                    className="btn btn-md btn-ghost text-black flex items-center bg-green-400 w-full mt-8"
                >
                    Save Business Settings
                </button>
            </form>
        </section>
    );
};

export default BusinessSettingsForm;
