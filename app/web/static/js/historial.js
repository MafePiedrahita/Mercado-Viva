async function cargarHistorial() {
    const respuesta = await fetch("/pqrs/historial");

    if (!respuesta.ok) {
        document.body.innerHTML += "<p>No se pudo cargar el historial. ¿Iniciaste sesión?</p>";
        return;
    }

    const pqrs = await respuesta.json();
    const cuerpoTabla = document.getElementById("cuerpo-tabla");

    pqrs.forEach(pqr => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${pqr.motivo}</td>
            <td>${pqr.descripcion}</td>
            <td>${pqr.categoria || "Sin clasificar"}</td>
            <td>${badgeEstado(pqr.estado)}</td>
            <td>${pqr.respuesta ?? "Sin respuesta"}</td>
        `;
        cuerpoTabla.appendChild(fila);
    });
}

cargarHistorial(); // se ejecuta apenas carga el script, sin esperar ningún clic

function badgeEstado(estado) {
    return `<span class="badge-estado badge-${estado}">${estado}</span>`;
}