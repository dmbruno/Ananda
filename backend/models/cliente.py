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
    ultimo_saludo = Column(Date, nullable=True)  # Nueva columna para fecha del último saludo
    activo = Column(Boolean, default=True)  # Borrado lógico
    # Relación con ventas
    ventas = db.relationship('Venta', back_populates='cliente')
    
    def to_dict(self):
        """Convertir objeto Cliente a diccionario"""
        return {
            'id': self.id,
            'nombre': self.nombre,
            'apellido': self.apellido,
            'nombre_completo': f"{self.nombre} {self.apellido}",
            'telefono': self.telefono,
            'fecha_nacimiento': self.fecha_nacimiento.isoformat() if self.fecha_nacimiento else None,
            'ultimo_saludo': self.ultimo_saludo.isoformat() if self.ultimo_saludo else None,
            'activo': self.activo
        }
