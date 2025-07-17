# Modelo de Subcategoria
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from database.db import db

class Subcategoria(db.Model):
    __tablename__ = 'subcategorias'
    id = Column(Integer, primary_key=True)
    nombre = Column(String(50), nullable=False)
    categoria_id = Column(Integer, ForeignKey('categorias.id'), nullable=False)
    activo = Column(Boolean, default=True)  # Borrado lógico
    # Relación con productos
    productos = db.relationship('Producto', back_populates='subcategoria')
    # Relación con categoría
    categoria = db.relationship('Categoria', back_populates='subcategorias')
