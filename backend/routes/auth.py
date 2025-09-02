# Rutas de autenticación
from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import check_password_hash, generate_password_hash
from datetime import datetime, timedelta
import jwt
import os
from dotenv import load_dotenv
from models.usuario import Usuario
from database.db import db
from services.email_service import EmailService
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity

# Cargar variables de entorno
load_dotenv()

auth_bp = Blueprint('auth', __name__)

# Clave secreta para JWT (desde variables de entorno)
SECRET_KEY = os.getenv('SECRET_KEY', 'tu_clave_secreta_muy_segura_aqui_123456789')

def generate_tokens(user_id):
    """Generar tokens de acceso y refresh usando Flask-JWT-Extended"""
    # Token de acceso (válido por 1 hora)
    access_token = create_access_token(identity=user_id)
    
    # Token de refresh (válido por 7 días)
    refresh_token = create_refresh_token(identity=user_id)
    
    return access_token, refresh_token

@auth_bp.route('/login/', methods=['POST'])
def login():
    """Endpoint para iniciar sesión"""
    try:
        print("====== INICIO PROCESO DE LOGIN ======")
        data = request.get_json()
        
        if not data:
            print("❌ No se enviaron datos")
            return jsonify({'error': 'No se enviaron datos'}), 400
        
        email = data.get('email')
        password = data.get('password')
        
        print(f"📧 Intento de login para email: {email}")
        
        if not email or not password:
            print("❌ Faltan credenciales: email o contraseña")
            return jsonify({'error': 'Email y contraseña son requeridos'}), 400
        
        # Buscar usuario por email
        print("🔍 Buscando usuario en base de datos...")
        usuario = Usuario.query.filter_by(email=email, activo=True).first()
        
        if not usuario:
            print(f"❌ Usuario no encontrado o inactivo para email: {email}")
            return jsonify({'error': 'Credenciales inválidas'}), 401
        
        print(f"✓ Usuario encontrado: {usuario.nombre} {usuario.apellido} (ID: {usuario.id})")
        
        # Verificar contraseña
        print("🔑 Verificando contraseña...")
        if not usuario.check_password(password):
            print("❌ Contraseña incorrecta")
            return jsonify({'error': 'Credenciales inválidas'}), 401
        
        print("✓ Contraseña correcta")
        
        # Generar tokens
        print("🔐 Generando tokens JWT...")
        access_token, refresh_token = generate_tokens(usuario.id)
        
        print(f"✅ Login exitoso para usuario: {usuario.nombre} {usuario.apellido} (ID: {usuario.id})")
        print("====== FIN PROCESO DE LOGIN ======")
        
        return jsonify({
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': usuario.to_dict()
        }), 200
        
    except Exception as e:
        import traceback
        print(f"❌ ERROR en login: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        print("====== FIN PROCESO DE LOGIN (ERROR) ======")
        return jsonify({
            'error': 'Error interno del servidor', 
            'details': str(e)
        }), 500

@auth_bp.route('/refresh/', methods=['POST'])
def refresh():
    """Endpoint para refrescar el token de acceso usando Flask-JWT-Extended"""
    try:
        from flask_jwt_extended import decode_token, create_access_token
        
        data = request.get_json()
        refresh_token = data.get('refresh_token')
        
        if not refresh_token:
            return jsonify({'error': 'Token de refresh requerido'}), 400
        
        # Verificar token de refresh
        try:
            # Decodificar token con Flask-JWT-Extended
            token_data = decode_token(refresh_token)
            user_id = token_data['sub']  # Flask-JWT-Extended usa 'sub' para la identidad
            
            # Verificar que el usuario existe y está activo
            usuario = Usuario.query.filter_by(id=user_id, activo=True).first()
            if not usuario:
                return jsonify({'error': 'Usuario no encontrado'}), 401
            
            # Generar nuevo token de acceso
            access_token = create_access_token(identity=user_id)
            
            return jsonify({
                'access_token': access_token
            }), 200
            
        except Exception as e:
            return jsonify({'error': f'Token de refresh inválido: {str(e)}'}), 401
            
    except Exception as e:
        print(f"Error en refresh: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@auth_bp.route('/logout/', methods=['POST'])
def logout():
    """Endpoint para cerrar sesión (opcional, principalmente limpia del lado del cliente)"""
    return jsonify({'message': 'Sesión cerrada exitosamente'}), 200

@auth_bp.route('/me/', methods=['GET'])
@jwt_required()  # El decorador debe estar aquí, fuera de la función
def get_current_user():
    """Obtener información del usuario actual usando Flask-JWT-Extended"""
    try:
        # No necesitamos importar get_jwt_identity aquí, ya que está importado arriba
        user_id = get_jwt_identity()
        
        print(f"🔍 /api/auth/me/: Usuario autenticado con ID: {user_id}")
        
        # Buscar usuario
        usuario = Usuario.query.filter_by(id=user_id, activo=True).first()
        if not usuario:
            print(f"❌ /api/auth/me/: Usuario no encontrado con ID: {user_id}")
            return jsonify({'error': 'Usuario no encontrado'}), 401
        
        print(f"✅ /api/auth/me/: Usuario encontrado: {usuario.nombre} {usuario.apellido}")
        return jsonify({'user': usuario.to_dict()}), 200
    except Exception as e:
        print(f"🔴 Error en get_current_user: {str(e)}")
        import traceback
        print(f"🔴 Traceback: {traceback.format_exc()}")
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Endpoint para solicitar recuperación de contraseña"""
    try:
        data = request.get_json()
        email = data.get('email')
        
        if not email:
            return jsonify({'message': 'El correo electrónico es requerido'}), 400
        
        # Buscar el usuario por email
        usuario = Usuario.query.filter_by(email=email).first()
        
        if not usuario:
            return jsonify({'message': 'No existe una cuenta con ese correo electrónico'}), 404
        
        # Generar token de recuperación (válido por 1 hora)
        reset_payload = {
            'user_id': usuario.id,
            'email': usuario.email,
            'exp': datetime.utcnow() + timedelta(hours=1),
            'iat': datetime.utcnow(),
            'type': 'password_reset'
        }
        reset_token = jwt.encode(reset_payload, SECRET_KEY, algorithm='HS256')
        
        # Crear URL de reset
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
        reset_url = f"{frontend_url}/reset-password/{reset_token}"
        
        print(f"🔗 Token de recuperación para {email}: {reset_token}")
        print(f"🔗 URL de recuperación: {reset_url}")
        
        # Enviar email real usando el servicio de email
        try:
            email_service = EmailService()
            email_sent = email_service.send_password_reset_email(
                to_email=email,
                reset_url=reset_url,
                user_name=usuario.nombre if hasattr(usuario, 'nombre') else None
            )
            
            if email_sent:
                print(f"📧 Email de recuperación enviado exitosamente a: {email}")
                return jsonify({'message': 'Correo de recuperación enviado exitosamente'}), 200
            else:
                print(f"❌ Error al enviar email a: {email}")
                return jsonify({'message': 'Error al enviar el correo. Intenta nuevamente.'}), 500
                
        except Exception as email_error:
            print(f"❌ Error en servicio de email: {email_error}")
            # Fallback - mostrar en consola (desarrollo)
            print(f"📧 FALLBACK - URL de recuperación: {reset_url}")
            print("="*80)
            return jsonify({'message': 'Correo de recuperación enviado exitosamente'}), 200
        
        return jsonify({'message': 'Correo de recuperación enviado exitosamente'}), 200
        
    except Exception as e:
        print(f"Error en forgot-password: {str(e)}")
        return jsonify({'message': 'Error interno del servidor'}), 500

@auth_bp.route('/verify-reset-token', methods=['POST'])
def verify_reset_token():
    """Verificar si un token de reset es válido"""
    try:
        data = request.get_json()
        token = data.get('token')
        
        if not token:
            return jsonify({'message': 'Token requerido'}), 400
        
        try:
            # Decodificar y verificar el token
            payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            
            # Verificar que sea un token de reset
            if payload.get('type') != 'password_reset':
                return jsonify({'message': 'Tipo de token inválido'}), 400
            
            # Verificar que el usuario existe
            user_id = payload.get('user_id')
            usuario = Usuario.query.get(user_id)
            
            if not usuario:
                return jsonify({'message': 'Usuario no encontrado'}), 404
            
            return jsonify({'message': 'Token válido', 'email': usuario.email}), 200
            
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token expirado'}), 400
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token inválido'}), 400
            
    except Exception as e:
        print(f"Error en verify-reset-token: {str(e)}")
        return jsonify({'message': 'Error interno del servidor'}), 500

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Restablecer contraseña usando token"""
    try:
        data = request.get_json()
        token = data.get('token')
        new_password = data.get('password')
        
        if not token or not new_password:
            return jsonify({'message': 'Token y contraseña son requeridos'}), 400
        
        # Validar longitud de contraseña
        if len(new_password) < 6:
            return jsonify({'message': 'La contraseña debe tener al menos 6 caracteres'}), 400
        
        try:
            # Decodificar y verificar el token
            payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            
            # Verificar que sea un token de reset
            if payload.get('type') != 'password_reset':
                return jsonify({'message': 'Tipo de token inválido'}), 400
            
            # Obtener el usuario
            user_id = payload.get('user_id')
            usuario = Usuario.query.get(user_id)
            
            if not usuario:
                return jsonify({'message': 'Usuario no encontrado'}), 404
            
            # Actualizar la contraseña
            usuario.password_hash = generate_password_hash(new_password, method='pbkdf2:sha256')
            
            # Guardar cambios
            db.session.commit()
            
            # Enviar notificación de cambio de contraseña
            try:
                email_service = EmailService()
                email_service.send_password_changed_notification(
                    to_email=usuario.email,
                    user_name=usuario.nombre if hasattr(usuario, 'nombre') else None
                )
            except Exception as email_error:
                print(f"⚠️ Error al enviar notificación de cambio: {email_error}")
                # No fallar si no se puede enviar la notificación
            
            print(f"✅ Contraseña actualizada para usuario: {usuario.email}")
            
            return jsonify({'message': 'Contraseña restablecida exitosamente'}), 200
            
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token expirado. Solicita un nuevo enlace de recuperación.'}), 400
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token inválido'}), 400
            
    except Exception as e:
        print(f"Error en reset-password: {str(e)}")
        db.session.rollback()
        return jsonify({'message': 'Error interno del servidor'}), 500

@auth_bp.route('/test-email', methods=['POST'])
def test_email():
    """Endpoint para probar la configuración de email"""
    try:
        email_service = EmailService()
        success, message = email_service.test_connection()
        
        if success:
            return jsonify({
                'message': 'Configuración de email exitosa',
                'details': message,
                'status': 'success'
            }), 200
        else:
            return jsonify({
                'message': 'Error en la configuración de email',
                'details': message,
                'status': 'error'
            }), 400
            
    except Exception as e:
        return jsonify({
            'message': 'Error al probar la configuración de email',
            'details': str(e),
            'status': 'error'
        }), 500

@auth_bp.route('/ping', methods=['GET'])
def ping():
    """Endpoint para verificar que la API está en funcionamiento"""
    try:
        return jsonify({
            'status': 'success',
            'message': 'API en funcionamiento',
            'timestamp': datetime.now().isoformat()
        }), 200
    except Exception as e:
        print(f"Error en ping: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500
