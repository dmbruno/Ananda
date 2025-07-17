# Modelo de Categoría
# Define la tabla y relaciones para categorías de productos
from sqlalchemy import Column, Integer, String, Boolean
from database.db import db
from models.subcategoria import Subcategoria

class Categoria(db.Model):
    __tablename__ = 'categorias'
    id = Column(Integer, primary_key=True)
    nombre = Column(String(50), nullable=False)
    activo = Column(Boolean, default=True)  # Borrado lógico
    # Relación con productos
    productos = db.relationship('Producto', back_populates='categoria')
    # Relación con subcategorías
    subcategorias = db.relationship('Subcategoria', back_populates='categoria')
