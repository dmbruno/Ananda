from database.db import db
from sqlalchemy import Column, Integer, Float, String, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime

class Caja(db.Model):
    __tablename__ = 'cajas'
    
    id = Column(Integer, primary_key=True)
    fecha_apertura = Column(DateTime, nullable=False, default=datetime.utcnow)
    fecha_cierre = Column(DateTime, nullable=True)
    monto_inicial = Column(Float, nullable=False, default=0.0)
    monto_final = Column(Float, nullable=True)
    monto_sistema = Column(Float, nullable=True)  # Monto calculado según ventas
    diferencia = Column(Float, nullable=True)     # Diferencia entre final y sistema
    usuario_apertura_id = Column(Integer, ForeignKey('usuarios.id'), nullable=False)
    usuario_cierre_id = Column(Integer, ForeignKey('usuarios.id'), nullable=True)
    # 'abierta', 'cerrada', 'controlada'
    estado = Column(String(20), nullable=False, default='abierta')  
    notas_apertura = Column(Text, nullable=True)
    notas_cierre = Column(Text, nullable=True)
    
    # Campos para control por el dueño
    fecha_control = Column(DateTime, nullable=True)
    usuario_control_id = Column(Integer, ForeignKey('usuarios.id'), nullable=True)
    
    # Relaciones (usando strings para evitar importaciones circulares)
    usuario_apertura = relationship("Usuario", foreign_keys=[usuario_apertura_id])
    usuario_cierre = relationship("Usuario", foreign_keys=[usuario_cierre_id])
    usuario_control = relationship("Usuario", foreign_keys=[usuario_control_id])
    ventas = relationship("Venta", back_populates="caja")
    
    def to_dict(self):
        return {
            'id': self.id,
            'fecha_apertura': self.fecha_apertura.isoformat() if self.fecha_apertura else None,
            'fecha_cierre': self.fecha_cierre.isoformat() if self.fecha_cierre else None,
            'monto_inicial': self.monto_inicial,
            'monto_final': self.monto_final,
            'monto_sistema': self.monto_sistema,
            'diferencia': self.diferencia,

        # IDs (por compatibilidad con el frontend actual)
            'usuario_apertura_id': self.usuario_apertura_id,
            'usuario_cierre_id': self.usuario_cierre_id,
            'usuario_control_id': self.usuario_control_id if hasattr(self, 'usuario_control_id') else None,

        # Objetos usuario (para mostrar nombres y apellidos)
            'usuario_apertura': self.usuario_apertura.to_dict() if self.usuario_apertura else None,
            'usuario_cierre': self.usuario_cierre.to_dict() if self.usuario_cierre else None,
            'usuario_control': self.usuario_control.to_dict() if self.usuario_control else None,

            'fecha_control': self.fecha_control.isoformat() if self.fecha_control else None,
            'estado': self.estado,
            'notas_apertura': self.notas_apertura,
            'notas_cierre': self.notas_cierre
    }

    
    def __repr__(self):
        return f'<Caja {self.id} - {self.estado}>'
