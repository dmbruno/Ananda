# Rutas CRUD para Categorías
from flask import Blueprint, request, jsonify
from models.categoria import Categoria
from database.db import db

categorias_bp = Blueprint('categorias', __name__, url_prefix='/api/categorias')

# Crear categoría
@categorias_bp.route('/', methods=['POST'])
def crear_categoria():
    data = request.get_json()
    if not data.get('nombre'):
        return jsonify({'error': 'El nombre es obligatorio'}), 400
    categoria = Categoria(
        nombre=data['nombre']
    )
    db.session.add(categoria)
    db.session.commit()
    return jsonify({'id': categoria.id}), 201

# Obtener todas las categorías
@categorias_bp.route('/', methods=['GET'])
def listar_categorias():
    categorias = Categoria.query.filter_by(activo=True).all()
    return jsonify([
        {'id': c.id, 'nombre': c.nombre}
        for c in categorias
    ])

# Obtener categoría por id
@categorias_bp.route('/<int:id>', methods=['GET'])
def obtener_categoria(id):
    categoria = Categoria.query.filter_by(id=id, activo=True).first()
    if not categoria:
        return jsonify({'error': 'Categoría no encontrada o inactiva'}), 404
    return jsonify({'id': categoria.id, 'nombre': categoria.nombre})

# Actualizar categoría
@categorias_bp.route('/<int:id>', methods=['PUT'])
def actualizar_categoria(id):
    categoria = Categoria.query.get_or_404(id)
    data = request.get_json()
    categoria.nombre = data.get('nombre', categoria.nombre)
    db.session.commit()
    return jsonify({'msg': 'Categoría actualizada'})

# Eliminar categoría
@categorias_bp.route('/<int:id>', methods=['DELETE'])
def eliminar_categoria(id):
    categoria = Categoria.query.get_or_404(id)
    categoria.activo = False
    db.session.commit()
    return jsonify({'msg': 'Categoría eliminada (borrado lógico)'})
