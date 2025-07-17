# Modelo de DetalleVenta
# Define la tabla y relaciones para los detalles de cada venta
from sqlalchemy import Column, Integer, Float, ForeignKey
from database.db import db

class DetalleVenta(db.Model):
    __tablename__ = 'detalle_ventas'
    id = Column(Integer, primary_key=True)
    venta_id = Column(Integer, ForeignKey('ventas.id'), nullable=False)
    producto_id = Column(Integer, ForeignKey('productos.id'), nullable=False)
    cantidad = Column(Integer, nullable=False)
    precio_unitario = Column(Float, nullable=False)
    subtotal = Column(Float, nullable=False)
    # Relaciones
    venta = db.relationship('Venta', back_populates='detalles')
    producto = db.relationship('Producto', back_populates='detalles_venta')
