# Modelo de Producto
# Define la tabla y relaciones para productos
from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean
from database.db import db

class Producto(db.Model):
    __tablename__ = 'productos'
    id = Column(Integer, primary_key=True)
    nombre = Column(String(50), nullable=False)
    talle = Column(String(10))
    codigo = Column(String(30), unique=True)
    color = Column(String(30))
    marca = Column(String(30))
    costo = Column(Float, nullable=False)
    precio_venta = Column(Float, nullable=False)  # Nuevo campo para el precio de venta
    imagen_url = Column(String(255))  # Nuevo campo para la URL de la imagen
    stock_actual = Column(Integer, default=0)
    categoria_id = Column(Integer, ForeignKey('categorias.id'), nullable=False)
    subcategoria_id = Column(Integer, ForeignKey('subcategorias.id'), nullable=True)
    activo = Column(Boolean, default=True)  # Borrado lógico
    # Relación con categoría
    categoria = db.relationship('Categoria', back_populates='productos')
    # Relación con subcategoría
    subcategoria = db.relationship('Subcategoria', back_populates='productos')
    # Relación con detalle de ventas
    detalles_venta = db.relationship('DetalleVenta', back_populates='producto')
