"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { Invoice } from "@/lib/types";
import { format } from "date-fns";
import { getColorTemplate } from "@/lib/color-templates";

// Register fonts for better typography (optional)
// Font.register({
//   family: 'Inter',
//   src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2'
// });

interface InvoicePDFProps {
  invoice: Invoice;
  colorTemplateId?: string;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const createDynamicStyles = (colorTemplateId: string) => {
  const colorTemplate = getColorTemplate(colorTemplateId);
  
  return StyleSheet.create({
    page: {
      fontFamily: "Helvetica",
      fontSize: 10,
      padding: 25,
      lineHeight: 1.3,
    },
    header: {
      marginBottom: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: colorTemplate.colors.primary,
      marginBottom: 10,
    },
    invoiceInfo: {
      fontSize: 9,
      marginBottom: 2,
      color: colorTemplate.colors.secondary,
    },
    billingSection: {
      flexDirection: "row",
      marginBottom: 20,
      gap: 20,
    },
    billingBox: {
      flex: 1,
      backgroundColor: colorTemplate.colors.primaryLight,
      padding: 12,
      borderRadius: 4,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: "bold",
      color: colorTemplate.colors.primary,
      marginBottom: 8,
    },
    addressLine: {
      fontSize: 9,
      marginBottom: 2,
      color: colorTemplate.colors.secondary,
    },
    companyName: {
      fontSize: 9,
      fontWeight: "bold",
      marginBottom: 2,
      color: colorTemplate.colors.text,
    },
    table: {
      marginBottom: 20,
    },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: colorTemplate.colors.primary,
      borderTopLeftRadius: 4,
      borderTopRightRadius: 4,
      paddingTop: 8,
      paddingBottom: 8,
      paddingLeft: 8,
      paddingRight: 8,
    },
    tableHeaderText: {
      color: "white",
      fontWeight: "bold",
      fontSize: 9,
    },
    tableRow: {
      flexDirection: "row",
      paddingTop: 8,
      paddingBottom: 8,
      paddingLeft: 8,
      paddingRight: 8,
      borderBottomWidth: 1,
      borderBottomColor: colorTemplate.colors.border,
    },
    tableRowAlt: {
      backgroundColor: colorTemplate.colors.background,
    },
    tableCell: {
      fontSize: 9,
      color: colorTemplate.colors.text,
    },
    tableCellBold: {
      fontSize: 9,
      fontWeight: "bold",
      color: colorTemplate.colors.text,
    },
    itemName: {
      flex: 3,
    },
    itemQuantity: {
      flex: 1,
      textAlign: "center",
    },
    itemRate: {
      flex: 1,
      textAlign: "center",
    },
    itemAmount: {
      flex: 1,
      textAlign: "right",
    },
    totalSection: {
      alignItems: "flex-end",
      marginBottom: 20,
    },
    totalBox: {
      width: 200,
      borderColor: colorTemplate.colors.border,
      paddingTop: 10,
      paddingBottom: 10,
    },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 5,
    },
    totalLabel: {
      fontSize: 9,
      color: colorTemplate.colors.secondary,
    },
    totalAmount: {
      fontSize: 9,
      fontWeight: "bold",
    },
    grandTotalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingTop: 8,
      paddingBottom: 8,
      paddingLeft: 4,
      paddingRight: 4,
      borderTopWidth: 1,
      borderTopColor: colorTemplate.colors.border,
      borderBottomWidth: 1,
      borderBottomColor: colorTemplate.colors.border,
    },
    grandTotalLabel: {
      fontSize: 12,
      fontWeight: "bold",
    },
    grandTotalAmount: {
      fontSize: 12,
      fontWeight: "bold",
    },
    notesSection: {
      marginTop: 20,
      backgroundColor: colorTemplate.colors.background,
      padding: 10,
      borderRadius: 4,
    },
    notesTitle: {
      fontSize: 10,
      fontWeight: "bold",
      color: colorTemplate.colors.secondary,
      marginBottom: 5,
    },
    notesText: {
      fontSize: 9,
      color: colorTemplate.colors.textLight,
      lineHeight: 1.4,
    },
  });
};

export default function InvoicePDF({ invoice, colorTemplateId = 'purple' }: InvoicePDFProps) {
  const dynamicStyles = createDynamicStyles(colorTemplateId);
  
  return (
    <Document>
      <Page size="A4" style={dynamicStyles.page}>
        {/* Header */}
        <View style={dynamicStyles.header}>
          <Text style={dynamicStyles.title}>Invoice</Text>
          <View
            style={{
              marginBottom: 5,
              flexDirection: "column",
              display: "flex",
              justifyContent: "space-between",
              gap: 1,
              marginTop: 8,
            }}
          >
            <Text style={dynamicStyles.invoiceInfo}>
              Invoice No:{" "}
              <Text style={{ fontWeight: "bold" }}>
                #{invoice.invoiceNumber}
              </Text>
            </Text>
            <Text style={dynamicStyles.invoiceInfo}>
              Invoice Date:{" "}
              <Text style={{ fontWeight: "bold" }}>
                {format(new Date(invoice.invoiceDate), "MMM dd, yyyy")}
              </Text>
            </Text>
            <Text style={dynamicStyles.invoiceInfo}>
              Due Date:{" "}
              <Text style={{ fontWeight: "bold" }}>
                {format(new Date(invoice.dueDate), "MMM dd, yyyy")}
              </Text>
            </Text>
          </View>
        </View>

        {/* Billing Information */}
        <View style={dynamicStyles.billingSection}>
          {/* Billed By */}
          <View style={dynamicStyles.billingBox}>
            <Text style={dynamicStyles.sectionTitle}>Billed By</Text>
            <Text style={dynamicStyles.companyName}>{invoice.businessInfo.name}</Text>
            <Text style={dynamicStyles.addressLine}>
              {invoice.businessInfo.address.line1}
            </Text>
            {invoice.businessInfo.address.line2 && (
              <Text style={dynamicStyles.addressLine}>
                {invoice.businessInfo.address.line2}
              </Text>
            )}
            <Text style={dynamicStyles.addressLine}>
              {invoice.businessInfo.address.city}
              {invoice.businessInfo.address.state &&
                `, ${invoice.businessInfo.address.state}`}
            </Text>
            <Text style={dynamicStyles.addressLine}>
              {invoice.businessInfo.address.country} -{" "}
              {invoice.businessInfo.address.postalCode}
            </Text>
            <Text style={[dynamicStyles.addressLine, { marginTop: 5 }]}>
              Email: {invoice.businessInfo.email}
            </Text>
            <Text style={dynamicStyles.addressLine}>
              Phone: {invoice.businessInfo.phone}
            </Text>
          </View>

          {/* Billed To */}
          <View style={dynamicStyles.billingBox}>
            <Text style={dynamicStyles.sectionTitle}>Billed To</Text>
            {invoice.customer.companyName ? (
              <Text style={dynamicStyles.companyName}>
                {invoice.customer.companyName} - {invoice.customer.name}
              </Text>
            ) : (
              <Text style={dynamicStyles.companyName}>{invoice.customer.name}</Text>
            )}
            <Text style={dynamicStyles.addressLine}>
              {invoice.customer.address.line1}
            </Text>
            {invoice.customer.address.line2 && (
              <Text style={dynamicStyles.addressLine}>
                {invoice.customer.address.line2}
              </Text>
            )}
            <Text style={dynamicStyles.addressLine}>
              {invoice.customer.address.city}
              {invoice.customer.address.state &&
                `, ${invoice.customer.address.state}`}
            </Text>
            <Text style={dynamicStyles.addressLine}>
              {invoice.customer.address.country}
            </Text>
            <Text style={[dynamicStyles.addressLine, { marginTop: 5 }]}>
              Email: {invoice.customer.email}
            </Text>
            {invoice.customer.phone && (
              <Text style={dynamicStyles.addressLine}>
                Phone: {invoice.customer.phone}
              </Text>
            )}
          </View>
        </View>

        {/* Items Table */}
        <View style={dynamicStyles.table}>
          {/* Table Header */}
          <View style={dynamicStyles.tableHeader}>
            <Text style={[dynamicStyles.tableHeaderText, dynamicStyles.itemName]}>Item</Text>
            <Text style={[dynamicStyles.tableHeaderText, dynamicStyles.itemQuantity]}>
              Quantity
            </Text>
            <Text style={[dynamicStyles.tableHeaderText, dynamicStyles.itemRate]}>Rate</Text>
            <Text style={[dynamicStyles.tableHeaderText, dynamicStyles.itemAmount]}>
              Amount
            </Text>
          </View>

          {/* Table Rows */}
          {invoice.items.map((item, index) => (
            <View
              key={item.id}
              style={[
                dynamicStyles.tableRow,
                index % 2 === 0 ? dynamicStyles.tableRowAlt : {},
              ]}
            >
              <View style={dynamicStyles.itemName}>
                <Text style={dynamicStyles.tableCellBold}>{item.name}</Text>
                {item.description && (
                  <Text
                    style={[
                      dynamicStyles.tableCell,
                      { fontSize: 8, color: "#6b7280" },
                    ]}
                  >
                    {item.description}
                  </Text>
                )}
              </View>
              <Text style={[dynamicStyles.tableCell, dynamicStyles.itemQuantity]}>
                {item.quantity}
              </Text>
              <Text style={[dynamicStyles.tableCell, dynamicStyles.itemRate]}>
                {formatCurrency(item.rate)}
              </Text>
              <Text style={[dynamicStyles.tableCellBold, dynamicStyles.itemAmount]}>
                {formatCurrency(item.amount)}
              </Text>
            </View>
          ))}
        </View>

        {/* Total Section */}
        <View style={dynamicStyles.totalSection}>
          <View style={dynamicStyles.totalBox}>
            {invoice.tax && invoice.tax.amount > 0 ? (
              <>
                <View style={dynamicStyles.totalRow}>
                  <Text style={dynamicStyles.totalLabel}>Subtotal:</Text>
                  <Text style={dynamicStyles.totalAmount}>
                    {formatCurrency(invoice.subtotal)}
                  </Text>
                </View>
                <View style={dynamicStyles.totalRow}>
                  <Text style={dynamicStyles.totalLabel}>
                    Tax ({(invoice.tax.rate * 100).toFixed(1)}%):
                  </Text>
                  <Text style={dynamicStyles.totalAmount}>
                    {formatCurrency(invoice.tax.amount)}
                  </Text>
                </View>
                <View style={dynamicStyles.grandTotalRow}>
                  <Text style={dynamicStyles.grandTotalLabel}>Total (USD):</Text>
                  <Text style={dynamicStyles.grandTotalAmount}>
                    {formatCurrency(invoice.total)}
                  </Text>
                </View>
              </>
            ) : (
              <View style={dynamicStyles.grandTotalRow}>
                <Text style={dynamicStyles.grandTotalLabel}>Total (USD):</Text>
                <Text style={dynamicStyles.grandTotalAmount}>
                  {formatCurrency(invoice.total)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Notes */}
        {invoice.notes && (
          <View style={dynamicStyles.notesSection}>
            <Text style={dynamicStyles.notesTitle}>Notes:</Text>
            <Text style={dynamicStyles.notesText}>{invoice.notes}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}
