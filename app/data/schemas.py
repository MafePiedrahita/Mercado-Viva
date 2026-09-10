from pydantic import BaseModel, EmailStr
from datetime import datetime

class UsuarioCrear(BaseModel):
    """Datos que llegan al REGISTRAR un nuevo usuario (cliente, servicio_cliente o area_responsable)."""
    nombre: str
    email: EmailStr  # EmailStr valida automáticamente que tenga formato de correo válido (ej. algo@dominio.com)
    password: str    # contraseña en texto plano SOLO en este punto de entrada; se hashea antes de guardar
    rol: str


class UsuarioLogin(BaseModel):
    """Datos que llegan al hacer LOGIN. Solo necesita email y password para verificar."""
    email: EmailStr
    password: str


class UsuarioSalida(BaseModel):
    """Lo que la API devuelve sobre un usuario. Nunca incluye password ni password_hash."""
    id: int
    nombre: str
    email: EmailStr
    rol: str

    class Config:
        from_attributes = True  # permite leer estos campos directo desde un objeto SQLAlchemy



class PQRCrear(BaseModel):
    """HU1: el cliente registra una PQR. No incluye cliente_id (se toma de la sesión, no del body)."""
    motivo: str
    descripcion: str


class PQRClasificar(BaseModel):
    """HU2: servicio al cliente clasifica la PQR ya registrada."""
    categoria: str


class PQRAsignar(BaseModel):
    """HU3: servicio al cliente asigna la PQR clasificada a un área responsable."""
    area_id: int


class PQRResponder(BaseModel):
    """HU4: el área responsable registra la respuesta/solución de una PQR asignada."""
    respuesta: str


class PQRSalida(BaseModel):
    """
    HU5 y en general cualquier respuesta de la API sobre una PQR.
    No incluye cliente_id: cuando el cliente consulta SU PROPIO historial,
    ya sabe quién es él mismo, así que ese dato sería redundante.
    """
    id: int
    motivo: str
    descripcion: str
    categoria: str | None
    estado: str
    respuesta: str | None
    area_id: int | None
    fecha_creacion: datetime
    fecha_respuesta: datetime | None

    class Config:
        from_attributes = True