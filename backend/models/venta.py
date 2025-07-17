# Modelo de Venta
# Define la tabla y relaciones para ventas
from sqlalchemy import Column, Integer, Float, DateTime, String, ForeignKey
from database.db import db

class Venta(db.Model):
    __tablename__ = 'ventas'
    id = Column(Integer, primary_key=True)
    cliente_id = Column(Integer, ForeignKey('clientes.id'), nullable=False)
    usuario_id = Column(Integer, ForeignKey('usuarios.id'), nullable=False)
    fecha_venta = Column(DateTime, nullable=False)
    total = Column(Float, nullable=False)
    metodo_pago = Column(String(30), nullable=False)
    descuento = Column(Float, default=0)  # Porcentaje de descuento
    # Relaciones
    cliente = db.relationship('Cliente', back_populates='ventas')
    usuario = db.relationship('Usuario', back_populates='ventas')
    detalles = db.relationship('DetalleVenta', back_populates='venta')
