document.getElementById("form-login").addEventListener("submit", async function (evento) {
    evento.preventDefault(); // evita que el formulario recargue la página

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const respuesta = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    if (respuesta.ok) {
        const datos = await respuesta.json();
        // Redirige según el rol
        if (datos.rol === "cliente") {
            window.location.href = "/crear-pqr";
        } else if (datos.rol === "servicio_cliente") {
            window.location.href = "/gestion-pqrs";
        } else if (datos.rol === "area_responsable") {
            window.location.href = "/responder-pqr";
        }
    } else {
        document.getElementById("mensaje-error").textContent = "Email o contraseña incorrectos";
    }
});