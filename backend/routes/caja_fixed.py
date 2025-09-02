from flask import Blueprint, request, jsonify
from database.db import db
from models.caja import Caja
from models.venta import Venta
from models.usuario import Usuario
from sqlalchemy import func, and_, extract
from datetime import datetime, date, timedelta
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.auth_utils import require_auth, get_current_user_from_token

caja_bp = Blueprint('caja', __name__)

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
