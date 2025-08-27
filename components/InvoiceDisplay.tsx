"use client";

import { Invoice } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { getColorTemplate } from "@/lib/color-templates";

interface InvoiceDisplayProps {
  invoice: Invoice;
  className?: string;
  colorTemplateId?: string;
}

export default function InvoiceDisplay({
  invoice,
  className = "",
  colorTemplateId,
}: InvoiceDisplayProps) {
  const [colorTemplate, setColorTemplate] = useState(() => getColorTemplate('purple')); // Default fallback

  useEffect(() => {
    // If colorTemplateId is provided as prop, use it directly
    if (colorTemplateId) {
      setColorTemplate(getColorTemplate(colorTemplateId));
      return;
    }

    // Otherwise fetch from settings
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const settings = await response.json();
          setColorTemplate(getColorTemplate(settings.colorTemplate));
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
        // Keep default template on error
      }
    };

    fetchSettings();
  }, [colorTemplateId]);

  return (
    <div
      className={`bg-white pdf-container ${className}`}
      id="invoice-display"
            style={{
        // Responsive container for web viewing
        maxWidth: '800px',
        margin: '0 auto',
        padding: '2rem',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '8mm' }}>
        <div style={{ marginBottom: '6mm' }}>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: colorTemplate.colors.primary, 
            marginBottom: '4mm',
            margin: '0 0 4mm 0'
          }}>
            Invoice
          </h1>
          <div style={{ fontSize: '11px', lineHeight: '1.5' }}>
            <div style={{ marginBottom: '2mm' }}>
              <span style={{ color: colorTemplate.colors.textLight }}>Invoice No # </span>
              <span style={{ fontWeight: '600' }}>{invoice.invoiceNumber}</span>
            </div>
            <div style={{ marginBottom: '2mm' }}>
              <span style={{ color: colorTemplate.colors.textLight }}>Invoice Date: </span>
              <span style={{ fontWeight: '600' }}>
                {format(new Date(invoice.invoiceDate), "MMM dd, yyyy")}
              </span>
            </div>
            <div>
              <span style={{ color: colorTemplate.colors.textLight }}>Due Date: </span>
              <span style={{ fontWeight: '600' }}>
                {format(new Date(invoice.dueDate), "MMM dd, yyyy")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Billing Information */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '8mm', 
        marginBottom: '8mm' 
      }}>
        {/* Billed By */}
        <div style={{ 
          backgroundColor: colorTemplate.colors.primaryLight, 
          padding: '6mm', 
          borderRadius: '3mm' 
        }}>
          <h2 style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            color: colorTemplate.colors.primary, 
            marginBottom: '4mm',
            margin: '0 0 4mm 0'
          }}>
            Billed By
          </h2>
          <div style={{ fontSize: '11px', lineHeight: '1.5' }}>
            <div style={{ fontWeight: '600', marginBottom: '1mm' }}>
              {invoice.businessInfo.name}
            </div>
            <div style={{ marginBottom: '1mm' }}>
              {invoice.businessInfo.address.line1}
            </div>
            {invoice.businessInfo.address.line2 && (
              <div style={{ marginBottom: '1mm' }}>
                {invoice.businessInfo.address.line2}
              </div>
            )}
            <div style={{ marginBottom: '1mm' }}>
              {invoice.businessInfo.address.city}
              {invoice.businessInfo.address.state &&
                `, ${invoice.businessInfo.address.state}`}
            </div>
            <div style={{ marginBottom: '1mm' }}>
              {invoice.businessInfo.address.country} -{" "}
              {invoice.businessInfo.address.postalCode}
            </div>
            <div style={{ marginBottom: '1mm', marginTop: '2mm' }}>
              Email: {invoice.businessInfo.email}
            </div>
            <div>Phone: {invoice.businessInfo.phone}</div>
          </div>
        </div>

        {/* Billed To */}
        <div style={{ 
          backgroundColor: colorTemplate.colors.primaryLight, 
          padding: '6mm', 
          borderRadius: '3mm' 
        }}>
          <h2 style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            color: colorTemplate.colors.primary, 
            marginBottom: '4mm',
            margin: '0 0 4mm 0'
          }}>
            Billed To
          </h2>
          <div style={{ fontSize: '11px', lineHeight: '1.5' }}>
            {invoice.customer.companyName && (
              <div style={{ fontWeight: '600', marginBottom: '1mm' }}>
                {invoice.customer.companyName} - {invoice.customer.name}
              </div>
            )}
            {!invoice.customer.companyName && (
              <div style={{ fontWeight: '600', marginBottom: '1mm' }}>
                {invoice.customer.name}
              </div>
            )}
            <div style={{ marginBottom: '1mm' }}>
              {invoice.customer.address.line1}
            </div>
            {invoice.customer.address.line2 && (
              <div style={{ marginBottom: '1mm' }}>
                {invoice.customer.address.line2}
              </div>
            )}
            <div style={{ marginBottom: '1mm' }}>
              {invoice.customer.address.city}
              {invoice.customer.address.state &&
                `, ${invoice.customer.address.state}`}
            </div>
            <div style={{ marginBottom: '1mm' }}>
              {invoice.customer.address.country}
            </div>
            <div style={{ marginTop: '2mm', marginBottom: '1mm' }}>
              Email: {invoice.customer.email}
            </div>
            {invoice.customer.phone && (
              <div>Phone: {invoice.customer.phone}</div>
            )}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div style={{ marginBottom: '8mm' }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          fontSize: '11px'
        }}>
          <thead>
            <tr style={{ backgroundColor: colorTemplate.colors.primary, color: 'white' }}>
              <th style={{ 
                textAlign: 'left', 
                padding: '3mm', 
                fontWeight: '600', 
                color: 'white',
                borderBottom: '1px solid #ddd'
              }}>
                Item
              </th>
              <th style={{ 
                textAlign: 'center', 
                padding: '3mm', 
                fontWeight: '600', 
                color: 'white',
                borderBottom: '1px solid #ddd',
                width: '20mm'
              }}>
                Quantity
              </th>
              <th style={{ 
                textAlign: 'center', 
                padding: '3mm', 
                fontWeight: '600', 
                color: 'white',
                borderBottom: '1px solid #ddd',
                width: '25mm'
              }}>
                Rate
              </th>
              <th style={{ 
                textAlign: 'right', 
                padding: '3mm', 
                fontWeight: '600', 
                color: 'white',
                borderBottom: '1px solid #ddd',
                width: '25mm'
              }}>
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr
                key={item.id}
                style={{ 
                  backgroundColor: index % 2 === 0 ? colorTemplate.colors.background : "white"
                }}
              >
                <td style={{ 
                  padding: '3mm', 
                  borderBottom: `1px solid ${colorTemplate.colors.border}`
                }}>
                  <div style={{ fontWeight: '600', marginBottom: '1mm' }}>
                    {item.name}
                  </div>
                  {item.description && (
                    <div style={{ 
                      fontSize: '10px', 
                      color: colorTemplate.colors.textLight,
                      marginTop: '1mm'
                    }}>
                      {item.description}
                    </div>
                  )}
                </td>
                <td style={{ 
                  textAlign: 'center', 
                  padding: '3mm', 
                  borderBottom: `1px solid ${colorTemplate.colors.border}`
                }}>
                  {item.quantity}
                </td>
                <td style={{ 
                  textAlign: 'center', 
                  padding: '3mm', 
                  borderBottom: `1px solid ${colorTemplate.colors.border}`
                }}>
                  {formatCurrency(item.rate)}
                </td>
                <td style={{ 
                  textAlign: 'right', 
                  padding: '3mm', 
                  fontWeight: '600', 
                  borderBottom: `1px solid ${colorTemplate.colors.border}`
                }}>
                  {formatCurrency(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Total */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ width: '70mm' }}>
          <div style={{ 
            borderTop: `1px solid ${colorTemplate.colors.border}`,
            borderBottom: `1px solid ${colorTemplate.colors.border}`,
            padding: '4mm'
          }}>
            {invoice.tax && invoice.tax.amount > 0 && (
              <>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '2mm',
                  fontSize: '11px'
                }}>
                  <span style={{ color: colorTemplate.colors.secondary }}>Subtotal:</span>
                  <span style={{ fontWeight: '600' }}>
                    {formatCurrency(invoice.subtotal)}
                  </span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '3mm',
                  fontSize: '11px'
                }}>
                  <span style={{ color: colorTemplate.colors.secondary }}>
                    Tax ({(invoice.tax.rate * 100).toFixed(1)}%):
                  </span>
                  <span style={{ fontWeight: '600' }}>
                    {formatCurrency(invoice.tax.amount)}
                  </span>
                </div>
                <div style={{ 
                  borderTop: `1px solid ${colorTemplate.colors.border}`, 
                  paddingTop: '3mm'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>
                    <span>Total (USD):</span>
                    <span>{formatCurrency(invoice.total)}</span>
                  </div>
                </div>
              </>
            )}
            {(!invoice.tax || invoice.tax.amount === 0) && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                <span>Total (USD):</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div style={{ 
          marginTop: '8mm', 
          padding: '4mm', 
          backgroundColor: colorTemplate.colors.background, 
          borderRadius: '2mm'
        }}>
          <h3 style={{ 
            fontWeight: '600', 
            color: colorTemplate.colors.secondary, 
            marginBottom: '2mm',
            fontSize: '12px',
            margin: '0 0 2mm 0'
          }}>
            Notes:
          </h3>
          <p style={{ 
            fontSize: '11px', 
            color: colorTemplate.colors.textLight,
            lineHeight: '1.5',
            margin: '0'
          }}>
            {invoice.notes}
          </p>
        </div>
      )}
    </div>
  );
}
