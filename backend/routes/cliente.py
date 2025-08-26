# Rutas CRUD para Clientes
from flask import Blueprint, request, jsonify
from models.cliente import Cliente
from database.db import db
from datetime import datetime

clientes_bp = Blueprint('clientes', __name__, url_prefix='/api/clientes')

# Crear cliente
@clientes_bp.route('/', methods=['POST'])
def crear_cliente():
    try:
        print("Solicitud recibida en la ruta POST /api/clientes/")  # Log inicial
        data = request.get_json()
        print("Datos recibidos en el backend:", data)  # Log de datos recibidos
        if not data:
            print("No se recibió ningún dato en la petición.")
            return jsonify({'error': 'No se recibió ningún dato'}), 400
        if not data.get('nombre') or not data.get('apellido'):
            print("Faltan datos obligatorios: nombre o apellido.")
            return jsonify({'error': 'Faltan datos obligatorios'}), 400
        fecha_nacimiento = data.get('fecha_nacimiento')
        print("Valor recibido para fecha_nacimiento:", fecha_nacimiento)
        fecha_nacimiento_obj = None
        if fecha_nacimiento:
            try:
                fecha_nacimiento_obj = datetime.strptime(fecha_nacimiento, '%Y-%m-%d').date()
            except Exception as e:
                print("Error al parsear fecha_nacimiento:", e)
                return jsonify({'error': 'Formato de fecha_nacimiento inválido. Debe ser YYYY-MM-DD'}), 400
        cliente = Cliente(
            nombre=data['nombre'],
            apellido=data['apellido'],
            telefono=data.get('telefono'),
            fecha_nacimiento=fecha_nacimiento_obj,
            activo=data.get('activo', True)
        )
        db.session.add(cliente)
        db.session.commit()
        print("Cliente creado en la base de datos:", cliente)
        return jsonify({
            "message": "Cliente creado correctamente",
            "cliente": {
                "id": cliente.id,
                "nombre": cliente.nombre,
                "apellido": cliente.apellido,
                "telefono": cliente.telefono,
                "fecha_nacimiento": str(cliente.fecha_nacimiento) if cliente.fecha_nacimiento else None,
                "activo": cliente.activo
            }
        }), 201
    except Exception as e:
        print("Error inesperado en crear_cliente:", e)
        return jsonify({'error': f'Error inesperado: {str(e)}'}), 500

# Obtener todos los clientes
@clientes_bp.route('/', methods=['GET'])
def listar_clientes():
    clientes = Cliente.query.filter_by(activo=True).all()
    return jsonify([
        {
            'id': c.id, 
            'nombre': c.nombre, 
            'apellido': c.apellido, 
            'telefono': c.telefono, 
            'fecha_nacimiento': str(c.fecha_nacimiento) if c.fecha_nacimiento else None,
            'ultimo_saludo': str(c.ultimo_saludo) if c.ultimo_saludo else None
        }
        for c in clientes
    ])

# Obtener cliente por id
@clientes_bp.route('/<int:id>', methods=['GET'])
def obtener_cliente(id):
    cliente = Cliente.query.get_or_404(id)
    return jsonify({
        'id': cliente.id, 
        'nombre': cliente.nombre, 
        'apellido': cliente.apellido, 
        'telefono': cliente.telefono, 
        'fecha_nacimiento': str(cliente.fecha_nacimiento) if cliente.fecha_nacimiento else None,
        'ultimo_saludo': str(cliente.ultimo_saludo) if cliente.ultimo_saludo else None
    })

# Actualizar cliente
@clientes_bp.route('/<int:id>', methods=['PUT'])
def actualizar_cliente(id):
    try:
        cliente = Cliente.query.get_or_404(id)
        data = request.get_json()
        cliente.nombre = data.get('nombre', cliente.nombre)
        cliente.apellido = data.get('apellido', cliente.apellido)
        cliente.telefono = data.get('telefono', cliente.telefono)
        fecha_nacimiento = data.get('fecha_nacimiento')
        if fecha_nacimiento:
            try:
                cliente.fecha_nacimiento = datetime.strptime(fecha_nacimiento, '%Y-%m-%d').date()
            except Exception as e:
                print("Error al parsear fecha_nacimiento en PUT:", e)
                return jsonify({'error': 'Formato de fecha_nacimiento inválido. Debe ser YYYY-MM-DD'}), 400
        db.session.commit()
        return jsonify({'msg': 'Cliente actualizado'})
    except Exception as e:
        print("Error inesperado en actualizar_cliente:", e)
        return jsonify({'error': f'Error inesperado: {str(e)}'}), 500

# Eliminar cliente
@clientes_bp.route('/<int:id>', methods=['DELETE'])
def eliminar_cliente(id):
    cliente = Cliente.query.get(id)
    if not cliente:
        return jsonify({"error": "Cliente no encontrado"}), 404

    cliente.activo = False
    db.session.commit()
    return jsonify({"message": "Cliente eliminado correctamente"}), 200

# Marcar cliente como saludado (endpoint nuevo para el dashboard)
@clientes_bp.route('/<int:cliente_id>/marcar-saludado', methods=['PUT'])
def marcar_cliente_saludado_dashboard(cliente_id):
    """Marca un cliente como saludado desde el dashboard"""
    try:
        cliente = Cliente.query.get_or_404(cliente_id)
        from datetime import date
        
        cliente.ultimo_saludo = date.today()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Cliente marcado como saludado',
            'ultimo_saludo': cliente.ultimo_saludo.isoformat()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
    
# Marcar cliente como saludado
@clientes_bp.route('/<int:id>/saludar', methods=['POST'])
def marcar_cliente_saludado(id):
    """Marca un cliente como saludado registrando la fecha actual"""
    try:
        cliente = Cliente.query.get_or_404(id)
        from datetime import date
        
        # Actualizar la fecha de último saludo
        cliente.ultimo_saludo = date.today()
        db.session.commit()
        
        return jsonify({
            "message": f"Cliente {id} marcado como saludado",
            "fecha": cliente.ultimo_saludo.isoformat(),
            "cliente": cliente.nombre + " " + cliente.apellido
        }), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error al marcar cliente {id} como saludado: {str(e)}")
        return jsonify({"error": f"Error al marcar cliente como saludado: {str(e)}"}), 500
