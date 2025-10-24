// Plantillas profesionales minimalistas para impresión
// Diseño optimizado para UNA SOLA PÁGINA - Sin emojis - Colores neutros
// ACTUALIZADO: Logo y sello más grandes (2x)

// Importar el template médico EXACTO
import { generateMedicalInvoiceHTML } from './medicalInvoiceTemplate';

const getMinimalStyles = () => `
  @page { margin: 0.5in; size: letter; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { 
    font-family: Arial, Helvetica, sans-serif;
    font-size: 13px;
    color: #000;
    line-height: 1.6;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: 15px;
    border-bottom: 2px solid #333;
    margin-bottom: 20px;
  }
  
  .logo-section {
    flex: 0 0 auto;
  }
  
  .company-logo {
    max-width: 320px;
    max-height: 140px;
    object-fit: contain;
    margin-bottom: 8px;
  }
  
  .company-info {
    margin-top: 4px;
  }
  
  .company-name {
    display: none;
  }
  
  .company-details {
    font-size: 12px;
    color: #555;
    line-height: 1.6;
  }
  
  .document-info {
    text-align: right;
  }
  
  .document-type {
    font-size: 28px;
    font-weight: bold;
    color: #000;
    margin-bottom: 8px;
  }
  
  .document-number {
    font-size: 13px;
    color: #555;
  }
  
  .section {
    margin-bottom: 15px;
  }
  
  .section-title {
    font-size: 13px;
    font-weight: bold;
    color: #000;
    text-transform: uppercase;
    border-bottom: 1px solid #ddd;
    padding-bottom: 5px;
    margin-bottom: 10px;
  }
  
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    margin-bottom: 15px;
  }
  
  .info-box {
    background: #f8f8f8;
    padding: 12px;
    border-left: 3px solid #666;
  }
  
  .info-label {
    font-size: 10px;
    color: #666;
    font-weight: bold;
    text-transform: uppercase;
  }
  
  .info-value {
    font-size: 12px;
    color: #000;
    margin-bottom: 5px;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0;
    font-size: 12px;
  }
  
  thead {
    background: #333;
    color: white;
  }
  
  th {
    padding: 10px 12px;
    text-align: left;
    font-size: 11px;
    font-weight: bold;
    text-transform: uppercase;
  }
  
  th.text-right { text-align: right; }
  th.text-center { text-align: center; }
  
  tbody tr {
    border-bottom: 1px solid #ddd;
  }
  
  tbody tr:nth-child(even) {
    background: #f9f9f9;
  }
  
  td {
    padding: 10px 12px;
    font-size: 12px;
  }
  
  td.text-right { text-align: right; }
  td.text-center { text-align: center; }
  
  .product-name {
    font-weight: bold;
    color: #000;
    font-size: 12px;
  }
  
  .product-sku {
    display: none;
  }
  
  .totals {
    margin-top: 15px;
    text-align: right;
  }
  
  .totals-row {
    display: flex;
    justify-content: flex-end;
    gap: 60px;
    padding: 5px 0;
    font-size: 13px;
  }
  
  .totals-row.total {
    border-top: 2px solid #333;
    padding-top: 10px;
    margin-top: 8px;
    font-size: 16px;
    font-weight: bold;
  }
  
  .footer {
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px solid #ddd;
    font-size: 9px;
    color: #666;
    text-align: center;
    line-height: 1.5;
  }
  
  .period-box {
    background: #f0f0f0;
    padding: 12px;
    margin-bottom: 15px;
    border: 1px solid #ccc;
  }
  
  .period-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    font-size: 12px;
  }
  
  .status-badge {
    display: inline-block;
    padding: 4px 10px;
    background: #e0e0e0;
    color: #333;
    font-size: 9px;
    font-weight: bold;
    text-transform: uppercase;
    border-radius: 3px;
  }
  
  @media print {
    body { padding: 0; }
    .header { page-break-after: avoid; }
    table { page-break-inside: avoid; }
    
    /* Ocultar URL del blob en header y footer */
    @page {
      margin-top: 0.5in;
      margin-bottom: 0.5in;
      margin-left: 0.5in;
      margin-right: 0.5in;
    }
  }
  
  /* Ocultar elementos del navegador en impresión */
  @page { 
    size: auto;
    margin: 0.5in;
  }
`;

export const generateRentalPrintHTML = (rental, formatCurrency, formatDate, organizationData = null, isQuotation = false) => {
  const documentType = isQuotation ? 'Cotización' : 'Alquiler';
  return generateMedicalInvoiceHTML(rental, formatCurrency, formatDate, organizationData, documentType);
};

export const generateRentalPrintHTMLOLD2 = (rental, formatCurrency, formatDate, organizationData = null) => {
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

  const days = Math.max(1, Math.ceil((new Date(rental.end_date) - new Date(rental.start_date)) / (1000 * 60 * 60 * 24)));
  
  // Manejar tanto el modelo antiguo (product) como el nuevo (items)
  const hasItems = rental.items && rental.items.length > 0;
  const subtotal = hasItems 
    ? rental.items.reduce((sum, item) => sum + (item.quantity * item.unit_price * days), 0)
    : (rental.rental_price * days) || 0;
    
  const taxRate = rental.tax_rate || 0;
  const taxAmount = subtotal * (taxRate / 100);
  const discount = rental.discount || 0;
  const total = rental.total_cost || (subtotal + taxAmount - discount);

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
      <title>Alquiler #${rental.rental_number || rental.id}</title>
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
          <div class="doc-label">Alquiler</div>
          <div class="doc-number">No. ${rental.rental_number || rental.id}</div>
        </div>
      </div>

      <!-- Fechas -->
      <div class="client-grid">
        <div class="client-label">FECHA DE INICIO</div>
        <div class="client-value">${formatDate(rental.start_date)}</div>
        <div class="client-label">FECHA DE FIN</div>
        <div class="client-value">${formatDate(rental.end_date)}</div>
      </div>

      <!-- Información del Cliente -->
      <table class="client-grid">
        <tr>
          <td class="client-label">SEÑOR(ES)</td>
          <td class="client-value">${rental.client?.name || 'N/A'}</td>
        </tr>
        <tr>
          <td class="client-label">DIRECCIÓN</td>
          <td class="client-value">${rental.client?.address || 'HOSPITAL DARIO CONTRERAS'}</td>
        </tr>
        <tr>
          <td class="client-label">CIUDAD</td>
          <td class="client-value">${rental.client?.city || city}</td>
        </tr>
        <tr>
          <td class="client-label">TELÉFONO</td>
          <td class="client-value">${rental.client?.phone || ''}</td>
        </tr>
        <tr>
          <td class="client-label">RNC</td>
          <td class="client-value">${rental.client?.rnc || ''}</td>
        </tr>
      </table>

      <!-- Tabla de Productos -->
      <table class="products-table">
        <thead>
          <tr>
            <th>Ítem</th>
            <th class="text-right">Precio/Día</th>
            <th class="text-center">Cantidad</th>
            <th class="text-center">Días</th>
            <th class="text-center">Descuento</th>
            <th class="text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${hasItems ? rental.items.map((item, index) => {
            const itemSubtotal = item.quantity * item.unit_price * days;
            const itemDiscount = (item.discount_percentage || 0);
            return `
              <tr>
                <td>${item.product_name || item.product?.name || 'Producto'}</td>
                <td class="text-right">${formatCurrency(item.unit_price)}</td>
                <td class="text-center">${item.quantity}</td>
                <td class="text-center">${days}</td>
                <td class="text-center">${itemDiscount.toFixed(2)}%</td>
                <td class="text-right">${formatCurrency(itemSubtotal)}</td>
              </tr>
            `;
          }).join('') : rental.product ? `
            <tr>
              <td>${rental.product.name || 'Producto'}</td>
              <td class="text-right">${formatCurrency(rental.rental_price || 0)}</td>
              <td class="text-center">1</td>
              <td class="text-center">${days}</td>
              <td class="text-center">0.00%</td>
              <td class="text-right">${formatCurrency((rental.rental_price || 0) * days)}</td>
            </tr>
          ` : ''}
          ${(hasItems ? rental.items.length : (rental.product ? 1 : 0)) < 10 ? Array(10 - (hasItems ? rental.items.length : (rental.product ? 1 : 0))).fill(0).map(() => `
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

export const generateRentalPrintHTMLOLD = (rental, formatCurrency, formatDate, organizationData = null) => {
  const days = Math.ceil((new Date(rental.end_date) - new Date(rental.start_date)) / (1000 * 60 * 60 * 24));
  
  const hasItems = rental.items && rental.items.length > 0;
  const subtotal = hasItems 
    ? rental.items.reduce((sum, item) => sum + (item.quantity * item.unit_price * days), 0)
    : (rental.rental_price * days) || 0;
    
  const taxRate = rental.tax_rate || 0;
  const taxAmount = subtotal * (taxRate / 100);
  const discount = rental.discount || 0;
  const total = rental.total_cost || (subtotal + taxAmount - discount);

  // Construir URL completa del logo como lo hace el Dashboard
  let logoUrl = null;
  if (organizationData?.logo_url) {
    logoUrl = organizationData.logo_url.startsWith('http') 
      ? organizationData.logo_url 
      : `http://localhost:8000${organizationData.logo_url}`;
  }
  
  const companyName = organizationData?.name || 'Empresa';
  const companyEmail = organizationData?.email || '';
  const companyPhone = organizationData?.phone || '';
  const companyAddress = organizationData?.address || '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title> </title>
      <style>${getMinimalStyles()}</style>
    </head>
    <body>
      <div class="header">
        <div class="logo-section">
          ${logoUrl ? `<img src="${logoUrl}" alt="${companyName}" class="company-logo" />` : ''}
          <div class="company-info">
            <div class="company-details">
              ${companyEmail ? `${companyEmail}<br>` : ''}
              ${companyPhone ? `Tel: ${companyPhone}` : ''}
            </div>
          </div>
        </div>
        <div class="document-info">
          <div class="document-type">CONTRATO DE ALQUILER</div>
          <div class="document-number">
            No. ${rental.rental_number || rental.id}<br>
            Fecha: ${formatDate(rental.created_at)}
          </div>
        </div>
      </div>

      <div class="period-box">
        <div class="section-title">PERIODO DE ALQUILER</div>
        <div class="period-grid">
          <div>
            <div class="info-label">Inicio</div>
            <div class="info-value">${formatDate(rental.start_date)}</div>
          </div>
          <div>
            <div class="info-label">Fin</div>
            <div class="info-value">${formatDate(rental.end_date)}</div>
          </div>
          <div>
            <div class="info-label">Duración</div>
            <div class="info-value">${days} día${days !== 1 ? 's' : ''}</div>
          </div>
        </div>
      </div>

      <div class="info-grid">
        <div class="info-box">
          <div class="section-title">CLIENTE</div>
          <div class="info-value"><strong>Nombre:</strong> ${rental.client?.name || 'N/A'}</div>
          <div class="info-value"><strong>Email:</strong> ${rental.client?.email || 'N/A'}</div>
          <div class="info-value"><strong>Teléfono:</strong> ${rental.client?.phone || 'N/A'}</div>
          ${rental.client?.address ? `<div class="info-value"><strong>Dirección:</strong> ${rental.client.address}</div>` : ''}
        </div>

        <div class="info-box">
          <div class="section-title">PAGO</div>
          <div class="info-value"><strong>Estado:</strong> <span class="status-badge">${rental.status?.toUpperCase()}</span></div>
          <div class="info-value"><strong>Método:</strong> ${rental.payment_method || 'Efectivo'}</div>
          <div class="info-value"><strong>Pagado:</strong> ${formatCurrency(rental.paid_amount || 0)}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">PRODUCTOS ALQUILADOS</div>
        <table>
          <thead>
            <tr>
              <th>PRODUCTO</th>
              <th class="text-center">CANT.</th>
              <th class="text-right">PRECIO/DÍA</th>
              <th class="text-center">DÍAS</th>
              <th class="text-right">SUBTOTAL</th>
            </tr>
          </thead>
          <tbody>
            ${hasItems ? rental.items.map(item => `
              <tr>
                <td>
                  <div class="product-name">${item.product_name || item.product?.name || 'Producto'}</div>
                </td>
                <td class="text-center">${item.quantity}</td>
                <td class="text-right">${formatCurrency(item.unit_price)}</td>
                <td class="text-center">${days}</td>
                <td class="text-right"><strong>${formatCurrency(item.quantity * item.unit_price * days)}</strong></td>
              </tr>
            `).join('') : rental.product ? `
              <tr>
                <td>
                  <div class="product-name">${rental.product.name || 'Producto'}</div>
                </td>
                <td class="text-center">1</td>
                <td class="text-right">${formatCurrency(rental.rental_price || 0)}</td>
                <td class="text-center">${days}</td>
                <td class="text-right"><strong>${formatCurrency((rental.rental_price || 0) * days)}</strong></td>
              </tr>
            ` : '<tr><td colspan="5" style="text-align: center;">No hay productos</td></tr>'}
          </tbody>
        </table>
      </div>

      <div class="totals">
        <div class="totals-row">
          <span>Subtotal:</span>
          <span>${formatCurrency(subtotal)}</span>
        </div>
        ${taxAmount > 0 ? `
          <div class="totals-row">
            <span>ITBIS/IVA (${taxRate}%):</span>
            <span>${formatCurrency(taxAmount)}</span>
          </div>
        ` : ''}
        ${discount > 0 ? `
          <div class="totals-row">
            <span>Descuento:</span>
            <span>-${formatCurrency(discount)}</span>
          </div>
        ` : ''}
        <div class="totals-row total">
          <span>TOTAL:</span>
          <span>${formatCurrency(total)}</span>
        </div>
        <div class="totals-row">
          <span>Pagado:</span>
          <span>${formatCurrency(rental.paid_amount || 0)}</span>
        </div>
        <div class="totals-row">
          <span>Pendiente:</span>
          <span>${formatCurrency(total - (rental.paid_amount || 0))}</span>
        </div>
      </div>

      ${rental.notes ? `
        <div class="section" style="margin-top: 8px; padding: 6px; background: #f8f8f8; border-left: 2px solid #666;">
          <strong style="font-size: 8px;">NOTAS:</strong>
          <div style="font-size: 8px; margin-top: 2px;">${rental.notes}</div>
        </div>
      ` : ''}

      <div class="footer">
        <strong>TÉRMINOS Y CONDICIONES:</strong> El cliente se compromete a devolver los productos en las mismas condiciones en que fueron entregados. Cualquier daño o pérdida será responsabilidad del cliente.
      </div>
    </body>
    </html>
  `;
};

export const generateSalePrintHTML = (sale, formatCurrency, formatDate, organizationData = null) => {
  return generateMedicalInvoiceHTML(sale, formatCurrency, formatDate, organizationData, 'Factura');
};

export const generateSalePrintHTMLOLD2 = (sale, formatCurrency, formatDate, organizationData = null) => {
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

  const subtotal = sale.subtotal || 0;
  const taxAmount = sale.tax_amount || (subtotal * (sale.tax_rate || 0) / 100);
  const discount = sale.discount_amount || 0;
  const total = sale.total_amount || (subtotal + taxAmount - discount);

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
      <title>Factura #${sale.sale_number || sale.id}</title>
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
          <div class="doc-label">Factura</div>
          <div class="doc-number">No. ${sale.sale_number || sale.id}</div>
        </div>
      </div>

      <!-- Fechas -->
      <div class="client-grid">
        <div class="client-label">FECHA DE EXPEDICIÓN</div>
        <div class="client-value">${formatDate(sale.created_at)}</div>
        <div class="client-label">FECHA DE VENCIMIENTO</div>
        <div class="client-value">${formatDate(sale.created_at)}</div>
      </div>

      <!-- Información del Cliente -->
      <table class="client-grid">
        <tr>
          <td class="client-label">SEÑOR(ES)</td>
          <td class="client-value">${sale.client?.name || 'N/A'}</td>
        </tr>
        <tr>
          <td class="client-label">DIRECCIÓN</td>
          <td class="client-value">${sale.client?.address || 'HOSPITAL DARIO CONTRERAS'}</td>
        </tr>
        <tr>
          <td class="client-label">CIUDAD</td>
          <td class="client-value">${sale.client?.city || city}</td>
        </tr>
        <tr>
          <td class="client-label">TELÉFONO</td>
          <td class="client-value">${sale.client?.phone || ''}</td>
        </tr>
        <tr>
          <td class="client-label">RNC</td>
          <td class="client-value">${sale.client?.rnc || ''}</td>
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
          ${sale.items && sale.items.length > 0 ? sale.items.map((item, index) => {
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
          ${sale.items && sale.items.length < 10 ? Array(10 - (sale.items?.length || 0)).fill(0).map(() => `
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

export const generateSalePrintHTMLOLD = (sale, formatCurrency, formatDate, organizationData = null) => {
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

  const subtotal = sale.subtotal || 0;
  const taxRate = sale.tax_rate || 0;
  const taxAmount = subtotal * (taxRate / 100);
  const discount = sale.discount_amount || 0;
  const total = sale.total_amount || (subtotal + taxAmount - discount);

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
      <title>Factura #${sale.sale_number || sale.id}</title>
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
        
        .client-info-row {
          display: contents;
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
          <div class="invoice-number">No. ${sale.sale_number || sale.id}</div>
        </div>
      </div>

      <div class="client-info-grid">
        <div class="info-cell">SEÑORES:</div>
        <div class="info-cell">${sale.client?.name || 'N/A'}</div>
        
        <div class="info-cell">DIRECCIÓN:</div>
        <div class="info-cell">${sale.client?.address || 'HOSPITAL DARIO CONTRERAS'}</div>
        
        <div class="info-cell">CIUDAD:</div>
        <div class="info-cell">${sale.client?.city || city || 'Santo Domingo de Guzman'}</div>
        
        <div class="info-cell">TELÉFONO:</div>
        <div class="info-cell">RNC:</div>
        
        <div class="info-cell" style="background: white; font-weight: normal;">FECHA DE EXPEDICIÓN</div>
        <div class="info-cell" style="background: white; font-weight: normal;">FECHA DE VENCIMIENTO</div>
        
        <div class="info-cell" style="background: white; font-weight: normal;">${formatDate(sale.created_at)}</div>
        <div class="info-cell" style="background: white; font-weight: normal;">${formatDate(sale.created_at)}</div>
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
          ${sale.items && sale.items.length > 0 ? sale.items.map(item => {
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
