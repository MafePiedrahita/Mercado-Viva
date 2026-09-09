from passlib.context import CryptContext
import secrets
from sqlalchemy.orm import Session
from app.data.models import Sesion

# CryptContext es el "administrador" de passlib: le decimos qué algoritmo(s) usar.
# schemes=["bcrypt"] → usamos bcrypt como algoritmo de hasheo.
# deprecated="auto" → si en el futuro cambias de algoritmo, passlib maneja la transición sola.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hashear_password(password: str) -> str:
    """Convierte una contraseña en texto plano a su hash, para guardar en la BD."""
    return pwd_context.hash(password)


def verificar_password(password_plano: str, password_hash: str) -> bool:
    """
    Compara una contraseña escrita (ej. en login) contra el hash guardado.
    Devuelve True si coinciden, False si no.
    """
    return pwd_context.verify(password_plano, password_hash)


def crear_sesion(db: Session, usuario_id: int) -> str:
    """Genera un id de sesión aleatorio, lo guarda en la BD, y lo devuelve."""
    id_sesion = secrets.token_hex(32)  # genera un string aleatorio de 64 caracteres, imposible de adivinar
    nueva_sesion = Sesion(id=id_sesion, usuario_id=usuario_id)
    db.add(nueva_sesion)
    db.commit()
    return id_sesion


def obtener_usuario_por_sesion(db: Session, id_sesion: str):
    """Busca la sesión en la BD y devuelve el usuario_id asociado, o None si no existe."""
    sesion = db.query(Sesion).filter(Sesion.id == id_sesion).first()
    if sesion:
        return sesion.usuario
    return None