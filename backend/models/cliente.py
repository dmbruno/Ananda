# Modelo de Cliente
# Define la tabla y relaciones para clientes
from sqlalchemy import Column, Integer, String, Date, Boolean
from database.db import db

class Cliente(db.Model):
    __tablename__ = 'clientes'
    id = Column(Integer, primary_key=True)
    nombre = Column(String(50), nullable=False)
    apellido = Column(String(50), nullable=False)
    telefono = Column(String(20))
    fecha_nacimiento = Column(Date)
    activo = Column(Boolean, default=True)  # Borrado lógico
    # Relación con ventas
    ventas = db.relationship('Venta', back_populates='cliente')
