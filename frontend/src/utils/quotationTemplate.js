// Template de cotización EXACTO
import { generateMedicalInvoiceHTML } from './medicalInvoiceTemplate';

export const generateQuotationPrintHTML = (quotation, formatCurrency, formatDate, organizationData = null) => {
  return generateMedicalInvoiceHTML(quotation, formatCurrency, formatDate, organizationData, 'Cotización');
};

export const generateQuotationPrintHTMLOLD2 = (quotation, formatCurrency, formatDate, organizationData = null) => {
  // Construir URLs completas
  let logoUrl = null;
  let stampUrl = null;
  
  if (organizationData?.logo_url) {
    logoUrl = organizationData.logo_url.startsWith('http') 
      ? organizationData.logo_url 
      : `http://localhost:8000${organizationData.logo_url}`;
  }
  
  if (organizationData?.stamp_url) {
    stampUrl = organizationData.stamp_url.startsWith('http') 
      ? organizationData.stamp_url 
      : `http://localhost:8000${organizationData.stamp_url}`;
  }
  
  const companyName = organizationData?.name || 'ZIBAMED, S.R.L.';
  const rnc = organizationData?.rnc || '133141851';
  const address = organizationData?.address || 'Calle Ortega y Gasset Esquina 36';
  const city = organizationData?.city || 'Santo Domingo de Guzmán';
  const addressNumber = organizationData?.address_number || '70';
  const website = organizationData?.website || 'zibamed.com';
  const invoiceEmail = organizationData?.invoice_email || organizationData?.email || 'gerencia@zibamed.com';
  const phone = organizationData?.phone || '+1829-404-7754';

  const subtotal = quotation.subtotal || 0;
  const taxAmount = quotation.tax_amount || (subtotal * (quotation.tax_rate || 0) / 100);
  const discount = quotation.discount_amount || 0;
  const total = quotation.total_amount || (subtotal + taxAmount - discount);

  // Construir dirección completa
  let fullAddress = '';
  if (address) {
    fullAddress = address;
    if (addressNumber) fullAddress += `, no. ${addressNumber}`;
    if (city) fullAddress += ` - ${city}`;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Cotización #${quotation.quotation_number || quotation.id}</title>
      <style>
        @page { 
          margin: 0.4in 0.5in; 
          size: letter; 
        }
        
        * { 
          margin: 0; 
          padding: 0; 
          box-sizing: border-box; 
        }
        
        body { 
          font-family: Arial, Helvetica, sans-serif;
          font-size: 10px;
          color: #000;
          line-height: 1.2;
          background: white;
        }
        
        /* HEADER */
        .header-container {
          display: table;
          width: 100%;
          margin-bottom: 10px;
        }
        
        .logo-section {
          display: table-cell;
          width: 280px;
          vertical-align: top;
        }
        
        .company-logo {
          max-width: 260px;
          max-height: 130px;
          object-fit: contain;
        }
        
        .company-info-center {
          display: table-cell;
          text-align: center;
          vertical-align: top;
          padding: 0 15px;
        }
        
        .company-name {
          font-size: 11pt;
          font-weight: bold;
          margin-bottom: 1px;
        }
        
        .company-rnc {
          font-size: 9pt;
          margin-bottom: 1px;
        }
        
        .company-address {
          font-size: 8pt;
          line-height: 1.3;
        }
        
        .doc-number-section {
          display: table-cell;
          width: 100px;
          text-align: right;
          vertical-align: top;
        }
        
        .doc-label {
          font-size: 9pt;
          margin-bottom: 1px;
        }
        
        .doc-number {
          font-size: 13pt;
          font-weight: bold;
        }
        
        /* GRID CLIENTE */
        .client-grid {
          width: 100%;
          border: 1px solid #ccc;
          border-collapse: collapse;
          margin-bottom: 12px;
        }
        
        .client-label {
          padding: 4px 6px;
          background: #c0c0c0;
          font-weight: bold;
          font-size: 8pt;
          border: 1px solid #ccc;
          width: 25%;
        }
        
        .client-value {
          padding: 4px 6px;
          background: white;
          font-size: 8pt;
          border: 1px solid #ccc;
        }
        
        /* TABLA PRODUCTOS */
        .products-table {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid #ccc;
          margin-bottom: 0;
          min-height: 400px;
        }
        
        .products-table thead {
          background: #c0c0c0;
        }
        
        .products-table th {
          padding: 5px 6px;
          text-align: left;
          font-size: 8pt;
          font-weight: bold;
          border: 1px solid #ccc;
        }
        
        .products-table th.text-center {
          text-align: center;
        }
        
        .products-table th.text-right {
          text-align: right;
        }
        
        .products-table tbody {
          height: 400px;
          vertical-align: top;
        }
        
        .products-table td {
          padding: 5px 6px;
          font-size: 8pt;
          border-left: 1px solid #ccc;
          border-right: 1px solid #ccc;
          border-bottom: none;
        }
        
        .products-table td.text-center {
          text-align: center;
        }
        
        .products-table td.text-right {
          text-align: right;
        }
        
        /* Última fila de productos con borde inferior */
        .products-table tbody tr:last-child td {
          border-bottom: 1px solid #ccc;
        }
        
        /* Fila de relleno para espacio vacío */
        .products-table .empty-space {
          height: 350px;
          border-left: 1px solid #ccc;
          border-right: 1px solid #ccc;
          border-bottom: 1px solid #ccc;
        }
        
        /* TOTALES */
        .totals-container {
          text-align: right;
          margin-top: 8px;
          margin-bottom: 25px;
        }
        
        .totals-table {
          display: inline-block;
          text-align: right;
          min-width: 250px;
        }
        
        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 3px 12px;
          font-size: 9pt;
        }
        
        .totals-row.highlight {
          background: #c0c0c0;
        }
        
        .totals-row.total {
          background: #808080;
          font-weight: bold;
          color: white;
        }
        
        /* FIRMA */
        .signature-section {
          margin-top: 40px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .stamp-image {
          max-width: 180px;
          max-height: 90px;
          object-fit: contain;
          margin-bottom: 8px;
          display: block;
        }
        
        .signature-line {
          width: 180px;
          margin: 0 auto;
          border-top: 1px solid #000;
          padding-top: 4px;
          font-size: 8pt;
          text-align: center;
        }
        
        @media print {
          body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
        }
      </style>
    </head>
    <body>
      <!-- Header -->
      <div class="header-container">
        <div class="logo-section">
          ${logoUrl ? `<img src="${logoUrl}" alt="${companyName}" class="company-logo" />` : ''}
        </div>
        
        <div class="company-info-center">
          <div class="company-name">${companyName}</div>
          <div class="company-rnc">RNC ${rnc}</div>
          <div class="company-address">
            ${fullAddress}<br>
            ${phone}<br>
            ${website}<br>
            ${invoiceEmail}
          </div>
        </div>
        
        <div class="doc-number-section">
          <div class="doc-label">Cotización</div>
          <div class="doc-number">No. ${quotation.quotation_number || quotation.id}</div>
        </div>
      </div>

      <!-- Fechas -->
      <div class="client-grid">
        <div class="client-label">FECHA DE EXPEDICIÓN</div>
        <div class="client-value">${formatDate(quotation.created_at)}</div>
        <div class="client-label">FECHA DE VENCIMIENTO</div>
        <div class="client-value">${quotation.valid_until ? formatDate(quotation.valid_until) : formatDate(quotation.created_at)}</div>
      </div>

      <!-- Información del Cliente -->
      <table class="client-grid">
        <tr>
          <td class="client-label">SEÑOR(ES)</td>
          <td class="client-value">${quotation.client?.name || 'N/A'}</td>
        </tr>
        <tr>
          <td class="client-label">DIRECCIÓN</td>
          <td class="client-value">${quotation.client?.address || 'HOSPITAL DARIO CONTRERAS'}</td>
        </tr>
        <tr>
          <td class="client-label">CIUDAD</td>
          <td class="client-value">${quotation.client?.city || city}</td>
        </tr>
        <tr>
          <td class="client-label">TELÉFONO</td>
          <td class="client-value">${quotation.client?.phone || ''}</td>
        </tr>
        <tr>
          <td class="client-label">RNC</td>
          <td class="client-value">${quotation.client?.rnc || ''}</td>
        </tr>
      </table>

      <!-- Tabla de Productos -->
      <table class="products-table">
        <thead>
          <tr>
            <th>Ítem</th>
            <th class="text-right">Precio</th>
            <th class="text-center">Cantidad</th>
            <th class="text-center">Descuento</th>
            <th class="text-center">Impuesto</th>
            <th class="text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${quotation.items && quotation.items.length > 0 ? quotation.items.map((item, index) => {
            const itemSubtotal = item.quantity * item.unit_price;
            const itemDiscount = (item.discount_percentage || 0);
            const itemTax = (item.tax_type || 'E');
            return `
              <tr>
                <td>${item.product_name || item.product?.name || 'Producto'}</td>
                <td class="text-right">${formatCurrency(item.unit_price)}</td>
                <td class="text-center">${item.quantity}</td>
                <td class="text-center">${itemDiscount.toFixed(2)}%</td>
                <td class="text-center">${itemTax}</td>
                <td class="text-right">${formatCurrency(itemSubtotal)}</td>
              </tr>
            `;
          }).join('') : ''}
          ${quotation.items && quotation.items.length < 10 ? Array(10 - (quotation.items?.length || 0)).fill(0).map(() => `
            <tr>
              <td class="empty-space" colspan="6"></td>
            </tr>
          `).join('') : ''}
        </tbody>
      </table>

      <!-- Totales -->
      <div class="totals-container">
        <div class="totals-table">
          <div class="totals-row">
            <span>Subtotal:</span>
            <span>${formatCurrency(subtotal)}</span>
          </div>
          <div class="totals-row">
            <span>Descuento:</span>
            <span>${formatCurrency(discount)}</span>
          </div>
          <div class="totals-row highlight">
            <span>Subtotal:</span>
            <span>${formatCurrency(subtotal - discount)}</span>
          </div>
          <div class="totals-row total">
            <span>Total:</span>
            <span>${formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      <!-- Firma -->
      <div class="signature-section">
        ${stampUrl ? `<img src="${stampUrl}" alt="Sello" class="stamp-image" />` : ''}
        <div class="signature-line">ELABORADO POR</div>
      </div>
    </body>
    </html>
  `;
};

export const generateQuotationPrintHTMLOLD = (quotation, formatCurrency, formatDate, organizationData = null) => {
  // Construir URLs completas
  let logoUrl = null;
  let stampUrl = null;
  
  if (organizationData?.logo_url) {
    logoUrl = organizationData.logo_url.startsWith('http') 
      ? organizationData.logo_url 
      : `http://localhost:8000${organizationData.logo_url}`;
  }
  
  if (organizationData?.stamp_url) {
    stampUrl = organizationData.stamp_url.startsWith('http') 
      ? organizationData.stamp_url 
      : `http://localhost:8000${organizationData.stamp_url}`;
  }
  
  const companyName = organizationData?.name || 'Empresa';
  const rnc = organizationData?.rnc || '';
  const address = organizationData?.address || '';
  const city = organizationData?.city || '';
  const addressNumber = organizationData?.address_number || '';
  const website = organizationData?.website || '';
  const invoiceEmail = organizationData?.invoice_email || organizationData?.email || '';
  const phone = organizationData?.phone || '';

  const subtotal = quotation.subtotal || 0;
  const taxRate = quotation.tax_rate || 0;
  const taxAmount = subtotal * (taxRate / 100);
  const discount = quotation.discount_amount || 0;
  const total = quotation.total_amount || (subtotal + taxAmount - discount);

  // Construir dirección completa
  let fullAddress = '';
  if (address) {
    fullAddress = address;
    if (addressNumber) fullAddress += `, no. ${addressNumber}`;
    if (city) fullAddress += ` - ${city}`;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Cotización #${quotation.quotation_number || quotation.id}</title>
      <style>
        @page { margin: 0.75in; size: letter; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: Arial, Helvetica, sans-serif;
          font-size: 11px;
          color: #000;
          line-height: 1.4;
        }
        
        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #000;
        }
        
        .company-section {
          flex: 1;
        }
        
        .company-logo {
          max-width: 280px;
          max-height: 120px;
          object-fit: contain;
          margin-bottom: 8px;
        }
        
        .company-name {
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 2px;
        }
        
        .company-rnc {
          font-size: 11px;
          margin-bottom: 4px;
        }
        
        .company-address {
          font-size: 10px;
          line-height: 1.5;
          color: #333;
        }
        
        .invoice-info {
          text-align: right;
        }
        
        .cotizacion-label {
          font-size: 11px;
          margin-bottom: 2px;
        }
        
        .invoice-number {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 2px;
        }
        
        .client-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          margin-bottom: 15px;
          border: 1px solid #000;
        }
        
        .info-cell {
          padding: 6px 8px;
          border-bottom: 1px solid #000;
          font-size: 10px;
        }
        
        .info-cell:nth-child(odd) {
          background: #e8e8e8;
          font-weight: bold;
          border-right: 1px solid #000;
        }
        
        .info-cell:nth-child(even) {
          background: white;
        }
        
        .info-cell:nth-last-child(-n+2) {
          border-bottom: none;
        }
        
        .products-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
        }
        
        .products-table thead {
          background: #e8e8e8;
          border-top: 1px solid #000;
          border-bottom: 1px solid #000;
        }
        
        .products-table th {
          padding: 6px 8px;
          text-align: left;
          font-size: 10px;
          font-weight: bold;
          border-right: 1px solid #000;
        }
        
        .products-table th:last-child {
          border-right: none;
        }
        
        .products-table th.text-center {
          text-align: center;
        }
        
        .products-table th.text-right {
          text-align: right;
        }
        
        .products-table td {
          padding: 8px;
          border-bottom: 1px solid #ddd;
          font-size: 10px;
        }
        
        .products-table td.text-center {
          text-align: center;
        }
        
        .products-table td.text-right {
          text-align: right;
        }
        
        .products-table tbody tr:last-child td {
          border-bottom: 1px solid #000;
        }
        
        .totals-section {
          margin-top: 20px;
          margin-left: auto;
          width: 300px;
        }
        
        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
          font-size: 11px;
        }
        
        .totals-row.total {
          font-weight: bold;
          font-size: 13px;
          border-top: 2px solid #000;
          padding-top: 8px;
          margin-top: 4px;
        }
        
        .stamp-section {
          margin-top: 40px;
          text-align: center;
        }
        
        .stamp-image {
          max-width: 180px;
          max-height: 90px;
          object-fit: contain;
          margin-bottom: 5px;
          display: block;
        }
        
        .stamp-line {
          width: 200px;
          margin: 0 auto;
          border-top: 1px solid #000;
          padding-top: 5px;
          font-size: 10px;
        }
        
        @media print {
          body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
        }
      </style>
    </head>
    <body>
      <div class="invoice-header">
        <div class="company-section">
          ${logoUrl ? `<img src="${logoUrl}" alt="${companyName}" class="company-logo" />` : ''}
          <div class="company-name">${companyName}</div>
          ${rnc ? `<div class="company-rnc">RNC: ${rnc}</div>` : ''}
          <div class="company-address">
            ${fullAddress ? `${fullAddress}<br>` : ''}
            ${phone ? `Tel: ${phone}<br>` : ''}
            ${website ? `${website}<br>` : ''}
            ${invoiceEmail ? `${invoiceEmail}` : ''}
          </div>
        </div>
        <div class="invoice-info">
          <div class="cotizacion-label">Cotización</div>
          <div class="invoice-number">No. ${quotation.quotation_number || quotation.id}</div>
        </div>
      </div>

      <div class="client-info-grid">
        <div class="info-cell">SEÑORES:</div>
        <div class="info-cell">${quotation.client?.name || 'N/A'}</div>
        
        <div class="info-cell">DIRECCIÓN:</div>
        <div class="info-cell">${quotation.client?.address || 'N/A'}</div>
        
        <div class="info-cell">CIUDAD:</div>
        <div class="info-cell">${quotation.client?.city || city || 'N/A'}</div>
        
        <div class="info-cell">TELÉFONO:</div>
        <div class="info-cell">RNC:</div>
        
        <div class="info-cell" style="background: white; font-weight: normal;">FECHA DE EXPEDICIÓN</div>
        <div class="info-cell" style="background: white; font-weight: normal;">FECHA DE VENCIMIENTO</div>
        
        <div class="info-cell" style="background: white; font-weight: normal;">${formatDate(quotation.created_at)}</div>
        <div class="info-cell" style="background: white; font-weight: normal;">${quotation.valid_until ? formatDate(quotation.valid_until) : formatDate(quotation.created_at)}</div>
      </div>

      <table class="products-table">
        <thead>
          <tr>
            <th>Ítem</th>
            <th>Precio</th>
            <th class="text-center">Cantidad</th>
            <th class="text-center">Descuento</th>
            <th class="text-center">Impuesto</th>
            <th class="text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${quotation.items && quotation.items.length > 0 ? quotation.items.map(item => {
            const itemSubtotal = item.quantity * item.unit_price;
            const itemDiscount = (item.discount_percentage || 0);
            const itemTax = (item.tax_type || 'E');
            return `
              <tr>
                <td>${item.product_name || item.product?.name || 'Producto'}</td>
                <td>${formatCurrency(item.unit_price)}</td>
                <td class="text-center">${item.quantity}</td>
                <td class="text-center">${itemDiscount.toFixed(2)}%</td>
                <td class="text-center">${itemTax}</td>
                <td class="text-right">${formatCurrency(itemSubtotal)}</td>
              </tr>
            `;
          }).join('') : '<tr><td colspan="6" style="text-align: center;">No hay productos</td></tr>'}
        </tbody>
      </table>

      <div class="totals-section">
        <div class="totals-row">
          <span>Subtotal:</span>
          <span>${formatCurrency(subtotal)}</span>
        </div>
        <div class="totals-row">
          <span>Descuento:</span>
          <span>${formatCurrency(discount)}</span>
        </div>
        <div class="totals-row">
          <span>Subtotal:</span>
          <span>${formatCurrency(subtotal - discount)}</span>
        </div>
        <div class="totals-row total">
          <span>Total:</span>
          <span>${formatCurrency(total)}</span>
        </div>
      </div>

      ${stampUrl ? `
        <div class="stamp-section">
          <img src="${stampUrl}" alt="Sello" class="stamp-image" />
          <div class="stamp-line">ELABORADO POR</div>
        </div>
      ` : `
        <div class="stamp-section">
          <div style="height: 60px;"></div>
          <div class="stamp-line">ELABORADO POR</div>
        </div>
      `}
    </body>
    </html>
  `;
};
