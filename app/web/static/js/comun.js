async function cerrarSesion() {
    await fetch("/logout", { method: "POST" });
    window.location.href = "/";
}