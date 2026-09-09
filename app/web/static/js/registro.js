document.getElementById("form-registro").addEventListener("submit", async function (evento) {
    evento.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const rol = document.getElementById("rol").value;

    const respuesta = await fetch("/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, password, rol }),
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