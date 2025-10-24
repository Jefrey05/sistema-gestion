// Template EXACTO para facturas médicas - Insumos Quirúrgicos
export const generateMedicalInvoiceHTML = (document, formatCurrency, formatDate, organizationData = null, documentType = 'Cotización') => {
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

  // Calcular valores según el tipo de documento
  let subtotal, discount, taxAmount, total;
  
  if (documentType === 'Alquiler') {
    // Para alquileres: calcular desde los items o desde rental_price
    const days = Math.max(1, Math.ceil((new Date(document.end_date) - new Date(document.start_date)) / (1000 * 60 * 60 * 24)));
    const hasItems = document.items && document.items.length > 0;
    
    subtotal = hasItems 
      ? document.items.reduce((sum, item) => sum + (item.quantity * item.unit_price * days), 0)
      : (document.rental_price * days) || 0;
    
    discount = document.discount || 0;
    const taxRate = document.tax_rate || 0;
    
    // El impuesto se calcula sobre el subtotal ANTES del descuento (igual que el backend)
    taxAmount = subtotal * (taxRate / 100);
    total = document.total_cost || (subtotal + taxAmount - discount);
  } else {
    // Para ventas y cotizaciones: usar los campos existentes
    subtotal = document.subtotal || 0;
    discount = document.discount_amount || 0;
    taxAmount = document.tax_amount || 0;
    total = document.total_amount || (subtotal + taxAmount - discount);
  }

  let fullAddress = address;
  if (addressNumber) fullAddress += `, no. ${addressNumber}`;
  if (city) fullAddress += ` - ${city}`;

  // Formatear número de documento: usar el número real sin ceros a la izquierda
  const rawNumber = document.sale_number || document.quotation_number || document.rental_number || document.id;
  
  // Extraer solo el número final si viene con formato fecha-numero
  let cleanNumber = rawNumber;
  if (typeof rawNumber === 'string' && rawNumber.includes('-')) {
    const parts = rawNumber.split('-');
    cleanNumber = parts[parts.length - 1]; // Tomar solo la última parte
  }
  
  // Usar el número tal cual, sin agregar ceros
  const docNumber = String(cleanNumber);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${documentType} #${docNumber}</title>
      <style>
        @page { margin: 0.3in 0.4in; size: letter; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: Arial, sans-serif;
          font-size: 9pt;
          color: #000;
          line-height: 1.1;
        }
        
        /* HEADER */
        .main-header {
          display: table;
          width: 100%;
          margin-bottom: 8px;
        }
        
        .logo-cell {
          display: table-cell;
          width: 220px;
          vertical-align: middle;
        }
        
        .logo-img {
          max-width: 200px;
          max-height: 100px;
          object-fit: contain;
          margin-top: -10px;
        }
        
        .company-cell {
          display: table-cell;
          text-align: center;
          vertical-align: middle;
          padding: 0;
          padding-right: 80px;
          width: auto;
        }
        
        .company-title {
          font-size: 10pt;
          font-weight: bold;
          margin-bottom: 1px;
        }
        
        .company-rnc {
          font-size: 8pt;
          margin-bottom: 1px;
        }
        
        .company-details {
          font-size: 7.5pt;
          line-height: 1.2;
        }
        
        .doc-cell {
          display: table-cell;
          width: 90px;
          text-align: right;
          vertical-align: top;
        }
        
        .doc-type {
          font-size: 8pt;
        }
        
        .doc-num {
          font-size: 12pt;
          font-weight: bold;
        }
        
        /* GRID CLIENTE */
        .client-table {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid #ccc;
          margin-bottom: 8px;
        }
        
        .client-table td {
          padding: 3px 5px;
          font-size: 7.5pt;
          border: 1px solid #ccc;
        }
        
        .label-cell {
          background: #c0c0c0;
          font-weight: bold;
          width: 18%;
        }
        
        .value-cell {
          background: white;
        }
        
        .date-label {
          background: #c0c0c0;
          font-weight: bold;
          text-align: right;
          width: 22%;
        }
        
        .date-value {
          background: white;
          width: 15%;
        }
        
        /* TABLA PRODUCTOS - Solo líneas verticales */
        .products-table {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid #ccc;
          margin-bottom: 8px;
        }
        
        .products-table th {
          background: #d3d3d3;
          padding: 4px 5px;
          font-size: 7.5pt;
          font-weight: bold;
          border-top: 1px solid #ccc;
          border-bottom: 1px solid #ccc;
          border-left: 1px solid #ccc;
          border-right: 1px solid #ccc;
          text-align: center;
        }
        
        .products-table td {
          padding: 4px 5px;
          font-size: 7.5pt;
          border-top: none;
          border-bottom: none;
          border-left: 1px solid #ccc;
          border-right: 1px solid #ccc;
          vertical-align: middle;
          text-align: center !important;
        }
        
        /* Última fila con doble línea/barra inferior */
        .products-table tbody tr:last-child td {
          border-bottom: 3px double #ccc;
        }
        
        .empty-row td {
          height: 22px;
        }
        
        /* TOTALES */
        .totals-section {
          text-align: right;
          margin-bottom: 20px;
        }
        
        .totals-table {
          display: inline-block;
          min-width: 280px;
          text-align: right;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 3px 10px;
          font-size: 8pt;
        }
        
        .total-row.gray {
          background: #c0c0c0;
          font-weight: bold;
        }
        
        /* FIRMA - Alineada a la IZQUIERDA */
        .signature-area {
          margin-top: 30px;
          margin-left: 40px;
          width: 200px;
          position: relative;
        }
        
        .stamp-img {
          max-width: 170px;
          max-height: 75px;
          object-fit: contain;
          display: block;
          margin-left: 50px;
          margin-bottom: -1px;
          position: relative;
          z-index: 2;
        }
        
        .signature-line {
          width: 200px;
          border-top: 1px solid #000;
          padding-top: 8px;
          font-size: 8pt;
          text-align: center;
          margin-top: 10px;
          position: relative;
          z-index: 1;
        }
        
        @media print {
          body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
        }
      </style>
    </head>
    <body>
      <!-- HEADER -->
      <div class="main-header">
        <div class="logo-cell">
          ${logoUrl ? `<img src="${logoUrl}" alt="${companyName}" class="logo-img" />` : ''}
        </div>
        
        <div class="company-cell">
          <div class="company-title">${companyName}</div>
          <div class="company-rnc">RNC: ${rnc}</div>
          <div class="company-details">
            ${fullAddress}<br>
            ${phone}<br>
            ${website}<br>
            ${invoiceEmail}
          </div>
        </div>
        
        <div class="doc-cell">
          <div class="doc-type">${documentType}</div>
          <div class="doc-num">No. ${docNumber}</div>
        </div>
      </div>
      
      <!-- GRID CLIENTE -->
      <table class="client-table">
        <tr>
          <td class="label-cell">SEÑOR(ES):</td>
          <td class="value-cell" colspan="3">${document.client?.name || ''}</td>
          <td class="date-label">FECHA DE EXPEDICIÓN</td>
          <td class="date-value">${formatDate(document.created_at || document.start_date)}</td>
        </tr>
        <tr>
          <td class="label-cell">DIRECCIÓN:</td>
          <td class="value-cell" colspan="3">${document.client?.address || ''}</td>
          <td class="date-label">FECHA DE VENCIMIENTO</td>
          <td class="date-value">${document.valid_until ? formatDate(document.valid_until) : (document.end_date ? formatDate(document.end_date) : formatDate(document.created_at))}</td>
        </tr>
        <tr>
          <td class="label-cell">CIUDAD:</td>
          <td class="value-cell" colspan="5">${document.client?.city || city || ''}</td>
        </tr>
        <tr>
          <td class="label-cell">TELÉFONO:</td>
          <td class="value-cell">${document.client?.phone || ''}</td>
          <td class="label-cell">RNC</td>
          <td class="value-cell" colspan="3">${document.client?.rnc || ''}</td>
        </tr>
      </table>
      
      <!-- TABLA PRODUCTOS -->
      <table class="products-table">
        <thead>
          <tr>
            <th style="width: 40%;">Producto</th>
            <th style="width: 15%;">Precio</th>
            <th style="width: 10%;">Cantidad</th>
            <th style="width: 15%;">Impuesto</th>
            <th style="width: 20%;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${document.items && document.items.length > 0 ? document.items.map(item => {
            const itemPrice = item.unit_price || 0;
            const itemQty = item.quantity || 0;
            
            // Para alquileres, calcular con días
            let itemSubtotalBeforeDiscount;
            if (documentType === 'Alquiler') {
              const days = Math.max(1, Math.ceil((new Date(document.end_date) - new Date(document.start_date)) / (1000 * 60 * 60 * 24)));
              itemSubtotalBeforeDiscount = itemPrice * itemQty * days;
            } else {
              itemSubtotalBeforeDiscount = itemPrice * itemQty;
            }
            
            // Descuento a nivel de item (solo para ventas/cotizaciones)
            const itemDiscountPct = (item.discount_percentage || 0);
            const itemDiscountAmount = itemSubtotalBeforeDiscount * (itemDiscountPct / 100);
            const itemSubtotal = item.subtotal || (itemSubtotalBeforeDiscount - itemDiscountAmount);
            
            // Calcular el impuesto sobre el subtotal
            let itemTaxAmount = 0;
            
            if (item.tax_amount && item.tax_amount > 0) {
              // Usar el tax_amount del sistema si existe
              itemTaxAmount = item.tax_amount;
            } else if (documentType === 'Alquiler' && taxAmount > 0) {
              // Para alquileres, calcular proporcionalmente basado en el tax_rate del documento
              const taxRate = document.tax_rate || 0;
              itemTaxAmount = itemSubtotal * (taxRate / 100);
            } else if (item.tax_type && item.tax_type !== 'E' && item.tax_type !== 'exento' && item.tax_type !== 'Exento') {
              // Para ventas/cotizaciones con tax_type
              itemTaxAmount = itemSubtotal * 0.18;
            } else if (!item.tax_type && taxAmount > 0) {
              // Si hay impuestos en el documento pero no en el item
              itemTaxAmount = itemSubtotal * 0.18;
            }
            
            return `
              <tr>
                <td>${item.product_name || item.product?.name || ''}</td>
                <td>${formatCurrency(itemPrice)}</td>
                <td>${itemQty}</td>
                <td>${formatCurrency(itemTaxAmount)}</td>
                <td>${formatCurrency(itemSubtotal)}</td>
              </tr>
            `;
          }).join('') : ''}
          ${Array(Math.max(0, 25 - (document.items?.length || 0))).fill(0).map(() => `
            <tr class="empty-row">
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <!-- TOTALES -->
      <div class="totals-section">
        <div class="totals-table">
          <div class="total-row">
            <span>Subtotal</span>
            <span>${formatCurrency(subtotal)}</span>
          </div>
          ${taxAmount > 0 ? `
          <div class="total-row">
            <span>Impuestos (ITBIS 18%)</span>
            <span>${formatCurrency(taxAmount)}</span>
          </div>
          ` : ''}
          ${discount > 0 ? `
          <div class="total-row">
            <span>Descuento</span>
            <span>-${formatCurrency(discount)}</span>
          </div>
          ` : ''}
          <div class="total-row gray">
            <span>Total</span>
            <span>${formatCurrency(total)}</span>
          </div>
        </div>
      </div>
      
      <!-- FIRMA -->
      <div class="signature-area">
        ${stampUrl ? `<img src="${stampUrl}" alt="Sello" class="stamp-img" />` : '<div style="height: 40px;"></div>'}
        <div class="signature-line">ELABORADO POR</div>
      </div>
    </body>
    </html>
  `;
};
