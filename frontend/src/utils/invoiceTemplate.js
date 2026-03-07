// Template EXACTO pixel por pixel de la imagen
export const generateInvoicePrintHTML = (document, formatCurrency, formatDate, organizationData = null, documentType = 'Cotización') => {
  // Construir URLs completas
  let logoUrl = null;
  let stampUrl = null;
  
  if (organizationData?.logo_url) {
    logoUrl = organizationData.logo_url.startsWith('http') 
      ? organizationData.logo_url 
      : `https://sistema-gestion-api.onrender.com${organizationData.logo_url}`;
  }
  
  if (organizationData?.stamp_url) {
    stampUrl = organizationData.stamp_url.startsWith('http') 
      ? organizationData.stamp_url 
      : `https://sistema-gestion-api.onrender.com${organizationData.stamp_url}`;
  }
  
  const companyName = organizationData?.name || 'EMPRESA, S.R.L.';
  const rnc = organizationData?.rnc || '';
  const address = organizationData?.address || '';
  const city = organizationData?.city || '';
  const addressNumber = organizationData?.address_number || '';
  const website = organizationData?.website || '';
  const invoiceEmail = organizationData?.invoice_email || organizationData?.email || '';
  const phone = organizationData?.phone || '';

  const subtotal = document.subtotal || 0;
  const discount = document.discount_amount || 0;
  const total = document.total_amount || (subtotal - discount);

  // Construir dirección completa
  let fullAddress = '';
  if (address) {
    fullAddress = address;
    if (addressNumber) fullAddress += `, no. ${addressNumber}`;
    if (city) fullAddress += ` - ${city}`;
  }

  // Número de documento
  const docNumber = document.sale_number || document.quotation_number || document.rental_number || document.id;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${documentType} #${docNumber}</title>
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
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 9pt;
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
          background: #e8e8e8;
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
        
        .client-label-gray {
          padding: 4px 6px;
          background: #e8e8e8;
          font-weight: bold;
          font-size: 8pt;
          border: 1px solid #ccc;
          width: 25%;
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
          background: #e8e8e8;
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
          background: #e8e8e8;
        }
        
        .totals-row.total {
          background: #666;
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
          margin-left: auto;
          margin-right: auto;
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
          ${rnc ? `<div class="company-rnc">RNC: ${rnc}</div>` : ''}
          <div class="company-address">
            ${fullAddress ? `${fullAddress}<br>` : ''}
            ${phone ? `+${phone.replace(/[^0-9]/g, '')}-${phone.slice(-4)}<br>` : ''}
            ${invoiceEmail ? `${invoiceEmail}` : ''}
          </div>
        </div>
        
        <div class="doc-number-section">
          <div class="doc-label">${documentType}</div>
          <div class="doc-number">No. ${docNumber}</div>
        </div>
      </div>
      
      <!-- Cliente Info Grid -->
      <table class="client-grid">
        <tr class="client-row">
          <td class="client-label">SEÑOR(ES)</td>
          <td class="client-value" colspan="3">${document.client?.name || ''}</td>
        </tr>
        <tr class="client-row">
          <td class="client-label">DIRECCIÓN</td>
          <td class="client-value" colspan="3">${document.client?.address || ''}</td>
        </tr>
        <tr class="client-row">
          <td class="client-label">CIUDAD</td>
          <td class="client-value" colspan="3">${document.client?.city || city || ''}</td>
        </tr>
        <tr class="client-row">
          <td class="client-label">TELÉFONO</td>
          <td class="client-value"></td>
          <td class="client-label">RNC</td>
          <td class="client-value"></td>
        </tr>
        <tr class="client-row">
          <td class="client-label-gray">FECHA DE EXPEDICIÓN</td>
          <td class="client-value">${formatDate(document.created_at)}</td>
          <td class="client-label-gray">FECHA DE VENCIMIENTO</td>
          <td class="client-value">${document.valid_until ? formatDate(document.valid_until) : formatDate(document.created_at)}</td>
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
          ${document.items && document.items.length > 0 ? document.items.map(item => {
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
          <!-- Fila vacía para espacio -->
          <tr>
            <td colspan="6" class="empty-space">&nbsp;</td>
          </tr>
        </tbody>
      </table>
      
      <!-- Totales -->
      <div class="totals-container">
        <div class="totals-table">
          <div class="totals-row">
            <span>Subtotal</span>
            <span>${formatCurrency(subtotal)}</span>
          </div>
          <div class="totals-row">
            <span>Descuento</span>
            <span>${formatCurrency(discount)}</span>
          </div>
          <div class="totals-row highlight">
            <span>Subtotal</span>
            <span>${formatCurrency(subtotal - discount)}</span>
          </div>
          <div class="totals-row total">
            <span>Total</span>
            <span>${formatCurrency(total)}</span>
          </div>
        </div>
      </div>
      
      <!-- Firma -->
      <div class="signature-section">
        ${stampUrl ? `<img src="${stampUrl}" alt="Sello" class="stamp-image" />` : '<div style="height: 50px;"></div>'}
        <div class="signature-line">ELABORADO POR</div>
      </div>
    </body>
    </html>
  `;
};
