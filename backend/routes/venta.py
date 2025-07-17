# Rutas CRUD para Ventas, incluye lógica de descuento
from flask import Blueprint, request, jsonify
from models.venta import Venta
from models.detalle_venta import DetalleVenta
from database.db import db
from datetime import datetime, timedelta
from sqlalchemy import func, and_

ventas_bp = Blueprint('ventas', __name__, url_prefix='/api/ventas')

# Crear venta (con lógica de descuento y detalle)
@ventas_bp.route('/', methods=['POST'])
def crear_venta():
    data = request.get_json()
    detalles = data.get('detalles', [])
    if not data.get('cliente_id') or not data.get('usuario_id') or not data.get('metodo_pago') or not detalles:
        return jsonify({'error': 'Faltan datos obligatorios'}), 400
    descuento = float(data.get('descuento', 0))
    total_bruto = 0
    for d in detalles:
        total_bruto += d['precio_unitario'] * d['cantidad']
    total_final = total_bruto * (1 - descuento / 100)
    venta = Venta(
        cliente_id=data['cliente_id'],
        usuario_id=data['usuario_id'],
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

# Obtener todas las ventas
@ventas_bp.route('/', methods=['GET'])
def listar_ventas():
    ventas = Venta.query.all()
    return jsonify([
        {'id': v.id, 
         'cliente_id': v.cliente_id, 
         'usuario_id': v.usuario_id, 
         'fecha_venta': v.fecha_venta.isoformat(), 
         'total': v.total, 
         'metodo_pago': v.metodo_pago, 
         'descuento': v.descuento}
        for v in ventas
    ])

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
