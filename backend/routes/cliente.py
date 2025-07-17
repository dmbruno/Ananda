# Rutas CRUD para Clientes
from flask import Blueprint, request, jsonify
from models.cliente import Cliente
from database.db import db
from datetime import datetime

clientes_bp = Blueprint('clientes', __name__, url_prefix='/api/clientes')

# Crear cliente
@clientes_bp.route('/', methods=['POST'])
def crear_cliente():
    data = request.get_json()
    if not data.get('nombre') or not data.get('apellido'):
        return jsonify({'error': 'Faltan datos obligatorios'}), 400
    fecha_nacimiento = data.get('fecha_nacimiento')
    if fecha_nacimiento:
        try:
            fecha_nacimiento = datetime.strptime(fecha_nacimiento, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Formato de fecha_nacimiento inválido. Debe ser YYYY-MM-DD'}), 400
    cliente = Cliente(
        nombre=data['nombre'],
        apellido=data['apellido'],
        telefono=data.get('telefono'),
        fecha_nacimiento=fecha_nacimiento
    )
    db.session.add(cliente)
    db.session.commit()
    return jsonify({'id': cliente.id}), 201

# Obtener todos los clientes
@clientes_bp.route('/', methods=['GET'])
def listar_clientes():
    clientes = Cliente.query.filter_by(activo=True).all()
    return jsonify([
        {'id': c.id, 'nombre': c.nombre, 'apellido': c.apellido, 'telefono': c.telefono, 'fecha_nacimiento': str(c.fecha_nacimiento) if c.fecha_nacimiento else None}
        for c in clientes
    ])

# Obtener cliente por id
@clientes_bp.route('/<int:id>', methods=['GET'])
def obtener_cliente(id):
    cliente = Cliente.query.get_or_404(id)
    return jsonify({'id': cliente.id, 'nombre': cliente.nombre, 'apellido': cliente.apellido, 'telefono': cliente.telefono, 'fecha_nacimiento': str(cliente.fecha_nacimiento) if cliente.fecha_nacimiento else None})

# Actualizar cliente
@clientes_bp.route('/<int:id>', methods=['PUT'])
def actualizar_cliente(id):
    cliente = Cliente.query.get_or_404(id)
    data = request.get_json()
    cliente.nombre = data.get('nombre', cliente.nombre)
    cliente.apellido = data.get('apellido', cliente.apellido)
    cliente.telefono = data.get('telefono', cliente.telefono)
    cliente.fecha_nacimiento = data.get('fecha_nacimiento', cliente.fecha_nacimiento)
    db.session.commit()
    return jsonify({'msg': 'Cliente actualizado'})

# Eliminar cliente
@clientes_bp.route('/<int:id>', methods=['DELETE'])
def eliminar_cliente(id):
    cliente = Cliente.query.get_or_404(id)
    cliente.activo = False
    db.session.commit()
    return jsonify({'msg': 'Cliente eliminado (borrado lógico)'})
