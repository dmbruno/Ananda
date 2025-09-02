from flask import Blueprint, request, jsonify
from models.venta import Venta
from models.detalle_venta import DetalleVenta
from models.producto import Producto
from models.caja import Caja
from database.db import db
from datetime import datetime, timedelta
from sqlalchemy import func, and_
from utils.auth_utils import require_auth, get_current_user_from_token

ventas_bp = Blueprint('ventas', __name__, url_prefix='/api/ventas')

# Rutas CRUD 
@ventas_bp.route('/', methods=['POST'])
@require_auth
def crear_venta(current_user):
    data = request.get_json()
    detalles = data.get('detalles', [])
    if not data.get('cliente_id') or not data.get('metodo_pago') or not detalles:
        return jsonify({'error': 'Faltan datos obligatorios'}), 400
    descuento = float(data.get('descuento', 0))
    total_bruto = 0
    for d in detalles:
        total_bruto += d['precio_unitario'] * d['cantidad']
    total_final = total_bruto * (1 - descuento / 100)
    
    # Obtener la caja actual
    caja_abierta = Caja.query.filter_by(estado='abierta').first()
    if not caja_abierta:
        return jsonify({'error': 'No hay una caja abierta para registrar la venta'}), 400
    
    venta = Venta(
        cliente_id=data['cliente_id'],
        usuario_id=current_user.id,  # Usar el usuario autenticado
        caja_id=caja_abierta.id,  # Asociar con la caja abierta
        fecha_venta=datetime.now(),
        total=total_final,
        metodo_pago=data['metodo_pago'],
        descuento=descuento
    )
    db.session.add(venta)
    db.session.flush()  # Para obtener el id de la venta
    for d in detalles:
        detalle = DetalleVenta(
            venta_id=venta.id,
            producto_id=d['producto_id'],
            cantidad=d['cantidad'],
            precio_unitario=d['precio_unitario'],
            subtotal=d['precio_unitario'] * d['cantidad']
        )
        db.session.add(detalle)
    db.session.commit()
    return jsonify({'id': venta.id, 'total': total_final}), 201

# Procesar venta completa (crear venta, descontar stock, actualizar caja)
@ventas_bp.route('/procesar-completa', methods=['POST'])
@require_auth
def procesar_venta_completa(current_user):
    try:
        print("🚀 [BACKEND] Iniciando procesamiento de venta completa...")
        data = request.get_json()
        print(f"📦 [BACKEND] Datos recibidos: {data}")
        
        # Validaciones
        if not data.get('cliente_id'):
            print("❌ [BACKEND] Error: Falta cliente_id")
            return jsonify({'error': 'Falta cliente_id'}), 400
        if not data.get('items') or len(data['items']) == 0:
            print("❌ [BACKEND] Error: Falta items")
            return jsonify({'error': 'Falta items'}), 400
        if not data.get('metodo_pago'):
            print("❌ [BACKEND] Error: Falta metodo_pago")
            return jsonify({'error': 'Falta metodo_pago'}), 400
        if not data.get('caja_id'):
            print("❌ [BACKEND] Error: Falta caja_id")
            return jsonify({'error': 'Falta caja_id'}), 400
        
        print("✅ [BACKEND] Validaciones básicas pasaron")
        
        # Obtener caja actual
        caja = Caja.query.get(data['caja_id'])
        if not caja or caja.estado != 'abierta':
            print(f"❌ [BACKEND] Error: Caja {data['caja_id']} no encontrada o cerrada (estado: {caja.estado if caja else 'N/A'})")
            return jsonify({'error': 'Caja no encontrada o cerrada'}), 400
        
        print(f"✅ [BACKEND] Caja encontrada: {caja.id}")
        
        # Verificar stock disponible
        for item in data['items']:
            producto = Producto.query.get(item['producto_id'])
            if not producto:
                print(f"❌ [BACKEND] Error: Producto {item['producto_id']} no encontrado")
                return jsonify({'error': f'Producto {item["producto_id"]} no encontrado'}), 400
            if producto.stock_actual < item['cantidad']:
                print(f"❌ [BACKEND] Error: Stock insuficiente para {producto.nombre}")
                return jsonify({'error': f'Stock insuficiente para {producto.nombre}. Disponible: {producto.stock_actual}, Solicitado: {item["cantidad"]}'}), 400
        
        print("✅ [BACKEND] Verificación de stock completada")
        
        # Calcular totales
        total_bruto = sum(item['precio_unitario'] * item['cantidad'] for item in data['items'])
        descuento_porcentaje = data.get('descuento', 0)
        monto_descuento = total_bruto * (descuento_porcentaje / 100)
        total_final = total_bruto - monto_descuento
        
        print(f"🧮 [BACKEND] Cálculos: bruto={total_bruto}, descuento={descuento_porcentaje}%, final={total_final}")
        
        # 1. Crear la venta
        print("💾 [BACKEND] Creando venta...")
        # Asegurarnos de que caja_id sea un entero válido
        caja_id = int(data['caja_id']) if data['caja_id'] else None
        print(f"💾 [BACKEND] Asociando venta a caja_id: {caja_id}")
        
        venta = Venta(
            cliente_id=data['cliente_id'],
            usuario_id=current_user.id,  # Usar el usuario autenticado
            caja_id=caja_id,  # Asociar la venta con la caja
            fecha_venta=datetime.now(),
            total=total_final,
            metodo_pago=data['metodo_pago'],
            descuento=descuento_porcentaje
        )
        db.session.add(venta)
        db.session.flush()  # Para obtener el id de la venta
        print(f"✅ [BACKEND] Venta creada con ID: {venta.id}, asociada a caja ID: {venta.caja_id}")
        
        # 2. Crear detalles de venta y descontar stock
        print("📋 [BACKEND] Creando detalles y descontando stock...")
        for item in data['items']:
            # Crear detalle
            detalle = DetalleVenta(
                venta_id=venta.id,
                producto_id=item['producto_id'],
                cantidad=item['cantidad'],
                precio_unitario=item['precio_unitario'],
                subtotal=item['subtotal']
            )
            db.session.add(detalle)
            print(f"📄 [BACKEND] Detalle creado para producto {item['producto_id']}")
            
            # Descontar stock
            producto = Producto.query.get(item['producto_id'])
            stock_anterior = producto.stock_actual
            producto.stock_actual -= item['cantidad']
            print(f"📦 [BACKEND] Stock actualizado para {producto.nombre}: {stock_anterior} -> {producto.stock_actual}")
        
        # 3. Actualizar caja según método de pago
        print(f"💰 [BACKEND] Actualizando caja con método: {data['metodo_pago']}")
        metodo_pago = data['metodo_pago'].upper()
        
        # Actualizar el monto final de la caja (simple tracking del total)
        if caja.monto_final is None:
            caja.monto_final = caja.monto_inicial + total_final
        else:
            caja.monto_final += total_final
            
        print(f"💵 [BACKEND] Caja actualizada con +{total_final}. Monto final: {caja.monto_final}")
        
        # Guardar todos los cambios
        print("💾 [BACKEND] Guardando cambios en base de datos...")
        db.session.commit()
        print("✅ [BACKEND] Todos los cambios guardados exitosamente")
        
        # Respuesta exitosa
        response_data = {
            'mensaje': 'Venta procesada exitosamente',
            'venta': {
                'id': venta.id,
                'total': venta.total,
                'fecha': venta.fecha_venta.isoformat(),
                'metodo_pago': venta.metodo_pago
            },
            'caja_actualizada': {
                'id': caja.id,
                'monto_inicial': caja.monto_inicial,
                'monto_final': caja.monto_final,
                'estado': caja.estado
            }
        }
        print(f"🎉 [BACKEND] Respuesta exitosa: {response_data}")
        return jsonify(response_data), 201
        
    except Exception as e:
        print(f"🔥 [BACKEND] Error inesperado: {str(e)}")
        print(f"🔥 [BACKEND] Tipo de error: {type(e)}")
        import traceback
        print(f"🔥 [BACKEND] Stack trace: {traceback.format_exc()}")
        db.session.rollback()
        return jsonify({'error': f'Error interno: {str(e)}'}), 500

# Obtener todas las ventas
@ventas_bp.route('/', methods=['GET'])
def listar_ventas():
    ventas = Venta.query.all()
    resultado = []
    for v in ventas:
        cliente_nombre = v.cliente.nombre + ' ' + v.cliente.apellido if v.cliente else None
        # Obtener el nombre completo del vendedor
        vendedor_nombre = f"{v.usuario.nombre} {v.usuario.apellido}" if v.usuario else 'Admin'
        
        # Contar la cantidad total de productos en esta venta
        cantidad_productos = sum(d.cantidad for d in v.detalles)
        
        # Un registro por venta (no por producto)
        resultado.append({
            'id': v.id,
            'cliente_id': v.cliente_id,
            'cliente_nombre': cliente_nombre,
            'usuario_id': v.usuario_id,
            'vendedor_nombre': vendedor_nombre,
            'fecha_venta': v.fecha_venta.isoformat(),
            'total': v.total,
            'metodo_pago': v.metodo_pago,
            'descuento': v.descuento,
            'cantidad_productos': cantidad_productos,
            'estado': 'completada'  # Por ahora todas las ventas están completadas
        })
    return jsonify(resultado)

# Obtener venta por id
@ventas_bp.route('/<int:id>', methods=['GET'])
def obtener_venta(id):
    venta = Venta.query.get_or_404(id)
    detalles = [
        {'id': d.id, 'producto_id': d.producto_id, 'cantidad': d.cantidad, 'precio_unitario': d.precio_unitario, 'subtotal': d.subtotal}
        for d in venta.detalles
    ]
    return jsonify({'id': venta.id, 'cliente_id': venta.cliente_id, 'usuario_id': venta.usuario_id, 'fecha_venta': venta.fecha_venta.isoformat(), 'total': venta.total, 'metodo_pago': venta.metodo_pago, 'descuento': venta.descuento, 'detalles': detalles})

# Actualizar venta
@ventas_bp.route('/<int:id>', methods=['PUT'])
def actualizar_venta(id):
    venta = Venta.query.get_or_404(id)
    data = request.get_json()
    # Solo permitimos actualizar ciertos campos
    venta.metodo_pago = data.get('metodo_pago', venta.metodo_pago)
    venta.descuento = data.get('descuento', venta.descuento)
    # Si se quiere actualizar el total, recalcularlo si hay descuento
    if 'total' in data:
        venta.total = data['total']
    db.session.commit()
    return jsonify({'msg': 'Venta actualizada'})

# Eliminar venta
@ventas_bp.route('/<int:id>', methods=['DELETE'])
def eliminar_venta(id):
    venta = Venta.query.get_or_404(id)
    for d in venta.detalles:
        db.session.delete(d)
    db.session.delete(venta)
    db.session.commit()
    return jsonify({'msg': 'Venta eliminada'})

# Obtener estadísticas de ventas de los últimos 10 días
@ventas_bp.route('/estadisticas/ultimos-10-dias', methods=['GET'])
def estadisticas_ultimos_10_dias():
    # Calcular fecha de inicio (10 días atrás)
    fecha_fin = datetime.now()
    fecha_inicio = fecha_fin - timedelta(days=9)  # 9 días atrás + hoy = 10 días
    
    # Obtener ventas agrupadas por día
    ventas_por_dia = db.session.query(
        func.date(Venta.fecha_venta).label('fecha'),
        func.sum(Venta.total).label('total_dia')
    ).filter(
        and_(
            Venta.fecha_venta >= fecha_inicio.date(),
            Venta.fecha_venta <= fecha_fin.date()
        )
    ).group_by(
        func.date(Venta.fecha_venta)
    ).all()
    
    # Crear un diccionario para acceso rápido
    ventas_dict = {str(venta.fecha): float(venta.total_dia) for venta in ventas_por_dia}
    
    # Generar los últimos 10 días
    resultado = []
    total_general = 0
    
    for i in range(10):
        fecha = (fecha_fin - timedelta(days=9-i)).date()
        fecha_str = str(fecha)
        total_dia = ventas_dict.get(fecha_str, 0)
        total_general += total_dia
        
        resultado.append({
            'fecha': fecha_str,
            'dia': fecha.day,
            'total': total_dia
        })
    
    return jsonify({
        'datos': resultado,
        'total_general': total_general,
        'periodo': f"{fecha_inicio.strftime('%d %b')} - {fecha_fin.strftime('%d %b, %Y')}"
    })

# Obtener detalles de una venta específica
@ventas_bp.route('/<int:id>/detalles', methods=['GET'])
def obtener_detalles_venta(id):
    # Verificar que la venta existe
    venta = Venta.query.get_or_404(id)
    
    # Obtener todos los detalles de esta venta con datos del producto
    detalles = []
    for detalle in venta.detalles:
        producto = detalle.producto
        producto_nombre = producto.nombre if producto else None
        talle = producto.talle if producto else None
        
        detalles.append({
            'id': detalle.id,
            'venta_id': detalle.venta_id,
            'producto_id': detalle.producto_id,
            'producto_nombre': producto_nombre,
            'talle': talle,
            'cantidad': detalle.cantidad,
            'precio_unitario': detalle.precio_unitario,
            'subtotal': detalle.subtotal
        })
    
    return jsonify(detalles)
