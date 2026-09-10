let areasDisponibles = [];

async function cargarAreas() {
    const respuesta = await fetch("/areas");
    if (respuesta.ok) {
        areasDisponibles = await respuesta.json();
        const select = document.getElementById("area");
        areasDisponibles.forEach(area => {
            const opcion = document.createElement("option");
            opcion.value = area.id;
            opcion.textContent = area.nombre;
            select.appendChild(opcion);
        });
    }
}

document.getElementById("rol").addEventListener("change", function () {
    const campoArea = document.getElementById("campo-area");
    campoArea.style.display = this.value === "area_responsable" ? "block" : "none";
});

document.getElementById("form-registro").addEventListener("submit", async function (evento) {
    evento.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const rol = document.getElementById("rol").value;
    const areaId = document.getElementById("area").value;

    if (rol === "area_responsable" && !areaId) {
        document.getElementById("mensaje-error").textContent = "Selecciona un área";
        return;
    }

    const datos = { nombre, email, password, rol };
    if (rol === "area_responsable") {
        datos.area_id = parseInt(areaId);
    }

    const respuesta = await fetch("/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
    });

    const mensajeError = document.getElementById("mensaje-error");
    const mensajeExito = document.getElementById("mensaje-exito");

    if (respuesta.ok) {
        mensajeError.textContent = "";
        mensajeExito.textContent = "Registro exitoso. Redirigiendo a inicio de sesión...";
        setTimeout(() => {
            window.location.href = "/";
        }, 1500);
    } else {
        const error = await respuesta.json();
        mensajeExito.textContent = "";
        mensajeError.textContent = error.detail;
    }
});

cargarAreas();