# Utilidades para autenticación
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.usuario import Usuario
from functools import wraps

def get_current_user_from_token():
    """
    Obtener el usuario actual desde el token JWT utilizando Flask-JWT-Extended
    Returns: Usuario object o None si no se puede obtener
    """
    try:
        # Obtener ID del usuario desde el token (usando Flask-JWT-Extended)
        user_id = get_jwt_identity()
        if not user_id:
            print("❌ No se pudo obtener el ID del usuario del token JWT")
            return None
            
        # Buscar usuario
        usuario = Usuario.query.filter_by(id=user_id, activo=True).first()
        if not usuario:
            print(f"❌ Usuario con ID {user_id} no encontrado o inactivo")
        return usuario
        
    except Exception as e:
        print(f"❌ Error al obtener usuario desde token: {str(e)}")
        return None

def require_auth(f):
    """
    Decorador para rutas que requieren autenticación compatible con Flask-JWT-Extended
    """
    @jwt_required()  # Primero verifica el JWT
    @wraps(f)  # Preserva información de la función
    def decorated_function(*args, **kwargs):
        # Obtener usuario actual
        usuario = get_current_user_from_token()
        if not usuario:
            return jsonify({'error': 'Usuario no encontrado o inactivo'}), 401
        
        # Pasar el usuario como primer argumento a la función
        return f(usuario, *args, **kwargs)
    
    return decorated_function

def admin_required(f):
    """
    Decorador para rutas que requieren autenticación de administrador
    """
    @jwt_required()  # Primero verifica el JWT
    @wraps(f)  # Preserva información de la función
    def decorated_function(*args, **kwargs):
        # Obtener usuario actual
        usuario = get_current_user_from_token()
        if not usuario:
            return jsonify({'error': 'Usuario no encontrado o inactivo'}), 401
        
        # Verificar si el usuario es administrador
        if not usuario.is_admin:
            return jsonify({'error': 'Se requieren permisos de administrador para esta acción'}), 403
        
        # Pasar el usuario como primer argumento a la función
        return f(usuario, *args, **kwargs)
    
    return decorated_function
