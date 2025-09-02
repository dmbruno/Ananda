# Modelo de Usuario
# Define la tabla y relaciones para usuarios del sistema
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from werkzeug.security import generate_password_hash, check_password_hash
from database.db import db

class Usuario(db.Model):
    __tablename__ = 'usuarios'
    id = Column(Integer, primary_key=True)
    nombre = Column(String(50), nullable=False)
    apellido = Column(String(50), nullable=False)
    is_admin = Column(Boolean, default=False)
    email = Column(String(120), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)  # Campo para contraseña hasheada
    activo = Column(Boolean, default=True)  # Borrado lógico
    fecha_eliminacion = Column(DateTime, nullable=True)  # Fecha de eliminación lógica
    # Relación con ventas
    ventas = db.relationship('Venta', back_populates='usuario')
    
    def set_password(self, password):
        """Hashear y guardar la contraseña"""
        self.password_hash = generate_password_hash(password, method='pbkdf2:sha256')
    
    def check_password(self, password):
        """Verificar si la contraseña es correcta"""
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        """Convertir objeto Usuario a diccionario (sin incluir datos sensibles)"""
        return {
            'id': self.id,
            'nombre': self.nombre,
            'apellido': self.apellido,
            'nombre_completo': f"{self.nombre} {self.apellido}",
            'is_admin': self.is_admin,
            'email': self.email,
            'activo': self.activo,
            'fecha_eliminacion': self.fecha_eliminacion.isoformat() if self.fecha_eliminacion else None
        }
