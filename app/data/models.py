from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.data.database import Base


class Usuario(Base):
    __tablename__ = "usuario"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    rol = Column(String(20), nullable=False)
    area_id = Column(Integer, ForeignKey("area.id"), nullable=True)  # NUEVO
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        CheckConstraint("rol IN ('cliente', 'servicio_cliente', 'area_responsable')", name="check_rol"),
    )

    pqrs = relationship("PQR", back_populates="cliente")
    area = relationship("Area")  # NUEVO


class Area(Base):
    __tablename__ = "area"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), unique=True, nullable=False)

    pqrs = relationship("PQR", back_populates="area")


class PQR(Base):
    __tablename__ = "pqr"

    id = Column(Integer, primary_key=True, index=True)
    motivo = Column(String(150), nullable=False)
    descripcion = Column(Text, nullable=False)
    categoria = Column(String(100), nullable=True)
    estado = Column(String(20), nullable=False, default="registrada")
    respuesta = Column(Text, nullable=True)

    cliente_id = Column(Integer, ForeignKey("usuario.id"), nullable=False)
    area_id = Column(Integer, ForeignKey("area.id"), nullable=True)

    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())
    fecha_respuesta = Column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        CheckConstraint(
            "estado IN ('registrada', 'clasificada', 'asignada', 'respondida', 'cerrada')",
            name="check_estado"
        ),
    )

    cliente = relationship("Usuario", back_populates="pqrs")
    area = relationship("Area", back_populates="pqrs")


class Sesion(Base):
    __tablename__ = "sesion"

    id = Column(String(64), primary_key=True)
    usuario_id = Column(Integer, ForeignKey("usuario.id"), nullable=False)
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())

    usuario = relationship("Usuario")