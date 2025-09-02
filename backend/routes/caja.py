from flask import Blueprint, request, jsonify
from database.db import db
from models.caja import Caja
from models.venta import Venta
from models.usuario import Usuario
from sqlalchemy import func, and_, extract
from datetime import datetime, date, timedelta
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from utils.auth_utils import require_auth, get_current_user_from_token

caja_bp = Blueprint('caja', __name__)

@caja_bp.route('/api/caja/listar', methods=['GET', 'OPTIONS'])
def listar_cajas():
    """Lista cajas con filtros opcionales: fecha_inicio (YYYY-MM-DD), fecha_fin (YYYY-MM-DD), usuario_id, estado"""
    try:
        # Obtener query params
        fecha_inicio = request.args.get('fecha_inicio')
        fecha_fin = request.args.get('fecha_fin')
        usuario_id = request.args.get('usuario_id')
        estado = request.args.get('estado')

        query = Caja.query

        # Filtrar por rango de fechas sobre fecha_apertura
        if fecha_inicio:
            try:
                start_dt = datetime.fromisoformat(fecha_inicio)
            except Exception:
                # Intentar parsear solo fecha si viene en formato YYYY-MM-DD
                start_dt = datetime.fromisoformat(fecha_inicio + 'T00:00:00')
            query = query.filter(Caja.fecha_apertura >= start_dt)

        if fecha_fin:
            try:
                end_dt = datetime.fromisoformat(fecha_fin)
            except Exception:
                end_dt = datetime.fromisoformat(fecha_fin + 'T00:00:00')
            # Incluir todo el día final
            end_dt = end_dt + timedelta(days=1)
            query = query.filter(Caja.fecha_apertura < end_dt)

        # Filtrar por usuario si se provee
        if usuario_id:
            try:
                uid = int(usuario_id)
                query = query.filter((Caja.usuario_apertura_id == uid) | (Caja.usuario_cierre_id == uid) | (Caja.usuario_control_id == uid))
            except ValueError:
                pass

        # Filtrar por estado simplificado
        if estado:
            if estado == 'abiertas' or estado == 'abierta':
                query = query.filter(Caja.estado == 'abierta')
            elif estado == 'cerradas' or estado == 'cerrada':
                query = query.filter(Caja.estado == 'cerrada')
            elif estado == 'controladas' or estado == 'controlada':
                query = query.filter(Caja.fecha_control != None)

        cajas = query.order_by(Caja.fecha_apertura.desc()).all()
        resultado = [c.to_dict() for c in cajas]
        return jsonify(resultado), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@caja_bp.route('/api/caja/actual', methods=['GET'])
@jwt_required()  # Proteger con JWT
def obtener_caja_actual():
    """Obtiene la caja actualmente abierta"""
    try:
        print("====== INICIO OBTENER CAJA ACTUAL ======")
        current_user_id = get_jwt_identity()
        print(f"Usuario autenticado ID: {current_user_id}")
        
        if not current_user_id:
            print("❌ Usuario no autenticado en obtener_caja_actual")
            return jsonify({
                'caja': None,
                'estado': 'cerrada',
                'error': 'Usuario no autenticado'
            }), 401
            
        caja_abierta = Caja.query.filter_by(estado='abierta').first()
        
        if caja_abierta:
            print(f"Caja abierta encontrada ID: {caja_abierta.id}")
            # Obtener ventas para esta caja
            ventas = Venta.query.filter_by(caja_id=caja_abierta.id).all()
            
            # Calcular totales de ventas
            total_ventas = sum(venta.total for venta in ventas)
            print(f"Total ventas: {total_ventas}, Cantidad: {len(ventas)}")
            
            caja_dict = caja_abierta.to_dict()
            caja_dict['ventas_total'] = total_ventas
            caja_dict['ventas_cantidad'] = len(ventas)
            
            # Usamos to_dict_simple() para cada venta en la lista de ventas
            try:
                caja_dict['ventas'] = [venta.to_dict_simple() for venta in ventas]
                print("✅ Ventas serializadas correctamente con to_dict_simple()")
            except Exception as e:
                print(f"❌ Error al serializar ventas: {str(e)}")
                # Fallback con información básica si hay error
                caja_dict['ventas'] = [{'id': venta.id, 'total': venta.total} for venta in ventas]
            
            resultado = {
                'caja': caja_dict,
                'estado': 'abierta'
            }
            print(f"Enviando respuesta: {resultado}")
            print("====== FIN OBTENER CAJA ACTUAL ======")
            return jsonify(resultado), 200
        else:
            print("No hay caja abierta")
            print("====== FIN OBTENER CAJA ACTUAL ======")
            return jsonify({
                'caja': None,
                'estado': 'cerrada'
            }), 200
            
    except Exception as e:
        import traceback
        error_traceback = traceback.format_exc()
        print(f"ERROR al obtener caja actual: {str(e)}")
        print(f"Traceback: {error_traceback}")
        print("====== FIN OBTENER CAJA ACTUAL (ERROR) ======")
        
        # Devolver error real con código 500
        return jsonify({
            'caja': None,
            'estado': 'error',
            'error': f"Error al verificar caja: {str(e)}"
        }), 500  # Usar 500 para errores reales

@caja_bp.route('/api/caja/abrir', methods=['POST'])
@jwt_required()  # Usar jwt_required en lugar de require_auth para consistencia
def abrir_caja():
    """Abre una nueva caja del día"""
    try:
        print("====== INICIO APERTURA CAJA ======")
        current_user_id = get_jwt_identity()
        
        if not current_user_id:
            print("❌ Usuario no autenticado en abrir_caja")
            return jsonify({
                'error': 'Usuario no autenticado'
            }), 401
            
        # Obtener el usuario completo
        current_user = Usuario.query.filter_by(id=current_user_id, activo=True).first()
        if not current_user:
            print(f"❌ Usuario no encontrado o inactivo con ID: {current_user_id}")
            return jsonify({
                'error': 'Usuario no encontrado o inactivo'
            }), 401
            
        print(f"Usuario autenticado: {current_user.nombre} {current_user.apellido} (ID: {current_user.id})")
        
        # Obtener datos del request
        data = request.get_json()
        print(f"Datos recibidos: {data}")
        
        monto_inicial = data.get('monto_inicial', 0.0)
        notas = data.get('notas', '')
        
        print(f"Monto inicial: {monto_inicial}, Usuario ID: {current_user.id}, Notas: {notas}")
        
        # Verificar que no haya una caja abierta
        caja_abierta = Caja.query.filter_by(estado='abierta').first()
        if caja_abierta:
            print(f"Error: Ya existe una caja abierta con ID {caja_abierta.id}")
            return jsonify({
                'error': 'Ya hay una caja abierta',
                'caja': caja_abierta.to_dict()
            }), 400
        
        print("Creando nueva caja...")
        # Crear nueva caja
        nueva_caja = Caja(
            monto_inicial=float(monto_inicial),
            usuario_apertura_id=current_user.id,  # Usar el usuario autenticado
            estado='abierta',
            notas_apertura=notas,
            fecha_apertura=datetime.utcnow()
        )
        
        print("Agregando a la base de datos...")
        db.session.add(nueva_caja)
        db.session.commit()
        
        print(f"Caja creada con éxito. ID: {nueva_caja.id}")
        
        resultado = {
            'success': True,
            'message': 'Caja abierta exitosamente',
            'caja': nueva_caja.to_dict()
        }
        print(f"Enviando respuesta: {resultado}")
        print("====== FIN APERTURA CAJA ======")
        
        return jsonify(resultado), 201
        
    except Exception as e:
        db.session.rollback()
        import traceback
        error_traceback = traceback.format_exc()
        print(f"ERROR al abrir caja: {str(e)}")
        print(f"Traceback: {error_traceback}")
        print("====== FIN APERTURA CAJA (ERROR) ======")
        return jsonify({
            'error': str(e),
            'traceback': error_traceback
        }), 500

@caja_bp.route('/api/caja/cerrar', methods=['POST'])
@jwt_required()  # Usar jwt_required en lugar de require_auth para consistencia
def cerrar_caja():
    """Cierra la caja actual"""
    try:
        current_user_id = get_jwt_identity()
        
        if not current_user_id:
            return jsonify({
                'error': 'Usuario no autenticado'
            }), 401
            
        # Obtener el usuario completo
        current_user = Usuario.query.filter_by(id=current_user_id, activo=True).first()
        if not current_user:
            return jsonify({
                'error': 'Usuario no encontrado o inactivo'
            }), 401
            
        data = request.get_json()
        notas = data.get('notas', '')
        monto_declarado = data.get('monto_declarado')  # Monto declarado por el usuario
        
        print(f"Usuario cerrando caja: {current_user.nombre} {current_user.apellido} (ID: {current_user.id})")
        
        # Buscar caja abierta
        caja_abierta = Caja.query.filter_by(estado='abierta').first()
        
        if not caja_abierta:
            return jsonify({
                'error': 'No hay caja abierta para cerrar'
            }), 400
            
        # Obtener ventas para esta caja
        ventas = Venta.query.filter_by(caja_id=caja_abierta.id).all()
        
        # Calcular totales de ventas
        total_ventas = sum(venta.total for venta in ventas)
        
        # Actualizar caja
        caja_abierta.estado = 'cerrada'
        caja_abierta.fecha_cierre = datetime.utcnow()
        caja_abierta.usuario_cierre_id = current_user.id
        caja_abierta.notas_cierre = notas
        caja_abierta.monto_final = total_ventas + caja_abierta.monto_inicial
        caja_abierta.monto_declarado = monto_declarado
        
        # Calcular diferencia (si hay monto declarado)
        if monto_declarado is not None:
            caja_abierta.diferencia = float(monto_declarado) - caja_abierta.monto_final
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Caja cerrada exitosamente',
            'caja': caja_abierta.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': str(e)
        }), 500

@caja_bp.route('/api/caja/marcar-controlada', methods=['POST','OPTIONS'])
def marcar_caja_controlada():
    """Marca una caja como controlada (solo administradores). Responde OPTIONS para preflight sin requerir JWT."""
    try:
        # Responder preflight sin validar JWT
        if request.method == 'OPTIONS':
            return jsonify({}), 200

        # Verificar JWT para el POST
        verify_jwt_in_request()
        current_user_id = get_jwt_identity()
        if not current_user_id:
            return jsonify({'error': 'Usuario no autenticado'}), 401

        current_user = Usuario.query.filter_by(id=current_user_id, activo=True).first()
        if not current_user:
            return jsonify({'error': 'Usuario no encontrado o inactivo'}), 401

        # Comprobar permisos de administrador
        if not getattr(current_user, 'is_admin', False):
            return jsonify({'error': 'Permisos insuficientes'}), 403

        data = request.get_json() or {}
        caja_id = data.get('caja_id') or data.get('id')
        if not caja_id:
            return jsonify({'error': 'Se requiere caja_id'}), 400

        caja = Caja.query.filter_by(id=int(caja_id)).first()
        if not caja:
            return jsonify({'error': 'Caja no encontrada'}), 404

        # Sólo se puede marcar una caja que ya esté cerrada
        if not caja.fecha_cierre:
            return jsonify({'error': 'La caja debe estar cerrada antes de marcarla como controlada'}), 400

        # Marcar como controlada
        caja.fecha_control = datetime.utcnow()
        caja.usuario_control_id = current_user.id
        caja.estado = 'controlada'

        db.session.commit()

        return jsonify({'success': True, 'message': 'Caja marcada como controlada', 'caja': caja.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
