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
    stock_minimo = Column(Integer, default=0)
    costo = Column(Float, nullable=False)
    precio_venta = Column(Float, nullable=False)  # Nuevo campo para el precio de venta
    imagen_url = Column(String(255))  # Nuevo campo para la URL de la imagen
    stock_actual = Column(Integer, default=0)
    categoria_id = Column(Integer, ForeignKey('categorias.id'), nullable=False)
    subcategoria_id = Column(Integer, ForeignKey('subcategorias.id'), nullable=True)
    activo = Column(Boolean, default=True)  # Borrado lógico
    temporada = Column(String(50))  # Temporada del producto
    fecha_ingreso = Column(String(50))  # Fecha de ingreso del producto
    # Relación con categoría
    categoria = db.relationship('Categoria', back_populates='productos')
    # Relación con subcategoría
    subcategoria = db.relationship('Subcategoria', back_populates='productos')
    # Relación con detalle de ventas
    detalles_venta = db.relationship('DetalleVenta', back_populates='producto')
    
    def to_dict(self):
        """Convertir objeto Producto a diccionario"""
        return {
            'id': self.id,
            'nombre': self.nombre,
            'talle': self.talle,
            'codigo': self.codigo,
            'color': self.color,
            'marca': self.marca,
            'stock_minimo': self.stock_minimo,
            'costo': self.costo,
            'precio_venta': self.precio_venta,
            'imagen_url': self.imagen_url,
            'stock_actual': self.stock_actual,
            'categoria_id': self.categoria_id,
            'subcategoria_id': self.subcategoria_id,
            'activo': self.activo,
            'temporada': self.temporada,
            'fecha_ingreso': self.fecha_ingreso
        }
