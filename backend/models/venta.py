# Modelo de Venta
# Define la tabla y relaciones para ventas
from sqlalchemy import Column, Integer, Float, DateTime, String, ForeignKey
from database.db import db

class Venta(db.Model):
    __tablename__ = 'ventas'
    id = Column(Integer, primary_key=True)
    cliente_id = Column(Integer, ForeignKey('clientes.id'), nullable=False)
    usuario_id = Column(Integer, ForeignKey('usuarios.id'), nullable=False)
    caja_id = Column(Integer, ForeignKey('cajas.id'), nullable=True)
    fecha_venta = Column(DateTime, nullable=False)
    total = Column(Float, nullable=False)
    metodo_pago = Column(String(30), nullable=False)
    descuento = Column(Float, default=0)  # Porcentaje de descuento
    
    # Relaciones
    cliente = db.relationship('Cliente', back_populates='ventas')
    usuario = db.relationship('Usuario', back_populates='ventas')
    caja = db.relationship('Caja', back_populates='ventas')
    detalles = db.relationship('DetalleVenta', back_populates='venta')
    
    def to_dict_simple(self):
        """Versión simplificada para incluir en ventas"""
        return {
            'id': self.id,
            'cliente_id': self.cliente_id,
            'cliente_nombre': f"{self.cliente.nombre} {self.cliente.apellido}" if self.cliente else f"Cliente #{self.cliente_id}",
            'usuario_id': self.usuario_id,
            'caja_id': self.caja_id,
            'fecha': self.fecha_venta.isoformat() if self.fecha_venta else None,
            'fecha_venta': self.fecha_venta.isoformat() if self.fecha_venta else None,
            'total': self.total,
            'metodo_pago': self.metodo_pago,
            'descuento': self.descuento
        }
    
    def to_dict(self):
        """Versión completa con detalles de la venta"""
        venta_dict = self.to_dict_simple()
        # Agregamos información adicional que pueda ser necesaria
        venta_dict['detalles'] = [detalle.to_dict() for detalle in self.detalles] if hasattr(self, 'detalles') else []
        venta_dict['usuario_nombre'] = f"{self.usuario.nombre} {self.usuario.apellido}" if self.usuario else f"Usuario #{self.usuario_id}"
        return venta_dict
    
    def __repr__(self):
        return f'<Venta {self.id} - Cliente: {self.cliente_id}>'
