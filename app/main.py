from fastapi import FastAPI, Depends, HTTPException, Response, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from app.data.database import get_db, Base, engine
from app.data.models import Usuario, PQR, Area
from app.data.schemas import UsuarioCrear, UsuarioLogin, UsuarioSalida, PQRCrear, PQRSalida, PQRClasificar, PQRAsignar, PQRResponder
from app.security import hashear_password, verificar_password, crear_sesion, obtener_usuario_por_sesion

from datetime import datetime, timezone
from typing import List


app = FastAPI()
templates = Jinja2Templates(directory="app/web/templates")
app.mount("/static", StaticFiles(directory="app/web/static"), name="static")


# ---------- Dependencia para saber quién está logueado ----------
# La usan todos los endpoints protegidos: FastAPI la ejecuta antes
# de entrar al endpoint y ya llega el objeto Usuario listo para usar.
def usuario_actual(request: Request, db: Session = Depends(get_db)):
    id_sesion = request.cookies.get("id_sesion")
    if not id_sesion:
        raise HTTPException(status_code=401, detail="No has iniciado sesión")

    usuario = obtener_usuario_por_sesion(db, id_sesion)
    if not usuario:
        raise HTTPException(status_code=401, detail="Sesión inválida o expirada")

    return usuario


# ---------- Registro ----------

@app.post("/registro", response_model=UsuarioSalida)
def registrar_usuario(datos: UsuarioCrear, db: Session = Depends(get_db)):
    # No permitir dos usuarios con el mismo email
    existe = db.query(Usuario).filter(Usuario.email == datos.email).first()
    if existe:
        raise HTTPException(status_code=400, detail="Ese email ya está registrado")

    nuevo_usuario = Usuario(
        nombre=datos.nombre,
        email=datos.email,
        password_hash=hashear_password(datos.password),  # nunca se guarda la contraseña en texto plano
        rol=datos.rol,
    )
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    return nuevo_usuario


# ---------- Login ----------

@app.post("/login")
def login(datos: UsuarioLogin, response: Response, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.email == datos.email).first()

    if not usuario or not verificar_password(datos.password, usuario.password_hash):
        raise HTTPException(status_code=401, detail="Email o contraseña incorrectos")

    # Crea la sesión en la BD y se la manda al navegador como cookie
    id_sesion = crear_sesion(db, usuario.id)
    response.set_cookie(key="id_sesion", value=id_sesion, httponly=True)

    return {"mensaje": "Login exitoso", "usuario": usuario.nombre, "rol": usuario.rol}


# ---------- Logout ----------

@app.post("/logout")
def logout(response: Response):
    response.delete_cookie("id_sesion")
    return {"mensaje": "Sesión cerrada"}


# ---------- Endpoint de prueba, para confirmar que usuario_actual funciona ----------
# (herramienta de debugging, no es parte de las HU; se puede quitar antes de entregar)

@app.get("/perfil", response_model=UsuarioSalida)
def ver_perfil(usuario: Usuario = Depends(usuario_actual)):
    return usuario


# ---------- HU1: registrar PQR ----------

@app.post("/pqrs", response_model=PQRSalida)
def crear_pqr(
    datos: PQRCrear,
    usuario: Usuario = Depends(usuario_actual),
    db: Session = Depends(get_db),
):
    # cliente_id sale de la sesión, no del body, así nadie crea PQR a nombre de otro
    nueva_pqr = PQR(
        motivo=datos.motivo,
        descripcion=datos.descripcion,
        cliente_id=usuario.id,
    )
    db.add(nueva_pqr)
    db.commit()
    db.refresh(nueva_pqr)
    return nueva_pqr


# ---------- HU2: clasificar PQR ----------

@app.patch("/pqrs/{pqr_id}/clasificar", response_model=PQRSalida)
def clasificar_pqr(
    pqr_id: int,
    datos: PQRClasificar,
    usuario: Usuario = Depends(usuario_actual),
    db: Session = Depends(get_db),
):
    if usuario.rol != "servicio_cliente":
        raise HTTPException(status_code=403, detail="Solo servicio al cliente puede clasificar una PQR")

    pqr = db.query(PQR).filter(PQR.id == pqr_id).first()
    if not pqr:
        raise HTTPException(status_code=404, detail="PQR no encontrada")

    pqr.categoria = datos.categoria
    pqr.estado = "clasificada"

    db.commit()
    db.refresh(pqr)
    return pqr


# ---------- HU3: asignar PQR a un área ----------

@app.patch("/pqrs/{pqr_id}/asignar", response_model=PQRSalida)
def asignar_pqr(
    pqr_id: int,
    datos: PQRAsignar,
    usuario: Usuario = Depends(usuario_actual),
    db: Session = Depends(get_db),
):
    if usuario.rol != "servicio_cliente":
        raise HTTPException(status_code=403, detail="Solo servicio al cliente puede asignar una PQR")

    pqr = db.query(PQR).filter(PQR.id == pqr_id).first()
    if not pqr:
        raise HTTPException(status_code=404, detail="PQR no encontrada")

    # También se valida que el área exista, porque area_id es una foreign key
    area = db.query(Area).filter(Area.id == datos.area_id).first()
    if not area:
        raise HTTPException(status_code=404, detail="Área no encontrada")

    pqr.area_id = datos.area_id
    pqr.estado = "asignada"

    db.commit()
    db.refresh(pqr)
    return pqr


# ---------- HU4: responder PQR ----------

@app.patch("/pqrs/{pqr_id}/responder", response_model=PQRSalida)
def responder_pqr(
    pqr_id: int,
    datos: PQRResponder,
    usuario: Usuario = Depends(usuario_actual),
    db: Session = Depends(get_db),
):
    if usuario.rol != "area_responsable":
        raise HTTPException(status_code=403, detail="Solo el área responsable puede responder una PQR")

    pqr = db.query(PQR).filter(PQR.id == pqr_id).first()
    if not pqr:
        raise HTTPException(status_code=404, detail="PQR no encontrada")

    pqr.respuesta = datos.respuesta
    pqr.estado = "respondida"
    pqr.fecha_respuesta = datetime.now(timezone.utc)

    db.commit()
    db.refresh(pqr)
    return pqr


# ---------- HU5: consultar historial completo del cliente ----------
# Endpoint clave del objetivo del MVP: trae todas las PQR del cliente,
# sin importar en qué "canal" se hayan simulado como creadas.

@app.get("/pqrs/historial", response_model=List[PQRSalida])
def consultar_historial(
    usuario: Usuario = Depends(usuario_actual),
    db: Session = Depends(get_db),
):
    if usuario.rol != "cliente":
        raise HTTPException(status_code=403, detail="Solo el cliente puede consultar su propio historial")

    pqrs = db.query(PQR).filter(PQR.cliente_id == usuario.id).all()
    return pqrs


@app.get("/pqrs", response_model=List[PQRSalida])
def listar_pqrs(
    usuario: Usuario = Depends(usuario_actual),
    db: Session = Depends(get_db),
):
    if usuario.rol not in ("servicio_cliente", "area_responsable"):
        raise HTTPException(status_code=403, detail="No autorizado para ver todas las PQR")

    if usuario.rol == "area_responsable":
        # Solo ve las que le fueron asignadas a alguna área (para responder)
        pqrs = db.query(PQR).filter(PQR.area_id.isnot(None)).all()
    else:
        # servicio_cliente ve todas
        pqrs = db.query(PQR).all()

    return pqrs


@app.get("/", response_class=HTMLResponse)
def pagina_login(request: Request):
    return templates.TemplateResponse(request, "login.html", {})

@app.get("/registro", response_class=HTMLResponse)
def pagina_registro(request: Request):
    return templates.TemplateResponse(request, "registro.html", {})

@app.get("/crear-pqr", response_class=HTMLResponse)
def pagina_crear_pqr(request: Request):
    return templates.TemplateResponse(request, "crear_pqr.html", {})

@app.get("/historial", response_class=HTMLResponse)
def pagina_historial(request: Request):
    return templates.TemplateResponse(request, "historial.html", {})

@app.get("/gestion-pqrs", response_class=HTMLResponse)
def pagina_gestion_pqrs(request: Request):
    return templates.TemplateResponse(request, "gestion_pqrs.html", {})

@app.get("/responder-pqr", response_class=HTMLResponse)
def pagina_responder_pqr(request: Request):
    return templates.TemplateResponse(request, "responder_pqr.html", {})