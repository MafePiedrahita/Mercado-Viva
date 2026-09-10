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

function opcionesCategoria(seleccionActual) {
    let html = `<option value="">Selecciona...</option>`;
    CATEGORIAS.forEach(cat => {
        const marcado = cat === seleccionActual ? "selected" : "";
        html += `<option value="${cat}" ${marcado}>${cat}</option>`;
    });
    return html;
}

function opcionesArea() {
    let html = `<option value="">Selecciona...</option>`;
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
        fila.innerHTML = `
            <td>${new Date(pqr.fecha_creacion).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
            <td>${pqr.motivo}</td>
            <td>${badgeEstado(pqr.estado)}</td>
            <td>
                <select id="categoria-${pqr.id}">${opcionesCategoria(pqr.categoria)}</select>
                <button onclick="clasificar(${pqr.id})">Clasificar</button>
            </td>
            <td>
                <select id="area-${pqr.id}">${opcionesArea()}</select>
                <button onclick="asignar(${pqr.id})">Asignar</button>
            </td>
        `;
        cuerpoTabla.appendChild(fila);
    });
}

async function clasificar(pqrId) {
    const categoria = document.getElementById(`categoria-${pqrId}`).value;

    if (!categoria) {
        alert("Selecciona una categoría antes de clasificar");
        return;
    }

    const respuesta = await fetch(`/pqrs/${pqrId}/clasificar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoria }),
    });

    if (respuesta.ok) {
        cargarPqrs();
    } else {
        alert("Error al clasificar la PQR");
    }
}

async function asignar(pqrId) {
    const areaId = document.getElementById(`area-${pqrId}`).value;

    if (!areaId) {
        alert("Selecciona un área antes de asignar");
        return;
    }

    const respuesta = await fetch(`/pqrs/${pqrId}/asignar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ area_id: parseInt(areaId) }),
    });

    if (respuesta.ok) {
        cargarPqrs();
    } else {
        alert("Error al asignar la PQR");
    }
}

async function iniciar() {
    await cargarAreas();
    await cargarPqrs();
}

iniciar();