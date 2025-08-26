from flask import Blueprint, request, jsonify
from database.db import db
from models.caja import Caja
from models.venta import Venta
from models.usuario import Usuario
from sqlalchemy import func, and_, extract
from datetime import datetime, date, timedelta

caja_bp = Blueprint('caja', __name__)

@caja_bp.route('/api/caja/actual', methods=['GET'])
def obtener_caja_actual():
    """Obtiene la caja actualmente abierta"""
    try:
        print("====== INICIO OBTENER CAJA ACTUAL ======")
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
            caja_dict['ventas'] = [venta.to_dict() for venta in ventas]
            
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
        return jsonify({
            'error': str(e),
            'traceback': error_traceback
        }), 500

@caja_bp.route('/api/caja/abrir', methods=['POST'])
def abrir_caja():
    """Abre una nueva caja del día"""
    try:
        print("====== INICIO APERTURA CAJA ======")
        print("Recibiendo solicitud de apertura de caja")
        
        # Obtener datos del request
        data = request.get_json()
        print(f"Datos recibidos: {data}")
        
        monto_inicial = data.get('monto_inicial', 0.0)
        usuario_id = data.get('usuario_id', 1)  # TODO: Obtener del usuario logueado
        notas = data.get('notas', '')
        
        print(f"Monto inicial: {monto_inicial}, Usuario ID: {usuario_id}, Notas: {notas}")
        
        # Verificar que no haya una caja abierta
        caja_abierta = Caja.query.filter_by(estado='abierta').first()
        if caja_abierta:
            print(f"Error: Ya existe una caja abierta con ID {caja_abierta.id}")
            return jsonify({'error': 'Ya hay una caja abierta'}), 400
        
        print("Creando nueva caja...")
        # Crear nueva caja
        nueva_caja = Caja(
            monto_inicial=float(monto_inicial),
            usuario_apertura_id=usuario_id,
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
def cerrar_caja():
    """Cierra la caja actual"""
    try:
        data = request.get_json()
        notas = data.get('notas', '')
        usuario_id = data.get('usuario_id', 1)  # TODO: Obtener del usuario logueado
        monto_declarado = data.get('monto_declarado')  # Monto declarado por el usuario
        
        # Buscar caja abierta
        caja_abierta = Caja.query.filter_by(estado='abierta').first()
        if not caja_abierta:
            return jsonify({'error': 'No hay una caja abierta'}), 400
        
        # Calcular monto final basado en ventas del día
        ventas_del_dia = Venta.query.filter(
            and_(
                Venta.caja_id == caja_abierta.id,
                func.date(Venta.fecha_venta) == date.today()
            )
        ).all()
        
        total_ventas = sum(venta.total for venta in ventas_del_dia)
        monto_sistema = caja_abierta.monto_inicial + total_ventas
        
        # Usar el monto declarado si se proporcionó, de lo contrario usar el calculado
        monto_final = monto_declarado if monto_declarado is not None else monto_sistema
        
        # Calcular diferencia
        diferencia = monto_final - monto_sistema if monto_declarado is not None else 0
        
        # Actualizar caja
        caja_abierta.estado = 'cerrada'
        caja_abierta.fecha_cierre = datetime.utcnow()
        caja_abierta.monto_final = monto_final
        caja_abierta.monto_sistema = monto_sistema
        caja_abierta.diferencia = diferencia
        caja_abierta.usuario_cierre_id = usuario_id
        caja_abierta.notas_cierre = notas
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Caja cerrada exitosamente',
            'caja': caja_abierta.to_dict(),
            'resumen': {
                'monto_inicial': caja_abierta.monto_inicial,
                'total_ventas': total_ventas,
                'monto_final': monto_final,
                'cantidad_ventas': len(ventas_del_dia)
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@caja_bp.route('/api/caja/<int:caja_id>', methods=['GET'])
def obtener_caja_por_id(caja_id):
    """Obtiene una caja específica por su ID, incluyendo sus ventas"""
    try:
        print(f"====== INICIO OBTENER CAJA POR ID: {caja_id} ======")
        caja = Caja.query.get(caja_id)
        
        if not caja:
            print(f"Caja con ID {caja_id} no encontrada")
            print("====== FIN OBTENER CAJA POR ID (ERROR) ======")
            return jsonify({'error': f'No se encontró la caja con ID {caja_id}'}), 404
            
        print(f"Caja encontrada ID: {caja.id}, estado: {caja.estado}")
        
        # Obtener ventas para esta caja - MEJORADO para asegurar que devuelve todas las ventas
        ventas = Venta.query.filter_by(caja_id=caja.id).all()
        print(f"Número de ventas encontradas para caja ID {caja_id}: {len(ventas)}")
        
        if len(ventas) == 0:
            print("⚠️ ADVERTENCIA: No se encontraron ventas para esta caja. Verificando si hay ventas sin asociar...")
            # Verificar si hay ventas sin asociar a ninguna caja y mostrar alerta
            ventas_sin_caja = Venta.query.filter_by(caja_id=None).count()
            if ventas_sin_caja > 0:
                print(f"⚠️ ADVERTENCIA: Se encontraron {ventas_sin_caja} ventas sin asociar a ninguna caja")
        
        # Imprimir detalles de cada venta para debugging
        for venta in ventas:
            print(f"  - Venta ID: {venta.id}, Cliente: {venta.cliente_id}, Total: {venta.total}, Fecha: {venta.fecha_venta}")
        
        # Calcular totales de ventas
        total_ventas = sum(venta.total for venta in ventas)
        print(f"Total ventas: {total_ventas}, Cantidad: {len(ventas)}")
        
        # Crear un diccionario completo con toda la información
        caja_dict = caja.to_dict()
        caja_dict['ventas_total'] = total_ventas
        caja_dict['ventas_cantidad'] = len(ventas)
        
                # IMPORTANTE: Optimizar el objeto venta para reducir tamaño de respuesta
        ventas_list = []
        for venta in ventas:
            # Crear un objeto simplificado de la venta con datos esenciales
            try:
                # Usar to_dict_simple si está disponible
                if hasattr(venta, 'to_dict_simple'):
                    venta_dict = venta.to_dict_simple()
                    # Asegurar que cliente_nombre está definido
                    if not 'cliente_nombre' in venta_dict and venta.cliente:
                        venta_dict['cliente_nombre'] = f"{venta.cliente.nombre} {venta.cliente.apellido}"
                else:
                    # Crear un objeto básico si no hay to_dict_simple
                    venta_dict = {
                        'id': venta.id,
                        'cliente_id': venta.cliente_id,
                        'cliente_nombre': f"{venta.cliente.nombre} {venta.cliente.apellido}" if venta.cliente else f"Cliente #{venta.cliente_id}",
                        'total': venta.total,
                        'metodo_pago': venta.metodo_pago,
                        'fecha_venta': venta.fecha_venta.isoformat() if venta.fecha_venta else None
                    }
                ventas_list.append(venta_dict)
            except Exception as e:
                print(f"Error al procesar venta {venta.id}: {str(e)}")
                # Objeto mínimo en caso de error
                ventas_list.append({
                    'id': venta.id,
                    'cliente_id': venta.cliente_id,
                    'cliente_nombre': f"Cliente #{venta.cliente_id}",
                    'total': venta.total if hasattr(venta, 'total') else 0,
                    'metodo_pago': venta.metodo_pago if hasattr(venta, 'metodo_pago') else 'N/A',
                    'fecha_venta': venta.fecha_venta.isoformat() if hasattr(venta, 'fecha_venta') and venta.fecha_venta else None
                })
            
        caja_dict['ventas'] = ventas_list
        print(f"Ventas procesadas correctamente: {len(ventas_list)}")
        
        print(f"Enviando respuesta con caja y {len(ventas_list)} ventas")
        print("====== FIN OBTENER CAJA POR ID ======")
        return jsonify(caja_dict), 200
            
    except Exception as e:
        import traceback
        error_traceback = traceback.format_exc()
        print(f"ERROR al obtener caja por ID: {str(e)}")
        print(f"Traceback: {error_traceback}")
        print("====== FIN OBTENER CAJA POR ID (ERROR) ======")
        return jsonify({
            'error': str(e),
            'traceback': error_traceback
        }), 500

@caja_bp.route('/api/caja/marcar-controlada', methods=['POST'])
def marcar_caja_controlada():
    """Marca una caja como controlada por el dueño/admin"""
    try:
        data = request.get_json()
        usuario_id = data.get('usuario_id', 1)  # Este debería ser el ID del dueño/admin
        caja_id = data.get('caja_id')
        
        if not caja_id:
            return jsonify({'error': 'Falta el ID de la caja'}), 400
            
        # Verificar que la caja exista
        caja = Caja.query.get(caja_id)
        if not caja:
            return jsonify({'error': f'No se encontró la caja con ID {caja_id}'}), 404
            
        # Verificar que la caja esté cerrada
        if caja.estado != 'cerrada':
            return jsonify({'error': 'Solo se pueden marcar como controladas las cajas cerradas'}), 400
        
        # Actualizar la caja
        caja.estado = 'controlada'
        caja.fecha_control = datetime.utcnow()
        caja.usuario_control_id = usuario_id
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Caja marcada como controlada exitosamente',
            'caja': caja.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@caja_bp.route('/api/caja/resumen-dia', methods=['GET'])
def obtener_resumen_dia():
    """Obtiene el resumen de ventas del día"""
    try:
        fecha_param = request.args.get('fecha')
        if fecha_param:
            fecha = datetime.strptime(fecha_param, '%Y-%m-%d').date()
        else:
            fecha = date.today()
        
        # Buscar caja del día
        caja_del_dia = Caja.query.filter(
            func.date(Caja.fecha_apertura) == fecha
        ).first()
        
        if not caja_del_dia:
            return jsonify({
                'fecha': fecha.isoformat(),
                'caja_id': None,
                'monto_inicial': 0,
                'total_ventas': 0,
                'monto_final': 0,
                'cantidad_ventas': 0,
                'ventas_por_metodo': {},
                'estado': 'sin_caja'
            }), 200
        
        # Obtener ventas del día
        ventas_del_dia = Venta.query.filter(
            and_(
                Venta.caja_id == caja_del_dia.id,
                func.date(Venta.fecha_venta) == fecha
            )
        ).all()
        
        total_ventas = sum(venta.total for venta in ventas_del_dia)
        
        # Agrupar ventas por método de pago
        ventas_por_metodo = {}
        for venta in ventas_del_dia:
            metodo = venta.metodo_pago
            if metodo not in ventas_por_metodo:
                ventas_por_metodo[metodo] = {'cantidad': 0, 'total': 0}
            ventas_por_metodo[metodo]['cantidad'] += 1
            ventas_por_metodo[metodo]['total'] += venta.total
        
        return jsonify({
            'fecha': fecha.isoformat(),
            'caja_id': caja_del_dia.id,
            'monto_inicial': caja_del_dia.monto_inicial,
            'total_ventas': total_ventas,
            'monto_final': caja_del_dia.monto_final if caja_del_dia.estado == 'cerrada' else caja_del_dia.monto_inicial + total_ventas,
            'cantidad_ventas': len(ventas_del_dia),
            'ventas_por_metodo': ventas_por_metodo,
            'estado': caja_del_dia.estado
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Duplicar la ruta para mantener compatibilidad con ambas URLs
@caja_bp.route('/api/caja/listar', methods=['GET'])
@caja_bp.route('/api/cajas', methods=['GET'])
def listar_cajas():
    """Obtiene la lista de cajas con opciones de filtrado"""
    try:
        print("====== INICIO LISTAR CAJAS ======")
        # Parámetros de filtrado
        fecha_inicio_str = request.args.get('fecha_inicio')
        fecha_fin_str = request.args.get('fecha_fin')
        estado = request.args.get('estado')
        usuario_id = request.args.get('usuario_id')
        
        print(f"Parámetros recibidos: fecha_inicio={fecha_inicio_str}, fecha_fin={fecha_fin_str}, estado={estado}, usuario_id={usuario_id}")
        
        # Construir la consulta base
        query = Caja.query
        
        # Aplicar filtros
        if fecha_inicio_str:
            fecha_inicio = datetime.strptime(fecha_inicio_str, '%Y-%m-%d').date()
            query = query.filter(func.date(Caja.fecha_apertura) >= fecha_inicio)
        
        if fecha_fin_str:
            fecha_fin = datetime.strptime(fecha_fin_str, '%Y-%m-%d').date()
            # Incluir todo el día hasta las 23:59:59
            fecha_fin_completa = datetime.combine(fecha_fin, datetime.max.time())
            query = query.filter(Caja.fecha_apertura <= fecha_fin_completa)
        
        if estado:
            query = query.filter(Caja.estado == estado)
        
        if usuario_id:
            query = query.filter(
                (Caja.usuario_apertura_id == usuario_id) | 
                (Caja.usuario_cierre_id == usuario_id) |
                (Caja.usuario_control_id == usuario_id)
            )
        
        # Si no hay filtros de fecha, limitar a los últimos 30 días por defecto
        if not fecha_inicio_str and not fecha_fin_str:
            fecha_inicio_default = date.today() - timedelta(days=30)
            query = query.filter(func.date(Caja.fecha_apertura) >= fecha_inicio_default)
        
        # Ordenar por fecha de apertura (más reciente primero)
        cajas = query.order_by(Caja.fecha_apertura.desc()).all()
        print(f"Se encontraron {len(cajas)} cajas")
        
        # Enriquecer los datos con información adicional
        cajas_con_usuarios = []
        for caja in cajas:
            print(f"Procesando caja ID: {caja.id}, estado: {caja.estado}")
            caja_dict = caja.to_dict()
            
            # Añadir detalles de usuarios
            if caja.usuario_apertura_id:
                usuario_apertura = Usuario.query.get(caja.usuario_apertura_id)
                if usuario_apertura:
                    caja_dict['usuario_apertura'] = {
                        'id': usuario_apertura.id,
                        'nombre': usuario_apertura.nombre,
                        'rol': 'admin' if usuario_apertura.is_admin else 'empleado'
                    }
            
            if caja.usuario_cierre_id:
                usuario_cierre = Usuario.query.get(caja.usuario_cierre_id)
                if usuario_cierre:
                    caja_dict['usuario_cierre'] = {
                        'id': usuario_cierre.id,
                        'nombre': usuario_cierre.nombre,
                        'rol': 'admin' if usuario_cierre.is_admin else 'empleado'
                    }
            
            if hasattr(caja, 'usuario_control_id') and caja.usuario_control_id:
                usuario_control = Usuario.query.get(caja.usuario_control_id)
                if usuario_control:
                    caja_dict['usuario_control'] = {
                        'id': usuario_control.id,
                        'nombre': usuario_control.nombre,
                        'rol': 'admin' if usuario_control.is_admin else 'empleado'
                    }
            
            cajas_con_usuarios.append(caja_dict)
        
        print(f"Enviando {len(cajas_con_usuarios)} cajas en la respuesta")
        print("====== FIN LISTAR CAJAS ======")
        return jsonify(cajas_con_usuarios), 200
        
    except Exception as e:
        import traceback
        error_traceback = traceback.format_exc()
        print(f"ERROR al listar cajas: {str(e)}")
        print(f"Traceback: {error_traceback}")
        print("====== FIN LISTAR CAJAS (ERROR) ======")
        return jsonify({'error': str(e), 'traceback': error_traceback}), 500

@caja_bp.route('/api/cajas/<int:caja_id>', methods=['GET'])
def obtener_detalle_caja(caja_id):
    """Obtiene el detalle de una caja específica"""
    try:
        caja = Caja.query.get(caja_id)
        if not caja:
            return jsonify({'error': f'No se encontró la caja con ID {caja_id}'}), 404
        
        # Obtener el detalle básico de la caja
        caja_dict = caja.to_dict()
        
        # Añadir detalles de usuarios
        if caja.usuario_apertura_id:
            usuario_apertura = Usuario.query.get(caja.usuario_apertura_id)
            if usuario_apertura:
                caja_dict['usuario_apertura'] = {
                    'id': usuario_apertura.id,
                    'nombre': usuario_apertura.nombre,
                    'rol': 'admin' if usuario_apertura.is_admin else 'empleado'
                }
        
        if caja.usuario_cierre_id:
            usuario_cierre = Usuario.query.get(caja.usuario_cierre_id)
            if usuario_cierre:
                caja_dict['usuario_cierre'] = {
                    'id': usuario_cierre.id,
                    'nombre': usuario_cierre.nombre,
                    'rol': 'admin' if usuario_cierre.is_admin else 'empleado'
                }
        
        if hasattr(caja, 'usuario_control_id') and caja.usuario_control_id:
            usuario_control = Usuario.query.get(caja.usuario_control_id)
            if usuario_control:
                caja_dict['usuario_control'] = {
                    'id': usuario_control.id,
                    'nombre': usuario_control.nombre,
                    'rol': 'admin' if usuario_control.is_admin else 'empleado'
                }
        
        # Obtener ventas relacionadas a esta caja
        ventas = Venta.query.filter(Venta.caja_id == caja.id).all()
        
        # Calcular resumen de ventas por método de pago
        ventas_por_metodo = {}
        for venta in ventas:
            metodo = venta.metodo_pago
            if metodo not in ventas_por_metodo:
                ventas_por_metodo[metodo] = {'cantidad': 0, 'total': 0}
            ventas_por_metodo[metodo]['cantidad'] += 1
            ventas_por_metodo[metodo]['total'] += venta.total
        
        caja_dict['resumen_ventas'] = {
            'total_ventas': sum(venta.total for venta in ventas),
            'cantidad_ventas': len(ventas),
            'ventas_por_metodo': ventas_por_metodo
        }
        
        return jsonify(caja_dict), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
