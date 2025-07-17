# Rutas CRUD para Subcategorías
from flask import Blueprint, request, jsonify
from models.subcategoria import Subcategoria
from database.db import db

subcategorias_bp = Blueprint('subcategorias', __name__, url_prefix='/api/subcategorias')

# Crear subcategoría
@subcategorias_bp.route('/', methods=['POST'])
def crear_subcategoria():
    data = request.get_json()
    if not data.get('nombre') or not data.get('categoria_id'):
        return jsonify({'error': 'Faltan datos obligatorios'}), 400
    subcategoria = Subcategoria(
        nombre=data['nombre'],
        categoria_id=data['categoria_id']
    )
    db.session.add(subcategoria)
    db.session.commit()
    return jsonify({'id': subcategoria.id, 'nombre': subcategoria.nombre, 'categoria_id': subcategoria.categoria_id, 'activo': subcategoria.activo}), 201

# Listar subcategorías activas
@subcategorias_bp.route('/<int:categoria_id>', methods=['GET'])
def listar_subcategorias_por_categoria(categoria_id):
    subcategorias = Subcategoria.query.filter_by(categoria_id=categoria_id, activo=True).all()
    return jsonify([
        {'id': s.id, 'nombre': s.nombre, 'categoria_id': s.categoria_id, 'activo': s.activo}
        for s in subcategorias
    ])

# Obtener subcategoría por id
@subcategorias_bp.route('/<int:id>', methods=['GET'])
def obtener_subcategoria(id):
    s = Subcategoria.query.get_or_404(id)
    return jsonify({'id': s.id, 'nombre': s.nombre, 'categoria_id': s.categoria_id})

# Actualizar subcategoría
@subcategorias_bp.route('/<int:id>', methods=['PUT'])
def actualizar_subcategoria(id):
    s = Subcategoria.query.get_or_404(id)
    data = request.get_json()
    s.nombre = data.get('nombre', s.nombre)
    s.categoria_id = data.get('categoria_id', s.categoria_id)
    db.session.commit()
    db.session.refresh(s)
    return jsonify({'id': s.id, 'nombre': s.nombre, 'categoria_id': s.categoria_id, 'activo': s.activo})

# Borrado lógico de subcategoría
@subcategorias_bp.route('/<int:id>', methods=['DELETE'])
def eliminar_subcategoria(id):
    s = Subcategoria.query.get_or_404(id)
    s.activo = False
    try:
        db.session.commit()
        db.session.refresh(s)
        print(f"Estado después de commit: ID={id}, Activo={s.activo}")
    except Exception as e:
        db.session.rollback()
        print(f"Error al realizar el borrado lógico: {e}")
        return jsonify({'error': 'No se pudo eliminar la subcategoría'}), 500

    return jsonify({'id': s.id, 'activo': s.activo})
