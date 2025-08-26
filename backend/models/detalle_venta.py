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
    
    def to_dict(self):
        """Convertir objeto DetalleVenta a diccionario"""
        producto_data = None
        if self.producto:
            if hasattr(self.producto, 'to_dict'):
                producto_data = self.producto.to_dict()
            else:
                producto_data = {
                    'id': self.producto.id,
                    'nombre': getattr(self.producto, 'nombre', 'Producto'),
                    'codigo': getattr(self.producto, 'codigo', None),
                    'talle': getattr(self.producto, 'talle', None),
                    'color': getattr(self.producto, 'color', None)
                }
        
        return {
            'id': self.id,
            'venta_id': self.venta_id,
            'producto_id': self.producto_id,
            'cantidad': self.cantidad,
            'precio_unitario': self.precio_unitario,
            'subtotal': self.subtotal,
            'producto': producto_data
        }
