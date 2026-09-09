async function cargarPqrs() {
    const respuesta = await fetch("/pqrs");

    if (!respuesta.ok) {
        document.body.innerHTML += "<p>No autorizado o no hay sesión activa.</p>";
        return;
    }

    const pqrs = await respuesta.json();
    const cuerpoTabla = document.getElementById("cuerpo-tabla");
    cuerpoTabla.innerHTML = ""; // limpia antes de volver a pintar

    pqrs.forEach(pqr => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${pqr.id}</td>
            <td>${pqr.motivo}</td>
            <td>${pqr.estado}</td>
            <td>
                <input type="text" id="categoria-${pqr.id}" placeholder="Categoría">
                <button onclick="clasificar(${pqr.id})">Clasificar</button>
            </td>
            <td>
                <input type="number" id="area-${pqr.id}" placeholder="ID del área">
                <button onclick="asignar(${pqr.id})">Asignar</button>
            </td>
        `;
        cuerpoTabla.appendChild(fila);
    });
}

async function clasificar(pqrId) {
    const categoria = document.getElementById(`categoria-${pqrId}`).value;

    const respuesta = await fetch(`/pqrs/${pqrId}/clasificar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoria }),
    });

    if (respuesta.ok) {
        cargarPqrs(); // recarga la tabla para reflejar el nuevo estado
    } else {
        alert("Error al clasificar la PQR");
    }
}

async function asignar(pqrId) {
    const areaId = document.getElementById(`area-${pqrId}`).value;

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

cargarPqrs();