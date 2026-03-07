// Plantillas profesionales minimalistas para impresión de documentos
// Diseño optimizado para una sola página A4/Letter

export const generateRentalPrintHTML = (rental, formatCurrency, formatDate, organizationData = null) => {
  const days = Math.ceil((new Date(rental.end_date) - new Date(rental.start_date)) / (1000 * 60 * 60 * 24));
  
  const hasItems = rental.items && rental.items.length > 0;
  const subtotal = hasItems 
    ? rental.items.reduce((sum, item) => sum + (item.quantity * item.unit_price * days), 0)
    : (rental.rental_price * days) || 0;
    
  const taxRate = rental.tax_rate || 0;
  const taxAmount = subtotal * (taxRate / 100);
  const discount = rental.discount || 0;
  const total = rental.total_cost || (subtotal + taxAmount - discount);

  const logoUrl = organizationData?.logo_url || '/api/static/logos/default-logo.png';
  const companyName = organizationData?.name || 'Mi Empresa';
  const companyEmail = organizationData?.email || '';
  const companyPhone = organizationData?.phone || '';
  const companyAddress = organizationData?.address || '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Contrato de Alquiler #${rental.rental_number || rental.id}</title>
      <style>
        @page { margin: 0.5in; size: letter; }
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #1a202c;
          line-height: 1.6;
          padding: 40px;
          background: #ffffff;
        }
        
        .document-container {
          max-width: 900px;
          margin: 0 auto;
          background: white;
          box-shadow: 0 0 30px rgba(0,0,0,0.1);
          border-radius: 12px;
          overflow: hidden;
        }
        
        /* Header con logo y datos de empresa */
        .document-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px;
          color: white;
          position: relative;
          overflow: hidden;
        }
        
        .document-header::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -10%;
          width: 400px;
          height: 400px;
          background: rgba(255,255,255,0.1);
          border-radius: 50%;
        }
        
        .header-content {
          position: relative;
          z-index: 1;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        
        .company-info {
          flex: 1;
        }
        
        .company-logo {
          max-width: 180px;
          max-height: 80px;
          object-fit: contain;
          background: white;
          padding: 10px;
          border-radius: 8px;
          margin-bottom: 15px;
        }
        
        .company-name {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 8px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .company-details {
          font-size: 13px;
          opacity: 0.95;
          line-height: 1.8;
        }
        
        .document-title-section {
          text-align: right;
        }
        
        .document-type {
          font-size: 32px;
          font-weight: 800;
          letter-spacing: 1px;
          margin-bottom: 10px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .document-number {
          font-size: 16px;
          opacity: 0.9;
          font-weight: 500;
        }
        
        /* Contenido principal */
        .document-body {
          padding: 40px;
        }
        
        /* Sección de período */
        .period-section {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
          padding: 25px;
          border-radius: 12px;
          margin-bottom: 30px;
          box-shadow: 0 4px 15px rgba(245, 87, 108, 0.3);
        }
        
        .period-title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .period-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        
        .period-item label {
          display: block;
          font-size: 12px;
          opacity: 0.9;
          margin-bottom: 5px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .period-item value {
          display: block;
          font-size: 18px;
          font-weight: 700;
        }
        
        /* Grid de información */
        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 25px;
          margin-bottom: 30px;
        }
        
        .info-card {
          background: #f7fafc;
          border-left: 4px solid #667eea;
          padding: 20px;
          border-radius: 8px;
        }
        
        .info-card.payment {
          border-left-color: #48bb78;
        }
        
        .info-card-title {
          font-size: 14px;
          font-weight: 700;
          color: #667eea;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .info-card.payment .info-card-title {
          color: #48bb78;
        }
        
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .info-row:last-child {
          border-bottom: none;
        }
        
        .info-label {
          font-size: 13px;
          color: #64748b;
          font-weight: 500;
        }
        
        .info-value {
          font-size: 13px;
          color: #1e293b;
          font-weight: 600;
        }
        
        /* Tabla de productos */
        .products-section {
          margin: 30px 0;
        }
        
        .section-title {
          font-size: 20px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 3px solid #667eea;
        }
        
        table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin: 20px 0;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        
        thead {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        
        th {
          padding: 15px;
          text-align: left;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        th.text-right {
          text-align: right;
        }
        
        th.text-center {
          text-align: center;
        }
        
        tbody tr {
          background: white;
          transition: background 0.2s;
        }
        
        tbody tr:nth-child(even) {
          background: #f8fafc;
        }
        
        tbody tr:hover {
          background: #eef2ff;
        }
        
        td {
          padding: 15px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 14px;
        }
        
        td.text-right {
          text-align: right;
        }
        
        td.text-center {
          text-align: center;
        }
        
        .product-name {
          font-weight: 600;
          color: #1e293b;
        }
        
        .product-sku {
          display: none;
        }
        
        /* Totales */
        .totals-section {
          background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
          padding: 25px;
          border-radius: 12px;
          margin-top: 30px;
        }
        
        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          font-size: 15px;
        }
        
        .totals-row.subtotal {
          color: #64748b;
        }
        
        .totals-row.total {
          border-top: 3px solid #667eea;
          padding-top: 15px;
          margin-top: 10px;
          font-size: 24px;
          font-weight: 800;
          color: #667eea;
        }
        
        .totals-row.paid {
          color: #48bb78;
          font-weight: 600;
        }
        
        .totals-row.pending {
          color: #f56565;
          font-weight: 700;
          font-size: 18px;
        }
        
        /* Status badge */
        .status-badge {
          display: inline-block;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .status-activo {
          background: #c6f6d5;
          color: #22543d;
        }
        
        .status-vencido {
          background: #fed7d7;
          color: #742a2a;
        }
        
        .status-devuelto {
          background: #bee3f8;
          color: #2c5282;
        }
        
        /* Notas */
        .notes-section {
          background: #fffbeb;
          border-left: 4px solid #f59e0b;
          padding: 20px;
          margin: 30px 0;
          border-radius: 8px;
        }
        
        .notes-title {
          font-weight: 700;
          color: #92400e;
          margin-bottom: 10px;
          font-size: 14px;
        }
        
        .notes-content {
          color: #78350f;
          font-size: 13px;
          line-height: 1.6;
        }
        
        /* Footer */
        .document-footer {
          margin-top: 50px;
          padding-top: 30px;
          border-top: 2px solid #e2e8f0;
        }
        
        .terms-section {
          background: #f7fafc;
          padding: 25px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        
        .terms-title {
          font-size: 16px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 15px;
          text-align: center;
        }
        
        .terms-content {
          font-size: 12px;
          color: #475569;
          line-height: 1.8;
        }
        
        .terms-content p {
          margin-bottom: 8px;
        }
        
        .signature-section {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 40px;
          margin-top: 60px;
        }
        
        .signature-box {
          text-align: center;
        }
        
        .signature-line {
          border-top: 2px solid #1e293b;
          margin: 60px 20px 10px;
        }
        
        .signature-label {
          font-size: 13px;
          color: #64748b;
          font-weight: 600;
        }
        
        /* Alerta de vencido */
        .overdue-alert {
          background: linear-gradient(135deg, #fc8181 0%, #f56565 100%);
          color: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 25px;
          font-weight: 600;
          text-align: center;
          box-shadow: 0 4px 15px rgba(245, 101, 101, 0.4);
        }
        
        @media print {
          body {
            padding: 0;
          }
          
          .document-container {
            box-shadow: none;
            border-radius: 0;
          }
          
          .document-header::before {
            display: none;
          }
          
          tbody tr:hover {
            background: inherit;
          }
        }
      </style>
    </head>
    <body>
      <div class="document-container">
        <!-- Header -->
        <div class="document-header">
          <div class="header-content">
            <div class="company-info">
              ${logoUrl ? `<img src="${logoUrl}" alt="Logo" class="company-logo" />` : ''}
              <div class="company-name">${companyName}</div>
              <div class="company-details">
                ${companyEmail ? `📧 ${companyEmail}<br>` : ''}
                ${companyPhone ? `📞 ${companyPhone}<br>` : ''}
                ${companyAddress ? `📍 ${companyAddress}` : ''}
              </div>
            </div>
            <div class="document-title-section">
              <div class="document-type">CONTRATO DE ALQUILER</div>
              <div class="document-number">
                N° ${rental.rental_number || rental.id}<br>
                Fecha: ${formatDate(rental.created_at)}
              </div>
            </div>
          </div>
        </div>

        <!-- Body -->
        <div class="document-body">
          ${rental.status === 'vencido' ? `
            <div class="overdue-alert">
              ⚠️ ALQUILER VENCIDO - Se requiere acción inmediata
            </div>
          ` : ''}

          <!-- Período -->
          <div class="period-section">
            <div class="period-title">📅 PERÍODO DE ALQUILER</div>
            <div class="period-grid">
              <div class="period-item">
                <label>Fecha de Inicio</label>
                <value>${formatDate(rental.start_date)}</value>
              </div>
              <div class="period-item">
                <label>Fecha de Fin</label>
                <value>${formatDate(rental.end_date)}</value>
              </div>
              <div class="period-item">
                <label>Duración</label>
                <value>${days} día${days !== 1 ? 's' : ''}</value>
              </div>
            </div>
          </div>

          <!-- Info Cards -->
          <div class="info-grid">
            <div class="info-card">
              <div class="info-card-title">👤 INFORMACIÓN DEL CLIENTE</div>
              <div class="info-row">
                <span class="info-label">Nombre:</span>
                <span class="info-value">${rental.client?.name || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Email:</span>
                <span class="info-value">${rental.client?.email || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Teléfono:</span>
                <span class="info-value">${rental.client?.phone || 'N/A'}</span>
              </div>
              ${rental.client?.address ? `
                <div class="info-row">
                  <span class="info-label">Dirección:</span>
                  <span class="info-value">${rental.client.address}</span>
                </div>
              ` : ''}
            </div>

            <div class="info-card payment">
              <div class="info-card-title">💳 INFORMACIÓN DE PAGO</div>
              <div class="info-row">
                <span class="info-label">Estado:</span>
                <span class="info-value">
                  <span class="status-badge status-${rental.status}">${rental.status?.toUpperCase()}</span>
                </span>
              </div>
              <div class="info-row">
                <span class="info-label">Método de Pago:</span>
                <span class="info-value">${rental.payment_method || 'Efectivo'}</span>
              </div>
            </div>
          </div>

          <!-- Productos -->
          <div class="products-section">
            <div class="section-title">📦 PRODUCTOS ALQUILADOS</div>
            <table>
              <thead>
                <tr>
                  <th>PRODUCTO</th>
                  <th class="text-center">CANTIDAD</th>
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
                      ${(item.product?.sku || item.sku) ? `<div class="product-sku">SKU: ${item.product?.sku || item.sku}</div>` : ''}
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
                      ${rental.product.sku ? `<div class="product-sku">SKU: ${rental.product.sku}</div>` : ''}
                    </td>
                    <td class="text-center">1</td>
                    <td class="text-right">${formatCurrency(rental.rental_price || 0)}</td>
                    <td class="text-center">${days}</td>
                    <td class="text-right"><strong>${formatCurrency((rental.rental_price || 0) * days)}</strong></td>
                  </tr>
                ` : '<tr><td colspan="5" style="text-align: center; padding: 30px;">No hay productos</td></tr>'}
              </tbody>
            </table>
          </div>

          <!-- Totales -->
          <div class="totals-section">
            <div class="totals-row subtotal">
              <span>Subtotal:</span>
              <span>${formatCurrency(subtotal)}</span>
            </div>
            ${taxAmount > 0 ? `
              <div class="totals-row subtotal">
                <span>ITBIS/IVA (${taxRate}%):</span>
                <span>${formatCurrency(taxAmount)}</span>
              </div>
            ` : ''}
            ${discount > 0 ? `
              <div class="totals-row subtotal">
                <span>Descuento:</span>
                <span>-${formatCurrency(discount)}</span>
              </div>
            ` : ''}
            <div class="totals-row total">
              <span>TOTAL:</span>
              <span>${formatCurrency(total)}</span>
            </div>
            <div class="totals-row paid">
              <span>Monto Pagado:</span>
              <span>${formatCurrency(rental.paid_amount || 0)}</span>
            </div>
            <div class="totals-row pending">
              <span>Saldo Pendiente:</span>
              <span>${formatCurrency(total - (rental.paid_amount || 0))}</span>
            </div>
          </div>

          ${rental.notes ? `
            <div class="notes-section">
              <div class="notes-title">📝 NOTAS ADICIONALES</div>
              <div class="notes-content">${rental.notes}</div>
            </div>
          ` : ''}

          <!-- Footer -->
          <div class="document-footer">
            <div class="terms-section">
              <div class="terms-title">TÉRMINOS Y CONDICIONES</div>
              <div class="terms-content">
                <p>• El cliente se compromete a devolver los productos en las mismas condiciones en que fueron entregados.</p>
                <p>• Cualquier daño, pérdida o deterioro será responsabilidad del cliente y deberá ser compensado.</p>
                <p>• El retraso en la devolución puede generar cargos adicionales.</p>
                <p>• El cliente acepta haber recibido los productos en perfectas condiciones de funcionamiento.</p>
              </div>
            </div>

            <div class="signature-section">
              <div class="signature-box">
                <div class="signature-line"></div>
                <div class="signature-label">Firma del Cliente</div>
                <div class="signature-label">${rental.client?.name || ''}</div>
              </div>
              <div class="signature-box">
                <div class="signature-line"></div>
                <div class="signature-label">Firma Autorizada</div>
                <div class="signature-label">${companyName}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const generateSalePrintHTML = (sale, formatCurrency, formatDate, organizationData = null) => {
  const logoUrl = organizationData?.logo_url || '/api/static/logos/default-logo.png';
  const companyName = organizationData?.name || 'Mi Empresa';
  const companyEmail = organizationData?.email || '';
  const companyPhone = organizationData?.phone || '';
  const companyAddress = organizationData?.address || '';

  const subtotal = sale.subtotal || 0;
  const taxRate = sale.tax_rate || 0;
  const taxAmount = subtotal * (taxRate / 100);
  const discount = sale.discount || 0;
  const total = sale.total_amount || (subtotal + taxAmount - discount);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Factura #${sale.sale_number || sale.id}</title>
      <style>
        ${getCommonStyles()}
        .document-header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); }
        .period-section { background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%); }
        .info-card { border-left-color: #3b82f6; }
        .info-card-title { color: #3b82f6; }
        thead { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); }
        .section-title { border-bottom-color: #3b82f6; }
        .totals-row.total { color: #3b82f6; border-top-color: #3b82f6; }
      </style>
    </head>
    <body>
      <div class="document-container">
        <div class="document-header">
          <div class="header-content">
            <div class="company-info">
              ${logoUrl ? `<img src="${logoUrl}" alt="Logo" class="company-logo" />` : ''}
              <div class="company-name">${companyName}</div>
              <div class="company-details">
                ${companyEmail ? `📧 ${companyEmail}<br>` : ''}
                ${companyPhone ? `📞 ${companyPhone}<br>` : ''}
                ${companyAddress ? `📍 ${companyAddress}` : ''}
              </div>
            </div>
            <div class="document-title-section">
              <div class="document-type">FACTURA</div>
              <div class="document-number">
                N° ${sale.sale_number || sale.id}<br>
                Fecha: ${formatDate(sale.created_at)}
              </div>
            </div>
          </div>
        </div>

        <div class="document-body">
          <div class="info-grid">
            <div class="info-card">
              <div class="info-card-title">👤 CLIENTE</div>
              <div class="info-row">
                <span class="info-label">Nombre:</span>
                <span class="info-value">${sale.client?.name || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Email:</span>
                <span class="info-value">${sale.client?.email || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Teléfono:</span>
                <span class="info-value">${sale.client?.phone || 'N/A'}</span>
              </div>
            </div>

            <div class="info-card payment">
              <div class="info-card-title">💳 PAGO</div>
              <div class="info-row">
                <span class="info-label">Método:</span>
                <span class="info-value">${sale.payment_method || 'Efectivo'}</span>
              </div>
            </div>
          </div>

          <div class="products-section">
            <div class="section-title">📦 PRODUCTOS</div>
            <table>
              <thead>
                <tr>
                  <th>PRODUCTO</th>
                  <th class="text-center">CANTIDAD</th>
                  <th class="text-right">PRECIO UNIT.</th>
                  <th class="text-right">SUBTOTAL</th>
                </tr>
              </thead>
              <tbody>
                ${sale.items && sale.items.length > 0 ? sale.items.map(item => `
                  <tr>
                    <td>
                      <div class="product-name">${item.product_name || item.product?.name || 'Producto'}</div>
                      ${(item.product?.sku || item.sku) ? `<div class="product-sku">SKU: ${item.product?.sku || item.sku}</div>` : ''}
                    </td>
                    <td class="text-center">${item.quantity}</td>
                    <td class="text-right">${formatCurrency(item.unit_price)}</td>
                    <td class="text-right"><strong>${formatCurrency(item.quantity * item.unit_price)}</strong></td>
                  </tr>
                `).join('') : '<tr><td colspan="4" style="text-align: center; padding: 30px;">No hay productos</td></tr>'}
              </tbody>
            </table>
          </div>

          <div class="totals-section">
            <div class="totals-row subtotal">
              <span>Subtotal:</span>
              <span>${formatCurrency(subtotal)}</span>
            </div>
            ${taxAmount > 0 ? `
              <div class="totals-row subtotal">
                <span>ITBIS/IVA (${taxRate}%):</span>
                <span>${formatCurrency(taxAmount)}</span>
              </div>
            ` : ''}
            ${discount > 0 ? `
              <div class="totals-row subtotal">
                <span>Descuento:</span>
                <span>-${formatCurrency(discount)}</span>
              </div>
            ` : ''}
            <div class="totals-row total">
              <span>TOTAL:</span>
              <span>${formatCurrency(total)}</span>
            </div>
          </div>

          ${sale.notes ? `
            <div class="notes-section">
              <div class="notes-title">📝 NOTAS</div>
              <div class="notes-content">${sale.notes}</div>
            </div>
          ` : ''}

          <div class="document-footer">
            <div class="terms-section">
              <div class="terms-title">GRACIAS POR SU COMPRA</div>
              <div class="terms-content">
                <p>Esta factura es válida como comprobante de compra.</p>
                <p>Para cualquier consulta, no dude en contactarnos.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const generateQuotationPrintHTML = (quotation, formatCurrency, formatDate, organizationData = null) => {
  const logoUrl = organizationData?.logo_url || '/api/static/logos/default-logo.png';
  const companyName = organizationData?.name || 'Mi Empresa';
  const companyEmail = organizationData?.email || '';
  const companyPhone = organizationData?.phone || '';
  const companyAddress = organizationData?.address || '';

  const subtotal = quotation.subtotal || 0;
  const taxRate = quotation.tax_rate || 0;
  const taxAmount = subtotal * (taxRate / 100);
  const discount = quotation.discount || 0;
  const total = quotation.total_amount || (subtotal + taxAmount - discount);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Cotización #${quotation.quotation_number || quotation.id}</title>
      <style>
        ${getCommonStyles()}
        .document-header { background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); }
        .period-section { background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%); }
        .info-card { border-left-color: #8b5cf6; }
        .info-card-title { color: #8b5cf6; }
        thead { background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); }
        .section-title { border-bottom-color: #8b5cf6; }
        .totals-row.total { color: #8b5cf6; border-top-color: #8b5cf6; }
      </style>
    </head>
    <body>
      <div class="document-container">
        <div class="document-header">
          <div class="header-content">
            <div class="company-info">
              ${logoUrl ? `<img src="${logoUrl}" alt="Logo" class="company-logo" />` : ''}
              <div class="company-name">${companyName}</div>
              <div class="company-details">
                ${companyEmail ? `📧 ${companyEmail}<br>` : ''}
                ${companyPhone ? `📞 ${companyPhone}<br>` : ''}
                ${companyAddress ? `📍 ${companyAddress}` : ''}
              </div>
            </div>
            <div class="document-title-section">
              <div class="document-type">COTIZACIÓN</div>
              <div class="document-number">
                N° ${quotation.quotation_number || quotation.id}<br>
                Fecha: ${formatDate(quotation.created_at)}
              </div>
            </div>
          </div>
        </div>

        <div class="document-body">
          ${quotation.valid_until ? `
            <div class="period-section">
              <div class="period-title">⏰ VALIDEZ DE LA COTIZACIÓN</div>
              <div class="period-grid">
                <div class="period-item">
                  <label>Válida hasta</label>
                  <value>${formatDate(quotation.valid_until)}</value>
                </div>
              </div>
            </div>
          ` : ''}

          <div class="info-grid">
            <div class="info-card">
              <div class="info-card-title">👤 CLIENTE</div>
              <div class="info-row">
                <span class="info-label">Nombre:</span>
                <span class="info-value">${quotation.client?.name || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Email:</span>
                <span class="info-value">${quotation.client?.email || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Teléfono:</span>
                <span class="info-value">${quotation.client?.phone || 'N/A'}</span>
              </div>
            </div>

            <div class="info-card payment">
              <div class="info-card-title">📋 ESTADO</div>
              <div class="info-row">
                <span class="info-label">Estado:</span>
                <span class="info-value">
                  <span class="status-badge status-${quotation.status}">${quotation.status?.toUpperCase()}</span>
                </span>
              </div>
            </div>
          </div>

          <div class="products-section">
            <div class="section-title">📦 PRODUCTOS COTIZADOS</div>
            <table>
              <thead>
                <tr>
                  <th>PRODUCTO</th>
                  <th class="text-center">CANTIDAD</th>
                  <th class="text-right">PRECIO UNIT.</th>
                  <th class="text-right">SUBTOTAL</th>
                </tr>
              </thead>
              <tbody>
                ${quotation.items && quotation.items.length > 0 ? quotation.items.map(item => `
                  <tr>
                    <td>
                      <div class="product-name">${item.product_name || item.product?.name || 'Producto'}</div>
                      ${(item.product?.sku || item.sku) ? `<div class="product-sku">SKU: ${item.product?.sku || item.sku}</div>` : ''}
                    </td>
                    <td class="text-center">${item.quantity}</td>
                    <td class="text-right">${formatCurrency(item.unit_price)}</td>
                    <td class="text-right"><strong>${formatCurrency(item.quantity * item.unit_price)}</strong></td>
                  </tr>
                `).join('') : '<tr><td colspan="4" style="text-align: center; padding: 30px;">No hay productos</td></tr>'}
              </tbody>
            </table>
          </div>

          <div class="totals-section">
            <div class="totals-row subtotal">
              <span>Subtotal:</span>
              <span>${formatCurrency(subtotal)}</span>
            </div>
            ${taxAmount > 0 ? `
              <div class="totals-row subtotal">
                <span>ITBIS/IVA (${taxRate}%):</span>
                <span>${formatCurrency(taxAmount)}</span>
              </div>
            ` : ''}
            ${discount > 0 ? `
              <div class="totals-row subtotal">
                <span>Descuento:</span>
                <span>-${formatCurrency(discount)}</span>
              </div>
            ` : ''}
            <div class="totals-row total">
              <span>TOTAL:</span>
              <span>${formatCurrency(total)}</span>
            </div>
          </div>

          ${quotation.notes ? `
            <div class="notes-section">
              <div class="notes-title">📝 NOTAS</div>
              <div class="notes-content">${quotation.notes}</div>
            </div>
          ` : ''}

          <div class="document-footer">
            <div class="terms-section">
              <div class="terms-title">TÉRMINOS Y CONDICIONES</div>
              <div class="terms-content">
                <p>• Esta cotización es válida hasta la fecha indicada.</p>
                <p>• Los precios están sujetos a cambios sin previo aviso.</p>
                <p>• Para confirmar su pedido, por favor contáctenos.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Estilos comunes para todos los documentos
function getCommonStyles() {
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1a202c; line-height: 1.6; padding: 40px; background: #ffffff; }
    .document-container { max-width: 900px; margin: 0 auto; background: white; box-shadow: 0 0 30px rgba(0,0,0,0.1); border-radius: 12px; overflow: hidden; }
    .document-header { padding: 40px; color: white; position: relative; overflow: hidden; }
    .document-header::before { content: ''; position: absolute; top: -50%; right: -10%; width: 400px; height: 400px; background: rgba(255,255,255,0.1); border-radius: 50%; }
    .header-content { position: relative; z-index: 1; display: flex; justify-content: space-between; align-items: flex-start; }
    .company-info { flex: 1; }
    .company-logo { max-width: 180px; max-height: 80px; object-fit: contain; background: white; padding: 10px; border-radius: 8px; margin-bottom: 15px; }
    .company-name { font-size: 28px; font-weight: 700; margin-bottom: 8px; text-shadow: 0 2px 4px rgba(0,0,0,0.2); }
    .company-details { font-size: 13px; opacity: 0.95; line-height: 1.8; }
    .document-title-section { text-align: right; }
    .document-type { font-size: 32px; font-weight: 800; letter-spacing: 1px; margin-bottom: 10px; text-shadow: 0 2px 4px rgba(0,0,0,0.2); }
    .document-number { font-size: 16px; opacity: 0.9; font-weight: 500; }
    .document-body { padding: 40px; }
    .period-section { color: white; padding: 25px; border-radius: 12px; margin-bottom: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
    .period-title { font-size: 18px; font-weight: 700; margin-bottom: 15px; display: flex; align-items: center; gap: 10px; }
    .period-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; }
    .period-item label { display: block; font-size: 12px; opacity: 0.9; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px; }
    .period-item value { display: block; font-size: 18px; font-weight: 700; }
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 25px; margin-bottom: 30px; }
    .info-card { background: #f7fafc; border-left: 4px solid; padding: 20px; border-radius: 8px; }
    .info-card.payment { border-left-color: #48bb78; }
    .info-card-title { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 15px; display: flex; align-items: center; gap: 8px; }
    .info-card.payment .info-card-title { color: #48bb78; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
    .info-row:last-child { border-bottom: none; }
    .info-label { font-size: 13px; color: #64748b; font-weight: 500; }
    .info-value { font-size: 13px; color: #1e293b; font-weight: 600; }
    .products-section { margin: 30px 0; }
    .section-title { font-size: 20px; font-weight: 700; color: #1e293b; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 3px solid; }
    table { width: 100%; border-collapse: separate; border-spacing: 0; margin: 20px 0; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    thead { color: white; }
    th { padding: 15px; text-align: left; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    th.text-right { text-align: right; }
    th.text-center { text-align: center; }
    tbody tr { background: white; transition: background 0.2s; }
    tbody tr:nth-child(even) { background: #f8fafc; }
    tbody tr:hover { background: #eef2ff; }
    td { padding: 15px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
    td.text-right { text-align: right; }
    td.text-center { text-align: center; }
    .product-name { font-weight: 600; color: #1e293b; }
    .product-sku { display: none; }
    .totals-section { background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); padding: 25px; border-radius: 12px; margin-top: 30px; }
    .totals-row { display: flex; justify-content: space-between; padding: 10px 0; font-size: 15px; }
    .totals-row.subtotal { color: #64748b; }
    .totals-row.total { border-top: 3px solid; padding-top: 15px; margin-top: 10px; font-size: 24px; font-weight: 800; }
    .status-badge { display: inline-block; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    .status-activo, .status-aceptada, .status-completada { background: #c6f6d5; color: #22543d; }
    .status-vencido, .status-rechazada { background: #fed7d7; color: #742a2a; }
    .status-devuelto, .status-parcial { background: #bee3f8; color: #2c5282; }
    .status-pendiente { background: #fef3c7; color: #92400e; }
    .notes-section { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 8px; }
    .notes-title { font-weight: 700; color: #92400e; margin-bottom: 10px; font-size: 14px; }
    .notes-content { color: #78350f; font-size: 13px; line-height: 1.6; }
    .document-footer { margin-top: 50px; padding-top: 30px; border-top: 2px solid #e2e8f0; }
    .terms-section { background: #f7fafc; padding: 25px; border-radius: 8px; margin-bottom: 20px; }
    .terms-title { font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 15px; text-align: center; }
    .terms-content { font-size: 12px; color: #475569; line-height: 1.8; }
    .terms-content p { margin-bottom: 8px; }
    @media print { body { padding: 0; } .document-container { box-shadow: none; border-radius: 0; } .document-header::before { display: none; } tbody tr:hover { background: inherit; } }
  `;
}
