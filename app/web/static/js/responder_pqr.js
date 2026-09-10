function badgeEstado(estado) {
    return `<span class="badge-estado badge-${estado}">${estado}</span>`;
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

        const celdaRespuesta = pqr.respuesta
            ? `<span>${pqr.respuesta}</span>`
            : `<input type="text" id="respuesta-${pqr.id}" placeholder="Escribe la respuesta">
               <button onclick="responder(${pqr.id})">Responder</button>`;

        fila.innerHTML = `
            <td>${new Date(pqr.fecha_creacion).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
            <td>${pqr.motivo}</td>
            <td>${pqr.descripcion}</td>
            <td>${badgeEstado(pqr.estado)}</td>
            <td>${celdaRespuesta}</td>
        `;
        cuerpoTabla.appendChild(fila);
    });
}

async function responder(pqrId) {
    const respuestaTexto = document.getElementById(`respuesta-${pqrId}`).value.trim();

    if (!respuestaTexto) {
        alert("Escribe una respuesta antes de continuar");
        return;
    }

    const respuesta = await fetch(`/pqrs/${pqrId}/responder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ respuesta: respuestaTexto }),
    });

    if (respuesta.ok) {
        cargarPqrs();
    } else {
        alert("Error al responder la PQR");
    }
}

cargarPqrs();