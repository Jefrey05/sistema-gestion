/**
 * Utilidades para exportar datos a diferentes formatos
 */

/**
 * Exporta datos a CSV con formato mejorado
 */
export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || data.length === 0) {
    alert('No hay datos para exportar');
    return;
  }

  // Obtener headers
  const headers = Object.keys(data[0]);
  
  // Crear contenido CSV con formato mejorado
  const csvContent = [
    // Header con información del reporte
    `# Reporte ZIBAMED - ${new Date().toLocaleDateString('es-ES')}`,
    `# Generado el ${new Date().toLocaleString('es-ES')}`,
    `# Sistema de Gestión Médica`,
    '', // Línea en blanco
    // Headers de datos
    headers.join(','),
    // Datos
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escapar comillas y agregar comillas si contiene comas
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  // Crear blob y descargar
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Exporta datos a Excel (usando CSV compatible con Excel)
 */
export const exportToExcel = (data, filename = 'export.xlsx') => {
  // Por ahora usamos CSV que Excel puede abrir
  // Para un formato .xlsx real, necesitaríamos una librería como xlsx
  const csvFilename = filename.replace('.xlsx', '.csv');
  exportToCSV(data, csvFilename);
};

/**
 * Exporta a PDF (versión mejorada con diseño profesional)
 */
export const exportToPDF = (title, content) => {
  const printWindow = window.open('', '', 'height=600,width=800');
  
  printWindow.document.write('<html><head><title>' + title + '</title>');
  printWindow.document.write('<style>');
  printWindow.document.write(`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body { 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 40px 20px;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      text-align: center;
      position: relative;
    }
    
    .header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
      opacity: 0.3;
    }
    
    .header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 8px;
      position: relative;
      z-index: 1;
    }
    
    .header p {
      font-size: 1.1rem;
      opacity: 0.9;
      position: relative;
      z-index: 1;
    }
    
    .content {
      padding: 40px;
    }
    
    table { 
      width: 100%; 
      border-collapse: collapse; 
      margin-top: 20px;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    
    th { 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 20px;
      text-align: left;
      font-weight: 600;
      font-size: 0.95rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    td { 
      padding: 16px 20px;
      border-bottom: 1px solid #f0f0f0;
      font-size: 0.95rem;
    }
    
    tr:nth-child(even) { background-color: #fafafa; }
    tr:hover { background-color: #f5f5f5; }
    
    .footer { 
      background: #f8f9fa;
      padding: 30px 40px;
      text-align: center;
      color: #6c757d;
      border-top: 1px solid #e9ecef;
    }
    
    .footer .logo {
      font-weight: 700;
      color: #667eea;
      font-size: 1.2rem;
      margin-bottom: 8px;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin: 30px 0;
    }
    
    .stat-card {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      padding: 20px;
      border-radius: 12px;
      text-align: center;
      border: 1px solid #e9ecef;
    }
    
    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: #667eea;
      margin-bottom: 4px;
    }
    
    .stat-label {
      color: #6c757d;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    @media print {
      body { background: white; padding: 0; }
      .container { box-shadow: none; border-radius: 0; }
    }
  `);
  printWindow.document.write('</style></head><body>');
  
  printWindow.document.write(`
    <div class="container">
      <div class="header">
        <h1>${title}</h1>
        <p>Reporte generado el ${new Date().toLocaleDateString('es-ES', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <div class="logo">ZIBAMED</div>
        <p>Sistema de Gestión Médica</p>
        <p>Generado el ${new Date().toLocaleString('es-ES')}</p>
      </div>
    </div>
  `);
  
  printWindow.document.write('</body></html>');
  
  printWindow.document.close();
  
  setTimeout(() => {
    printWindow.print();
  }, 500);
};

/**
 * Convierte array de objetos a tabla HTML
 */
export const dataToHTMLTable = (data, headers = null) => {
  if (!data || data.length === 0) return '<p>No hay datos</p>';
  
  const tableHeaders = headers || Object.keys(data[0]);
  
  let html = '<table>';
  html += '<thead><tr>';
  tableHeaders.forEach(header => {
    html += `<th>${header}</th>`;
  });
  html += '</tr></thead>';
  
  html += '<tbody>';
  data.forEach(row => {
    html += '<tr>';
    tableHeaders.forEach(header => {
      html += `<td>${row[header] !== undefined ? row[header] : ''}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody>';
  html += '</table>';
  
  return html;
};

/**
 * Formatea datos del dashboard para exportación
 */
export const formatDashboardData = (stats) => {
  const totalIncomeAllTime = (stats?.total_sales_all_time || 0) + (stats?.total_rentals_all_time || 0);
  const totalIncomePeriod = (stats?.total_sales_month || 0) + (stats?.rental_income_month || 0);
  
  return [
    { Métrica: 'Ingreso General (Total Sistema)', Valor: `$${totalIncomeAllTime.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { Métrica: 'Ingreso Total (Período)', Valor: `$${totalIncomePeriod.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { Métrica: 'Ventas del Mes', Valor: `$${(stats.total_sales_month || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { Métrica: 'Alquileres del Mes', Valor: `$${(stats.rental_income_month || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { Métrica: 'Clientes Activos', Valor: stats.active_clients || 0 },
    { Métrica: 'Alquileres Activos', Valor: stats.active_rentals || 0 },
    { Métrica: 'Productos en Stock', Valor: stats.total_products || 0 },
    { Métrica: 'Stock Bajo', Valor: stats.low_stock_products || 0 },
    { Métrica: 'Cotizaciones Pendientes', Valor: stats.pending_quotations || 0 },
    { Métrica: 'Pagos Pendientes', Valor: `$${(stats.pending_payments || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }
  ];
};

/**
 * Formatea datos de productos para exportación
 */
export const formatProductsData = (products) => {
  return products.map(p => ({
    'Nombre': p.name,
    'SKU': p.sku || 'N/A',
    'Categoría': p.category?.name || 'N/A',
    'Proveedor': p.supplier?.name || 'N/A',
    'Precio': `$${p.price}`,
    'Stock': p.stock || 0,
    'Stock Mínimo': p.min_stock || 0
  }));
};

/**
 * Formatea datos de ventas para exportación
 */
export const formatSalesData = (sales) => {
  return sales.map(s => ({
    'Número': s.sale_number,
    'Cliente': s.client?.name || 'N/A',
    'Fecha': new Date(s.sale_date).toLocaleDateString(),
    'Total': `$${s.total}`,
    'Pagado': `$${s.paid_amount}`,
    'Saldo': `$${s.balance}`,
    'Estado': s.status,
    'Método de Pago': s.payment_method
  }));
};

/**
 * Formatea datos de clientes para exportación
 */
export const formatClientsData = (clients) => {
  return clients.map(c => ({
    'Nombre': c.name,
    'Email': c.email || 'N/A',
    'Teléfono': c.phone || 'N/A',
    'Ciudad': c.city || 'N/A',
    'Tipo': c.client_type || 'N/A'
  }));
};








