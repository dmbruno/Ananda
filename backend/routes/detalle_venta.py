# Rutas CRUD para Detalle de Ventas
from flask import Blueprint, request, jsonify
from models.detalle_venta import DetalleVenta
from database.db import db

detalle_ventas_bp = Blueprint('detalle_ventas', __name__, url_prefix='/api/detalle_ventas')

# Crear detalle de venta
@detalle_ventas_bp.route('/', methods=['POST'])
def crear_detalle_venta():
    data = request.get_json()
    if not data.get('venta_id') or not data.get('producto_id') or not data.get('cantidad') or not data.get('precio_unitario'):
        return jsonify({'error': 'Faltan datos obligatorios'}), 400
    detalle = DetalleVenta(
        venta_id=data['venta_id'],
        producto_id=data['producto_id'],
        cantidad=data['cantidad'],
        precio_unitario=data['precio_unitario'],
        subtotal=data['precio_unitario'] * data['cantidad']
    )
    db.session.add(detalle)
    db.session.commit()
    return jsonify({'id': detalle.id}), 201

# Obtener todos los detalles de venta
@detalle_ventas_bp.route('/', methods=['GET'])
def listar_detalles_venta():
    detalles = DetalleVenta.query.all()
    return jsonify([
        {'id': d.id, 'venta_id': d.venta_id, 'producto_id': d.producto_id, 'cantidad': d.cantidad, 'precio_unitario': d.precio_unitario, 'subtotal': d.subtotal}
        for d in detalles
    ])

# Obtener detalle de venta por id
@detalle_ventas_bp.route('/<int:id>', methods=['GET'])
def obtener_detalle_venta(id):
    d = DetalleVenta.query.get_or_404(id)
    return jsonify({'id': d.id, 'venta_id': d.venta_id, 'producto_id': d.producto_id, 'cantidad': d.cantidad, 'precio_unitario': d.precio_unitario, 'subtotal': d.subtotal})

# Actualizar detalle de venta
@detalle_ventas_bp.route('/<int:id>', methods=['PUT'])
def actualizar_detalle_venta(id):
    detalle = DetalleVenta.query.get_or_404(id)
    data = request.get_json()
    detalle.cantidad = data.get('cantidad', detalle.cantidad)
    detalle.precio_unitario = data.get('precio_unitario', detalle.precio_unitario)
    detalle.subtotal = detalle.cantidad * detalle.precio_unitario
    db.session.commit()
    return jsonify({'msg': 'Detalle de venta actualizado'})

# Eliminar detalle de venta
@detalle_ventas_bp.route('/<int:id>', methods=['DELETE'])
def eliminar_detalle_venta(id):
    detalle = DetalleVenta.query.get_or_404(id)
    db.session.delete(detalle)
    db.session.commit()
    return jsonify({'msg': 'Detalle de venta eliminado'})
