async function cargarKanbanOperario() {
    const container = document.getElementById('kanbanContainer');
    if (!container) return;

    container.innerHTML = '<div class="empty-state">⏳ Cargando piezas Kanban...</div>';

    const piezas = await cargarFirebase('piezas_kanban', true);
const arr = Object.entries(piezas).sort((a, b) => {
    const stockA = a[1].stockActual || 0;
    const stockB = b[1].stockActual || 0;
    const criticoA = a[1].stockCritico || 5;
    const criticoB = b[1].stockCritico || 5;

    const pesoA = stockA === 0 ? 0 : (stockA <= criticoA ? 1 : 2);
    const pesoB = stockB === 0 ? 0 : (stockB <= criticoB ? 1 : 2);

    if (pesoA !== pesoB) return pesoA - pesoB;

    return (a[1].nombre || '').localeCompare(b[1].nombre || '');
});

    if (!arr.length) {
        container.innerHTML = `
            <div class="empty-state">
                <div style="font-size:2.5rem;margin-bottom:10px;">📦</div>
                <div>No hay piezas en el Kanban</div>
                <div style="font-size:0.8rem;color:#94a3b8;margin-top:6px;">El admin debe crearlas primero</div>
            </div>`;
        return;
    }

const total = arr.length;
const criticos = arr.filter(([id, p]) => {
    const stock = p.stockActual || 0;
    const critico = p.stockCritico || 5;
    return stock > 0 && stock <= critico;
}).length;
const agotados = arr.filter(([id, p]) => (p.stockActual || 0) === 0).length;

let html = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-bottom:1.2rem;">
          <div style="background:linear-gradient(135deg,#fff7ed,white);border:1px solid #fed7aa;border-radius:14px;padding:1rem;text-align:center;">
            <div style="font-size:1.5rem;margin-bottom:4px;">⚠️</div>
            <div style="font-size:1.6rem;font-weight:800;color:#b91c1c;line-height:1;">${criticos}</div>
            <div style="font-size:0.72rem;color:#b91c1c;font-weight:600;margin-top:4px;">Stock crítico</div>
        </div>
      <div style="background:linear-gradient(135deg,#fef2f2,white);border:1px solid #fecaca;border-radius:14px;padding:1rem;text-align:center;">
            <div style="font-size:1.5rem;margin-bottom:4px;">🚫</div>
            <div style="font-size:1.6rem;font-weight:800;color:#c2410c;line-height:1;">${agotados}</div>
            <div style="font-size:0.72rem;color:#c2410c;font-weight:600;margin-top:4px;">Agotados</div>
        </div>
    </div>

        <div style="margin-bottom:1rem;">
            <input type="text" id="kanbanBusqueda" placeholder="🔍 Buscar pieza por nombre o código..."
                oninput="filtrarKanbanOperario()"
                style="width:100%;padding:10px 14px;border-radius:10px;border:1px solid #cbd5e1;font-size:0.85rem;font-family:inherit;">
        </div>

        <div id="kanbanListaPiezas" style="display:flex;flex-direction:column;gap:8px;">
    `;

    arr.forEach(([id, p]) => {
        const stock = p.stockActual || 0;
        const critico = p.stockCritico || 5;
        const estaCritico = stock <= critico;
        const estaAgotado = stock === 0;
        const color = estaAgotado ? '#ef4444' : estaCritico ? '#f59e0b' : '#10b981';
        const emoji = estaAgotado ? '🚫' : estaCritico ? '⚠️' : '✅';

        const tieneAviso = !!p.mensajeAdmin;
const borderIzq = tieneAviso ? '#f59e0b' : color;

html += `
    <div class="kanban-item" data-busqueda="${(p.nombre + ' ' + (p.codigo||'')).toLowerCase()}"
        style="background:white;border:1px solid #e5e7eb;border-left:4px solid ${borderIzq};border-radius:12px;padding:12px 14px;">
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
            <div style="width:40px;height:40px;background:#f1f5f9;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0;">${emoji}</div>
            <div style="flex:1;min-width:140px;">
                <div style="font-weight:700;font-size:0.9rem;color:#1e293b;">${p.nombre || 'Sin nombre'}</div>
                <div style="font-size:0.72rem;color:#64748b;font-family:'SF Mono',Monaco,monospace;margin-top:2px;">
                    ${p.codigo || '—'} · 📍 ${p.ubicacion || 'Sin ubicación'}
                </div>
            </div>
            <div style="text-align:right;flex-shrink:0;">
                <div style="font-size:1.3rem;font-weight:800;color:${color};line-height:1;">${stock}</div>
                <div style="font-size:0.68rem;color:#94a3b8;font-weight:600;">mín: ${critico}</div>
            </div>
        </div>
        ${tieneAviso ? `
            <div style="margin-top:10px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:10px 12px;display:flex;align-items:flex-start;gap:8px;">
                <span style="font-size:1rem;flex-shrink:0;">💬</span>
                <div style="flex:1;min-width:0;">
                    <div style="font-size:0.7rem;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:3px;">Aviso del admin</div>
                    <div style="font-size:0.82rem;color:#78350f;line-height:1.4;font-weight:500;">${p.mensajeAdmin}</div>
                </div>
            </div>
        ` : ''}
    </div>
`;
    });

    html += '</div>';
    container.innerHTML = html;
}

function filtrarKanbanOperario() {
    const q = (document.getElementById('kanbanBusqueda')?.value || '').toLowerCase().trim();
    document.querySelectorAll('.kanban-item').forEach(el => {
        const coincide = !q || (el.dataset.busqueda || '').includes(q);
        el.style.display = coincide ? 'block' : 'none';
    });
}
