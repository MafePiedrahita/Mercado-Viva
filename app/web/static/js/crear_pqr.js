document.getElementById("form-pqr").addEventListener("submit", async function (evento) {
    evento.preventDefault();

    const motivo = document.getElementById("motivo").value;
    const descripcion = document.getElementById("descripcion").value;

    const respuesta = await fetch("/pqrs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motivo, descripcion }),
    });

    const mensaje = document.getElementById("mensaje");

    if (respuesta.ok) {
        mensaje.textContent = "PQR registrada correctamente.";
        document.getElementById("form-pqr").reset();
    } else {
        mensaje.textContent = "Error al registrar la PQR. ¿Iniciaste sesión?";
    }
});