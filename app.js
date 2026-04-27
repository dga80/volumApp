// Estado de la aplicación
let pedidos = [];

// Referencias a elementos del DOM
const form = document.getElementById('pedidoForm');
const tableBody = document.getElementById('pedidosTableBody');
const tableFooter = document.getElementById('pedidosTableFooter');
const selectAllCheckbox = document.getElementById('selectAll');
const eliminarBtn = document.getElementById('eliminarSeleccionadosBtn');
const exportarBtn = document.getElementById('exportarExcelBtn');
const limpiarFormBtn = document.getElementById('limpiarFormBtn');

// Event Listeners
form.addEventListener('submit', agregarPedido);
selectAllCheckbox.addEventListener('change', seleccionarTodos);
eliminarBtn.addEventListener('click', eliminarSeleccionados);
exportarBtn.addEventListener('click', exportarAExcel);
limpiarFormBtn.addEventListener('click', limpiarFormulario);

// Función para calcular el volumen en metros cúbicos
function calcularVolumen(largo, ancho, alto) {
    // Convertir de mm³ a m³ dividiendo entre 1,000,000,000
    const volumenMm3 = largo * ancho * alto;
    const volumenM3 = volumenMm3 / 1000000000;
    return volumenM3;
}



// Agregar pedido
function agregarPedido(e) {
    e.preventDefault();

    const numeroPedido = document.getElementById('numeroPedido').value.trim();
    const largo = parseFloat(document.getElementById('largo').value);
    const ancho = parseFloat(document.getElementById('ancho').value);
    const alto = parseFloat(document.getElementById('alto').value);
    const pesoNeto = parseFloat(document.getElementById('peso').value);

    // Validaciones
    if (!numeroPedido || !largo || !ancho || !alto || !pesoNeto) {
        alert('Por favor, completa todos los campos obligatorios');
        return;
    }

    if (largo <= 0 || ancho <= 0 || alto <= 0 || pesoNeto <= 0) {
        alert('Las medidas y el peso deben ser mayores a 0');
        return;
    }

    // Calcular volumen
    const volumen = calcularVolumen(largo, ancho, alto);

    // Crear objeto pedido
    const pedido = {
        id: Date.now(),
        numeroPedido,
        largo,
        ancho,
        alto,
        volumen,
        pesoNeto,
        seleccionado: false
    };

    // Agregar a la lista
    pedidos.push(pedido);

    // Renderizar tabla
    renderizarTabla();

    // Limpiar formulario
    form.reset();
    document.getElementById('numeroPedido').focus();

    // Pequeña animación de éxito
    const btn = form.querySelector('button[type="submit"]');
    btn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        btn.style.transform = '';
    }, 150);
}

// Renderizar tabla
function renderizarTabla() {
    // Limpiar tabla
    tableBody.innerHTML = '';

    if (pedidos.length === 0) {
        tableBody.innerHTML = `
            <tr class="empty-row">
                <td colspan="7">
                    <div class="empty-state">
                        <svg class="icon-large" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                        </svg>
                        <p>No hay pedidos registrados</p>
                        <p class="hint">Completa el formulario para agregar tu primer pedido</p>
                    </div>
                </td>
            </tr>
        `;
        tableFooter.style.display = 'none';
        return;
    }

    // Renderizar pedidos
    pedidos.forEach((pedido, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="checkbox-col">
                <input type="checkbox" data-id="${pedido.id}" ${pedido.seleccionado ? 'checked' : ''}>
            </td>
            <td>${pedido.numeroPedido}</td>
            <td>${pedido.largo.toFixed(0)}</td>
            <td>${pedido.alto.toFixed(0)}</td>
            <td>${pedido.ancho.toFixed(0)}</td>
            <td>${pedido.volumen.toFixed(3)}</td>
            <td>${Math.round(pedido.pesoNeto)}</td>
        `;

        // Event listener para checkbox
        const checkbox = row.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', (e) => {
            pedido.seleccionado = e.target.checked;
            actualizarBotones();
        });

        tableBody.appendChild(row);
    });

    // Calcular y mostrar totales
    calcularTotales();
    tableFooter.style.display = '';

    // Actualizar estado de botones
    actualizarBotones();
}

// Calcular totales
function calcularTotales() {
    const totalVol = pedidos.reduce((sum, p) => sum + p.volumen, 0);
    const totalPes = pedidos.reduce((sum, p) => sum + p.pesoNeto, 0);

    document.getElementById('totalVolumen').textContent = totalVol.toFixed(3);
    document.getElementById('totalPeso').textContent = Math.round(totalPes);
}

// Seleccionar todos
function seleccionarTodos(e) {
    const checked = e.target.checked;
    pedidos.forEach(p => p.seleccionado = checked);
    renderizarTabla();
}

// Actualizar estado de botones
function actualizarBotones() {
    const haySeleccionados = pedidos.some(p => p.seleccionado);
    eliminarBtn.disabled = !haySeleccionados;

    // Actualizar checkbox "select all"
    const todosSeleccionados = pedidos.length > 0 && pedidos.every(p => p.seleccionado);
    selectAllCheckbox.checked = todosSeleccionados;
}

// Eliminar pedidos seleccionados
function eliminarSeleccionados() {
    const seleccionados = pedidos.filter(p => p.seleccionado).length;

    if (!confirm(`¿Estás seguro de eliminar ${seleccionados} pedido(s)?`)) {
        return;
    }

    pedidos = pedidos.filter(p => !p.seleccionado);
    selectAllCheckbox.checked = false;
    renderizarTabla();
}

// Limpiar formulario
function limpiarFormulario() {
    form.reset();
    document.getElementById('numeroPedido').focus();
}

// Exportar a Excel
function exportarAExcel() {
    if (pedidos.length === 0) {
        alert('No hay pedidos para exportar');
        return;
    }

    // Preparar datos para Excel
    const data = [];

    // Encabezados
    data.push(['Pedido', 'Largo (mm)', 'Alto (mm)', 'Ancho (mm)', 'Vol. (m³)', 'Peso Neto (kg)']);

    // Pedidos
    pedidos.forEach(p => {
        data.push([
            p.numeroPedido,
            p.largo,
            p.alto,
            p.ancho,
            p.volumen,
            Math.round(p.pesoNeto)
        ]);
    });

    // Calcular totales
    const totalVol = pedidos.reduce((sum, p) => sum + p.volumen, 0);
    const totalPes = pedidos.reduce((sum, p) => sum + p.pesoNeto, 0);

    // Fila de totales con fórmulas
    const startRow = 2; // Fila donde empiezan los datos (después del encabezado)
    const endRow = startRow + pedidos.length - 1;

    data.push([
        'TOTALES',
        null,
        null,
        null,
        totalVol, // Valor calculado
        Math.round(totalPes) // Valor calculado
    ]);

    // Crear workbook y worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Aplicar formato a columnas
    const columnWidths = [
        { wch: 12 }, // Pedido
        { wch: 12 }, // Largo
        { wch: 12 }, // Alto
        { wch: 12 }, // Ancho
        { wch: 12 }, // Volumen
        { wch: 18 }  // Peso Neto
    ];
    ws['!cols'] = columnWidths;

    // Establecer fórmulas para totales (opcional - actualmente usando valores)
    // Si quieres usar fórmulas en lugar de valores calculados:
    const totalRowIndex = data.length - 1;
    const volColLetter = 'E';
    const pesoColLetter = 'F';

    // Reemplazar valores con fórmulas
    ws[`${volColLetter}${totalRowIndex + 1}`] = {
        f: `SUM(${volColLetter}${startRow}:${volColLetter}${endRow})`,
        t: 'n'
    };
    ws[`${pesoColLetter}${totalRowIndex + 1}`] = {
        f: `SUM(${pesoColLetter}${startRow}:${pesoColLetter}${endRow})`,
        t: 'n'
    };

    // Agregar hoja al workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Hoja1');

    // Generar nombre de archivo
    let nombreArchivo;
    if (pedidos.length === 1) {
        const p = pedidos[0];
        nombreArchivo = `${p.numeroPedido}_medidas.xlsx`;
    } else {
        const fecha = new Date().toISOString().split('T')[0];
        nombreArchivo = `Pedidos_${fecha}.xlsx`;
    }

    // Descargar archivo
    XLSX.writeFile(wb, nombreArchivo);

    // Feedback visual
    exportarBtn.innerHTML = `
        <svg class="icon-small" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
        </svg>
        ¡Exportado!
    `;

    setTimeout(() => {
        exportarBtn.innerHTML = `
            <svg class="icon-small" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Exportar a Excel
        `;
    }, 2000);
}

// Cargar datos de ejemplo (opcional - comentado por defecto)
/*
function cargarDatosEjemplo() {
    const ejemplos = [
        { numeroPedido: '6541', largo: 60, ancho: 225, alto: 50 },
        { numeroPedido: '6454.1', largo: 105, ancho: 125, alto: 43 },
        { numeroPedido: '6454.2', largo: 105, ancho: 125, alto: 43 }
    ];
    
    ejemplos.forEach(ej => {
        const volumen = calcularVolumen(ej.largo, ej.ancho, ej.alto);
        const pesoVolumetrico = calcularPesoVolumetrico(volumen, 167);
        
        pedidos.push({
            id: Date.now() + Math.random(),
            numeroPedido: ej.numeroPedido,
            largo: ej.largo,
            ancho: ej.ancho,
            alto: ej.alto,
            volumen,
            pesoVolumetrico,
            seleccionado: false
        });
    });
    
    renderizarTabla();
}

// Descomentar para cargar datos de ejemplo al inicio
// cargarDatosEjemplo();
*/
