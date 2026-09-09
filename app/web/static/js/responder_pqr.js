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

        // Si ya tiene respuesta, solo la mostramos (no dejamos volver a responder)
        const celdaRespuesta = pqr.respuesta
            ? `<td>${pqr.respuesta}</td>`
            : `<td>
                 <input type="text" id="respuesta-${pqr.id}" placeholder="Escribe la respuesta">
                 <button onclick="responder(${pqr.id})">Responder</button>
               </td>`;

        fila.innerHTML = `
            <td>${pqr.id}</td>
            <td>${pqr.motivo}</td>
            <td>${pqr.descripcion}</td>
            <td>${pqr.estado}</td>
            ${celdaRespuesta}
        `;
        cuerpoTabla.appendChild(fila);
    });
}

async function responder(pqrId) {
    const respuestaTexto = document.getElementById(`respuesta-${pqrId}`).value;

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