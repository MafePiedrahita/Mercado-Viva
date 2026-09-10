const CATEGORIAS = [
    "Calidad del producto",
    "Atención al cliente",
    "Protección de datos",
    "Facturación",
    "Logística/entrega",
];

let areasDisponibles = [];

function badgeEstado(estado) {
    return `<span class="badge-estado badge-${estado}">${estado}</span>`;
}

function opcionesCategoria() {
    let html = `<option value="">Categoría...</option>`;
    CATEGORIAS.forEach(cat => {
        html += `<option value="${cat}">${cat}</option>`;
    });
    return html;
}

function opcionesArea() {
    let html = `<option value="">Área...</option>`;
    areasDisponibles.forEach(area => {
        html += `<option value="${area.id}">${area.nombre}</option>`;
    });
    return html;
}

async function cargarAreas() {
    const respuesta = await fetch("/areas");
    if (respuesta.ok) {
        areasDisponibles = await respuesta.json();
    }
}

async function cargarPqrs() {
    const respuesta = await fetch("/pqrs");

    if (!respuesta.ok) {
        document.body.innerHTML += "<p>No autorizado o no hay sesión activa.</p>";
        return;
    }

    const pqrs = await respuesta.json();
    const cuerpoTabla = document.getElementById("cuerpo-tabla");
    cuerpoTabla.innerHTML = "";

    pqrs.forEach(pqr => {
        const fila = document.createElement("tr");

        const celdaAsignar = pqr.estado === "registrada"
            ? `<select id="categoria-${pqr.id}">${opcionesCategoria()}</select>
               <select id="area-${pqr.id}">${opcionesArea()}</select>
               <button onclick="clasificarYAsignar(${pqr.id})">Clasificar y asignar</button>`
            : `<span style="color: var(--texto-suave); font-size: 0.85rem;">Ya asignada</span>`;

        const celdaCerrar = pqr.estado === "respondida"
            ? `<button onclick="cerrarPqr(${pqr.id})">Cerrar</button>`
            : `<span style="color: var(--texto-suave); font-size: 0.85rem;">—</span>`;

        fila.innerHTML = `
            <td>${new Date(pqr.fecha_creacion).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
            <td>${pqr.motivo}</td>
            <td>${badgeEstado(pqr.estado)}</td>
            <td>${celdaAsignar}</td>
            <td>${celdaCerrar}</td>
        `;
        cuerpoTabla.appendChild(fila);
    });
}

async function clasificarYAsignar(pqrId) {
    const categoria = document.getElementById(`categoria-${pqrId}`).value;
    const areaId = document.getElementById(`area-${pqrId}`).value;

    if (!categoria || !areaId) {
        alert("Selecciona categoría y área antes de continuar");
        return;
    }

    const respuesta = await fetch(`/pqrs/${pqrId}/asignar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoria, area_id: parseInt(areaId) }),
    });

    if (respuesta.ok) {
        cargarPqrs();
    } else {
        alert("Error al clasificar y asignar la PQR");
    }
}

async function cerrarPqr(pqrId) {
    const respuesta = await fetch(`/pqrs/${pqrId}/cerrar`, {
        method: "PATCH",
    });

    if (respuesta.ok) {
        cargarPqrs();
    } else {
        const error = await respuesta.json();
        alert(error.detail);
    }
}

async function iniciar() {
    await cargarAreas();
    await cargarPqrs();
}

iniciar();