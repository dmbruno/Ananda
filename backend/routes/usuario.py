# Rutas CRUD para Usuarios
from flask import Blueprint, request, jsonify
from models.usuario import Usuario
from database.db import db
from datetime import datetime

usuarios_bp = Blueprint('usuarios', __name__, url_prefix='/api/usuarios')

# Crear usuario
@usuarios_bp.route('/', methods=['POST'])
def crear_usuario():
    data = request.get_json()
    if not data.get('nombre') or not data.get('apellido') or not data.get('email'):
        return jsonify({'error': 'Faltan datos obligatorios'}), 400
    
    if not data.get('password'):
        return jsonify({'error': 'La contraseña es obligatoria'}), 400
    
    # Verificar si el email ya existe
    usuario_existente = Usuario.query.filter_by(email=data['email']).first()
    if usuario_existente:
        return jsonify({'error': 'Ya existe un usuario con este correo electrónico'}), 400
    
    usuario = Usuario(
        nombre=data['nombre'],
        apellido=data['apellido'],
        is_admin=data.get('is_admin', False),
        email=data['email']
    )
    # Establecer la contraseña hasheada
    usuario.set_password(data['password'])
    
    db.session.add(usuario)
    db.session.commit()
    return jsonify({'id': usuario.id, 'message': 'Usuario creado exitosamente'}), 201

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
    
    # Verificar si el email ya existe (si se está cambiando)
    if data.get('email') and data['email'] != usuario.email:
        usuario_existente = Usuario.query.filter_by(email=data['email']).first()
        if usuario_existente:
            return jsonify({'error': 'Ya existe un usuario con este correo electrónico'}), 400
    
    usuario.nombre = data.get('nombre', usuario.nombre)
    usuario.apellido = data.get('apellido', usuario.apellido)
    usuario.is_admin = data.get('is_admin', usuario.is_admin)
    usuario.email = data.get('email', usuario.email)
    
    # Solo actualizar contraseña si se proporciona una nueva
    if data.get('password') and data['password'].strip():
        usuario.set_password(data['password'])
    
    db.session.commit()
    return jsonify({'msg': 'Usuario actualizado exitosamente'})

# Eliminar usuario (Soft Delete)
@usuarios_bp.route('/<int:id>', methods=['DELETE'])
def eliminar_usuario(id):
    try:
        usuario = Usuario.query.get_or_404(id)
        
        # Verificar si el usuario ya está eliminado
        if not usuario.activo:
            return jsonify({'error': 'El usuario ya está eliminado'}), 400
        
        # Soft delete: marcar como inactivo y establecer fecha de eliminación
        usuario.activo = False
        usuario.fecha_eliminacion = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Usuario eliminado exitosamente (borrado lógico)',
            'usuario_id': id,
            'fecha_eliminacion': usuario.fecha_eliminacion.isoformat()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error al eliminar usuario: {str(e)}'}), 500

# Reactivar usuario (opcional - para deshacer el soft delete)
@usuarios_bp.route('/<int:id>/reactivar', methods=['PUT'])
def reactivar_usuario(id):
    try:
        usuario = Usuario.query.get_or_404(id)
        
        # Verificar si el usuario está eliminado
        if usuario.activo:
            return jsonify({'error': 'El usuario ya está activo'}), 400
        
        # Reactivar usuario
        usuario.activo = True
        usuario.fecha_eliminacion = None
        
        db.session.commit()
        
        return jsonify({
            'message': 'Usuario reactivado exitosamente',
            'usuario_id': id
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error al reactivar usuario: {str(e)}'}), 500

# Obtener usuarios eliminados (para auditoría)
@usuarios_bp.route('/eliminados', methods=['GET'])
def listar_usuarios_eliminados():
    try:
        usuarios_eliminados = Usuario.query.filter_by(activo=False).all()
        return jsonify([usuario.to_dict() for usuario in usuarios_eliminados]), 200
    except Exception as e:
        return jsonify({'error': f'Error al obtener usuarios eliminados: {str(e)}'}), 500
