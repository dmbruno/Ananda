# Rutas CRUD para Usuarios
from flask import Blueprint, request, jsonify
from models.usuario import Usuario
from database.db import db

usuarios_bp = Blueprint('usuarios', __name__, url_prefix='/api/usuarios')

# Crear usuario
@usuarios_bp.route('/', methods=['POST'])
def crear_usuario():
    data = request.get_json()
    if not data.get('nombre') or not data.get('apellido') or not data.get('email'):
        return jsonify({'error': 'Faltan datos obligatorios'}), 400
    usuario = Usuario(
        nombre=data['nombre'],
        apellido=data['apellido'],
        is_admin=data.get('is_admin', False),
        email=data['email']
    )
    db.session.add(usuario)
    db.session.commit()
    return jsonify({'id': usuario.id}), 201

# Obtener todos los usuarios
@usuarios_bp.route('/', methods=['GET'])
def listar_usuarios():
    usuarios = Usuario.query.filter_by(activo=True).all()
    return jsonify([
        {'id': u.id, 'nombre': u.nombre, 'apellido': u.apellido, 'is_admin': u.is_admin, 'email': u.email}
        for u in usuarios
    ])

# Obtener usuario por id
@usuarios_bp.route('/<int:id>', methods=['GET'])
def obtener_usuario(id):
    usuario = Usuario.query.get_or_404(id)
    return jsonify({'id': usuario.id, 'nombre': usuario.nombre, 'apellido': usuario.apellido, 'is_admin': usuario.is_admin, 'email': usuario.email})

# Actualizar usuario
@usuarios_bp.route('/<int:id>', methods=['PUT'])
def actualizar_usuario(id):
    usuario = Usuario.query.get_or_404(id)
    data = request.get_json()
    usuario.nombre = data.get('nombre', usuario.nombre)
    usuario.apellido = data.get('apellido', usuario.apellido)
    usuario.is_admin = data.get('is_admin', usuario.is_admin)
    usuario.email = data.get('email', usuario.email)
    db.session.commit()
    return jsonify({'msg': 'Usuario actualizado'})

# Eliminar usuario
@usuarios_bp.route('/<int:id>', methods=['DELETE'])
def eliminar_usuario(id):
    usuario = Usuario.query.get_or_404(id)
    usuario.activo = False
    db.session.commit()
    return jsonify({'msg': 'Usuario eliminado (borrado lógico)'})
