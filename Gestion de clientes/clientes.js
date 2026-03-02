/* --- NAVEGACIÓN --- */
function showTab(tabId, btn) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    btn.classList.add('active');
}

/* --- LÓGICA VISTA TARJETAS --- */
let clientes = [
    { id:1, nombre:"Adriana Wilches", servicio:"Urocaq EU IPS", nit:"828002088", plan:"Plan Premium", fecha:"2024-01-15", activo:true },
    { id:2, nombre:"Carlos Méndez", servicio:"Clínica Central", nit:"900123456", plan:"Plan Básico", fecha:"2023-09-10", activo:false }
];

function renderClientes() {
    const container = document.getElementById("clientesContainer");
    if(!container) return;
    container.innerHTML = "";
    clientes.forEach(cliente => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <h3>${cliente.nombre}</h3>
            <p>${cliente.servicio}</p>
            <p><strong>NIT:</strong> ${cliente.nit}</p>
            <p>Estado: <span class="${cliente.activo?'badge-activo':'badge-inactivo'}">${cliente.activo?'Activo':'Inactivo'}</span></p>
            <p>Plan: ${cliente.plan}</p>
            <p>Activo desde: ${cliente.fecha}</p>
            <div class="card-actions">
                <button class="btn btn-primary" onclick="editarCliente(${cliente.id})">Editar</button>
                <button class="btn btn-secondary" onclick="suspenderCliente(${cliente.id})">${cliente.activo?'Suspender':'Activar'}</button>
                <button class="btn btn-secondary" onclick="desasociarCliente(${cliente.id})">Desasociar</button>
                <button class="btn btn-danger" onclick="eliminarCliente(${cliente.id})">Eliminar</button>
            </div>`;
        container.appendChild(card);
    });
}

function eliminarCliente(id) { if(confirm("¿Eliminar cliente?")) { clientes=clientes.filter(c=>c.id!==id); renderClientes(); } }
function suspenderCliente(id) { clientes=clientes.map(c=>{ if(c.id===id) return {...c,activo:!c.activo}; return c; }); renderClientes(); }
function desasociarCliente(id) { if(confirm("¿Desasociar cliente?")) { clientes=clientes.filter(c=>c.id!==id); renderClientes(); } }

function editarCliente(id) {
    const cliente = clientes.find(c => c.id === id);
    document.getElementById('clienteId').value = cliente.id;
    document.getElementById('nombre').value = cliente.nombre;
    document.getElementById('servicio').value = cliente.servicio;
    document.getElementById('nit').value = cliente.nit;
    document.getElementById('plan').value = cliente.plan;
    document.getElementById('fecha').value = cliente.fecha;
    document.getElementById('modalTitulo').innerText = "Editar Cliente";
    document.getElementById('modalCliente').classList.remove("hidden");
}

document.getElementById('clienteForm').addEventListener("submit", function(e) {
    e.preventDefault();
    const id = document.getElementById('clienteId').value;
    const nuevo = {
        id: id ? Number(id) : Date.now(),
        nombre: document.getElementById('nombre').value,
        servicio: document.getElementById('servicio').value,
        nit: document.getElementById('nit').value,
        plan: document.getElementById('plan').value,
        fecha: document.getElementById('fecha').value,
        activo: true
    };
    if(id) clientes = clientes.map(c => c.id == id ? nuevo : c);
    else clientes.push(nuevo);
    cerrarModal();
    renderClientes();
});

function abrirModalCrear() { 
    document.getElementById('clienteForm').reset(); 
    document.getElementById('clienteId').value = ""; 
    document.getElementById('modalTitulo').innerText = "Nuevo Cliente"; 
    document.getElementById('modalCliente').classList.remove("hidden"); 
}
function cerrarModal() { document.getElementById('modalCliente').classList.add("hidden"); }

/* --- LÓGICA MÓDULO ALIADOS (TABLA) --- */
let nextId = 3;

function downloadExcel() {
    const table = document.getElementById("clientTable");
    const cloneTable = table.cloneNode(true);
    const rows = cloneTable.rows;
    for (let i = 0; i < rows.length; i++) { rows[i].deleteCell(-1); }
    const wb = XLSX.utils.table_to_book(cloneTable, {sheet: "Aliados"});
    XLSX.writeFile(wb, "Gestion_Aliados.xlsx");
}

function saveClient() {
    const idInput = document.getElementById('edit-id').value;
    const name = document.getElementById('name').value;
    const nit = document.getElementById('NIT').value;
    const plan = document.getElementById('Plan').value;
    const date = document.getElementById('Active since').value;
    
    if (!name || !nit) { alert("Completa al menos Nombre y NIT"); return; }

    if (idInput) {
        const row = document.getElementById('row-' + idInput);
        row.cells[1].innerText = name;
        row.cells[2].innerText = nit;
        row.cells[4].innerText = plan;
        row.cells[5].innerText = date;
        document.getElementById('edit-id').value = "";
    } else {
        const table = document.getElementById('clientTable').getElementsByTagName('tbody')[0];
        const newRow = table.insertRow();
        const id = nextId++;
        newRow.id = "row-" + id;
        newRow.innerHTML = `<td>${id}</td><td>${name}</td><td>${nit}</td><td><span class="badge active">Activo</span></td><td>${plan}</td><td>${date}</td>
            <td>
                <button class="btn btn-edit" onclick="editRow(${id})">Editar</button>
                <button class="btn btn-suspend" onclick="toggleStatus(${id})">Suspender</button>
                <button class="btn btn-unlink" onclick="unlinkRow(${id})">Desasociar</button>
                <button class="btn btn-delete" onclick="deleteRow(${id})">Eliminar</button>
            </td>`;
    }
    clearForm();
}

function clearForm() {
    document.getElementById('name').value = ""; document.getElementById('NIT').value = "";
    document.getElementById('state').value = ""; document.getElementById('Plan').value = "";
    document.getElementById('Active since').value = ""; document.getElementById('edit-id').value = "";
}

function editRow(id) {
    const row = document.getElementById('row-' + id);
    document.getElementById('name').value = row.cells[1].innerText;
    document.getElementById('NIT').value = row.cells[2].innerText;
    document.getElementById('Plan').value = row.cells[4].innerText;
    document.getElementById('Active since').value = row.cells[5].innerText;
    document.getElementById('edit-id').value = id;
}

function deleteRow(id) { if(confirm("¿Eliminar este cliente?")) { document.getElementById('row-' + id).remove(); } }

function toggleStatus(id) {
    const row = document.getElementById('row-' + id);
    const badge = row.cells[3].querySelector('.badge');
    if (badge.innerText === "Activo") { badge.innerText = "Suspendido"; badge.className = "badge suspended"; }
    else { badge.innerText = "Activo"; badge.className = "badge active"; }
}

function unlinkRow(id) { alert("Cliente " + id + " desasociado del aliado correctamente."); document.getElementById('row-' + id).style.opacity = "0.3"; }

/* INICIO AUTOMÁTICO */
document.addEventListener("DOMContentLoaded", renderClientes);
function desasociarCliente(id) {
    const cli = clientes.find(c => c.id === id);
    if (!cli) return;

    // 1. Pedimos la confirmación inicial
    if (confirm(`¿Seguro que desea desasociar a ${cli.nombre}? El vínculo se romperá.`)) {
        
        // 2. Pedimos el motivo de la desasociación
        let motivo = prompt("Por favor, ingrese el motivo de la desasociación:", "");

        // 3. Verificamos que no haya cancelado el cuadro de texto
        if (motivo !== null) {
            if (motivo.trim() === "") {
                alert("Debes indicar un motivo para poder desasociar al cliente.");
                return; // Cancela la operación si no escribió nada
            }

            // Aquí podrías guardar el motivo en tu base de datos o enviarlo a un servidor
            console.log(`Cliente ${id} desasociado por: ${motivo}`);
            
            // 4. Procedemos a eliminarlo de la lista visual
            clientes = clientes.filter(c => c.id !== id);
            
            alert("Cliente desasociado con éxito.");
            renderizarTodo();
        }
    }
}