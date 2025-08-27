"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import { Invoice } from "@/lib/types";
import { COLOR_TEMPLATES, getColorTemplate } from "@/lib/color-templates";

import InvoiceDisplay from "@/components/InvoiceDisplay";
import InvoicePDF from "@/components/InvoicePDF";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import { 
  ChevronLeft, 
  Edit, 
  Check, 
  X, 
  Printer, 
  Download, 
  Monitor, 
  FileText, 
  Copy,
  Send,
  CheckCircle,
  Palette
} from "lucide-react";

export default function InvoiceViewPage() {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [colorTemplateId, setColorTemplateId] = useState<string>('indigo'); // Start with indigo to match your recent change
  const [showColorSelector, setShowColorSelector] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditingNumber, setIsEditingNumber] = useState(false);
  const [editedInvoiceNumber, setEditedInvoiceNumber] = useState("");
  const [numberError, setNumberError] = useState("");
  const [viewType, setViewType] = useState<"display" | "pdf">("display");

  useEffect(() => {
    if (params.id) {
      fetchInvoice(params.id as string);
    }
    fetchSettings();
  }, [params.id]);

  // Close color selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showColorSelector && !target.closest('.color-selector-container')) {
        setShowColorSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showColorSelector]);

  const fetchInvoice = async (id: string) => {
    try {
      const response = await fetch(`/api/invoices/${id}`);
      if (!response.ok) throw new Error("Failed to fetch invoice");
      const data = await response.json();
      setInvoice(data);
    } catch (error) {
      console.error("Error fetching invoice:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const settings = await response.json();
        setColorTemplateId(settings.colorTemplate);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Keep default template on error
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleStatusChange = async (newStatus: Invoice["status"]) => {
    if (!invoice) return;

    try {
      const response = await fetch(`/api/invoices/${invoice.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error("Failed to update invoice");
      setInvoice((prev) => (prev ? { ...prev, status: newStatus } : null));
    } catch (error) {
      console.error("Error updating invoice status:", error);
      alert("Error updating invoice status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "text-green-600 bg-green-100 border-green-200";
      case "sent":
        return "text-blue-600 bg-blue-100 border-blue-200";
      case "draft":
        return "text-gray-600 bg-gray-100 border-gray-200";
      case "overdue":
        return "text-red-600 bg-red-100 border-red-200";
      default:
        return "text-gray-600 bg-gray-100 border-gray-200";
    }
  };

  const handleEditInvoiceNumber = () => {
    if (!invoice) return;
    setEditedInvoiceNumber(invoice.invoiceNumber);
    setIsEditingNumber(true);
    setNumberError("");
  };

  const handleCancelEdit = () => {
    setIsEditingNumber(false);
    setEditedInvoiceNumber("");
    setNumberError("");
  };

  const validateInvoiceNumber = async (
    invoiceNumber: string
  ): Promise<boolean> => {
    if (!invoiceNumber.trim()) {
      setNumberError("Invoice number is required");
      return false;
    }

    if (!invoice) return false;

    try {
      const response = await fetch("/api/invoices/validate-number", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceNumber: invoiceNumber.trim(),
          excludeId: invoice.id,
        }),
      });

      const result = await response.json();

      if (!result.isUnique) {
        setNumberError("This invoice number already exists");
        return false;
      }

      return true;
    } catch (error) {
      setNumberError("Error validating invoice number");
      return false;
    }
  };

  const handleSaveInvoiceNumber = async () => {
    if (!invoice) return;

    const isValid = await validateInvoiceNumber(editedInvoiceNumber);
    if (!isValid) return;

    try {
      const response = await fetch(`/api/invoices/${invoice.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceNumber: editedInvoiceNumber.trim() }),
      });

      if (!response.ok) throw new Error("Failed to update invoice number");

      const updatedInvoice = await response.json();
      setInvoice(updatedInvoice);
      setIsEditingNumber(false);
      setEditedInvoiceNumber("");
      setNumberError("");
    } catch (error) {
      console.error("Error updating invoice number:", error);
      setNumberError("Failed to update invoice number");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Invoice not found
        </h3>
        <p className="text-gray-500 mb-4">
          The invoice you&apos;re looking for doesn&apos;t exist.
        </p>
        <button
          onClick={() => router.push("/invoices")}
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Invoices
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {isEditingNumber ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => router.push("/invoices")}
                      className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" />
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">
                      Invoice
                    </h1>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editedInvoiceNumber}
                        onChange={(e) => setEditedInvoiceNumber(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveInvoiceNumber();
                          if (e.key === "Escape") handleCancelEdit();
                        }}
                        className="text-3xl font-bold text-gray-900 bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveInvoiceNumber}
                        className="p-1 text-green-600 hover:text-green-700 transition-colors"
                        title="Save"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                        title="Cancel"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    {numberError && (
                      <span className="text-red-500 text-sm mt-1">
                        {numberError}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => router.push("/invoices")}
                      className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" />
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">
                      Invoice {invoice.invoiceNumber}
                    </h1>
                  </div>
                  <button
                    onClick={handleEditInvoiceNumber}
                    className="p-1 text-gray-500 hover:text-purple-600 transition-colors"
                    title="Edit invoice number"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center mt-2">
              <span className="text-gray-600 mr-3">Status:</span>
              <select
                value={invoice.status}
                onChange={(e) =>
                  handleStatusChange(e.target.value as Invoice["status"])
                }
                className={`px-2 py-1 text-sm font-semibold rounded-md  border ${getStatusColor(
                  invoice.status
                )}`}
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print
          </button>

          {invoice && (
            <PDFDownloadLink
              document={<InvoicePDF invoice={invoice} colorTemplateId={colorTemplateId} />}
              fileName={`invoice-${invoice.invoiceNumber}.pdf`}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {({ blob, url, loading, error }) => (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  {loading ? "Generating PDF..." : "Download PDF"}
                </>
              )}
            </PDFDownloadLink>
          )}

          <button
            onClick={() => router.push(`/invoices/${invoice.id}/edit`)}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </button>
        </div>
      </div>

      {/* Invoice Display */}
      <div className="print:shadow-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setViewType("display")}
              className={`inline-flex items-center px-4 py-2 text-white rounded-lg  transition-colors ${
                viewType === "display" ? "bg-purple-700" : "bg-gray-600"
              }`}
            >
              <Monitor className="mr-2 h-4 w-4" />
              Display
            </button>
            <button
              onClick={() => setViewType("pdf")}
              className={`inline-flex items-center px-4 py-2 text-white rounded-lg  transition-colors ${
                viewType === "pdf" ? "bg-purple-700" : "bg-gray-600"
              }`}
            >
              <FileText className="mr-2 h-4 w-4" />
              PDF
            </button>
          </div>

          {/* Color Template Selector */}
          <div className="relative color-selector-container">
            <button
              onClick={() => setShowColorSelector(!showColorSelector)}
              className="inline-flex items-center px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all"
              style={{ 
                backgroundColor: getColorTemplate(colorTemplateId).colors.primary
              }}
            >
              <Palette className="mr-2 h-4 w-4" />
              Colors
              <div 
                className="ml-2 w-3 h-3 rounded-full border border-white/30"
                style={{ backgroundColor: getColorTemplate(colorTemplateId).colors.accent }}
              />
            </button>

            {showColorSelector && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Choose Color Theme</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {COLOR_TEMPLATES.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => {
                          setColorTemplateId(template.id);
                          setShowColorSelector(false);
                        }}
                        className={`p-3 border rounded-lg text-left hover:shadow-md transition-all ${
                          colorTemplateId === template.id
                            ? `border-2`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={colorTemplateId === template.id ? {
                          borderColor: template.colors.primary,
                          backgroundColor: template.colors.primaryLight
                        } : {}}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div
                            className="w-4 h-4 rounded-full border border-gray-200"
                            style={{ backgroundColor: template.colors.primary }}
                          />
                          {colorTemplateId === template.id && (
                            <div className="text-xs font-medium" style={{ color: template.colors.primary }}>Selected</div>
                          )}
                        </div>
                        
                        <div className="mb-2">
                          <h4 className="font-medium text-gray-900 text-xs mb-1">{template.name}</h4>
                          <p className="text-gray-500 text-xs leading-tight">{template.description}</p>
                        </div>
                        
                        <div className="flex space-x-1">
                          <div
                            className="w-2 h-2 rounded-sm"
                            style={{ backgroundColor: template.colors.primary }}
                          />
                          <div
                            className="w-2 h-2 rounded-sm"
                            style={{ backgroundColor: template.colors.primaryLight }}
                          />
                          <div
                            className="w-2 h-2 rounded-sm"
                            style={{ backgroundColor: template.colors.accent }}
                          />
                          <div
                            className="w-2 h-2 rounded-sm"
                            style={{ backgroundColor: template.colors.background }}
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-gray-500 text-center">
                    Preview only - changes won't be saved
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-3 justify-center mt-6">
          {viewType === "display" && (
            <InvoiceDisplay
              invoice={invoice}
              className="border border-gray-200 rounded-lg print:border-0 print:rounded-none"
              colorTemplateId={colorTemplateId}
            />
          )}
          {viewType === "pdf" && (
            <PDFViewer
              style={{ width: "50%", height: "100%", minHeight: "100vh" }}
            >
              <InvoicePDF invoice={invoice} colorTemplateId={colorTemplateId} />
            </PDFViewer>
          )}
        </div>
      </div>

      {/* Invoice Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Invoice Information
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Created:</span>
              <span>{new Date(invoice.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Updated:</span>
              <span>{new Date(invoice.updatedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                  invoice.status
                ).replace("border-", "border border-")}`}
              >
                {invoice.status}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            {invoice.status === "draft" && (
              <button
                onClick={() => handleStatusChange("sent")}
                className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Send className="mr-2 h-4 w-4" />
                Mark as Sent
              </button>
            )}

            {(invoice.status === "sent" || invoice.status === "overdue") && (
              <button
                onClick={() => handleStatusChange("paid")}
                className="w-full inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Paid
              </button>
            )}

            <button
              onClick={() =>
                router.push(`/invoices/create?duplicate=${invoice.id}`)
              }
              className="w-full inline-flex items-center justify-center px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              <Copy className="mr-2 h-4 w-4" />
              Duplicate Invoice
            </button>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:shadow-none,
          .print\\:shadow-none * {
            visibility: visible;
          }
          .print\\:shadow-none {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:border-0 {
            border: 0 !important;
          }
          .print\\:rounded-none {
            border-radius: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
