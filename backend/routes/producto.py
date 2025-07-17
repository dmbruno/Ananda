# Rutas CRUD para Productos
from flask import Blueprint, request, jsonify
from models.producto import Producto
from models.subcategoria import Subcategoria
from database.db import db

productos_bp = Blueprint('productos', __name__, url_prefix='/api/productos')

# Crear producto
@productos_bp.route('/', methods=['POST'])
def crear_producto():
    data = request.get_json()
    if not data.get('nombre') or not data.get('costo') or not data.get('precio_venta') or not data.get('categoria_id'):
        return jsonify({'error': 'Faltan datos obligatorios'}), 400
    producto = Producto(
        nombre=data['nombre'],
        talle=data.get('talle'),
        codigo=data.get('codigo'),
        color=data.get('color'),
        marca=data.get('marca'),
        costo=data['costo'],
        precio_venta=data['precio_venta'],
        imagen_url=data.get('imagen_url'),
        stock_actual=data.get('stock_actual', 0),
        categoria_id=data['categoria_id']
    )
    db.session.add(producto)
    db.session.commit()
    return jsonify({'id': producto.id}), 201

# Obtener todos los productos
@productos_bp.route('/', methods=['GET'])
def listar_productos():
    productos = Producto.query.filter_by(activo=True).all()
    return jsonify([
        {
            'id': p.id,
            'nombre': p.nombre,
            'talle': p.talle,
            'codigo': p.codigo,
            'color': p.color,
            'marca': p.marca,
            'costo': p.costo,
            'precio_venta': p.precio_venta,
            'imagen_url': p.imagen_url,
            'stock_actual': p.stock_actual,
            'categoria_id': p.categoria_id,
            'categoria_nombre': p.categoria.nombre if p.categoria else None,
            'subcategoria_id': p.subcategoria_id,
            'subcategoria_nombre': p.subcategoria.nombre if p.subcategoria else None
        }
        for p in productos
    ])

# Obtener producto por id
@productos_bp.route('/<int:id>', methods=['GET'])
def obtener_producto(id):
    producto = Producto.query.get_or_404(id)
    return jsonify({
        'id': producto.id,
        'nombre': producto.nombre,
        'talle': producto.talle,
        'codigo': producto.codigo,
        'color': producto.color,
        'marca': producto.marca,
        'costo': producto.costo,
        'precio_venta': producto.precio_venta,
        'imagen_url': producto.imagen_url,
        'stock_actual': producto.stock_actual,
        'categoria_id': producto.categoria_id,
        'categoria_nombre': producto.categoria.nombre if producto.categoria else None,
        'subcategoria_id': producto.subcategoria_id,
        'subcategoria_nombre': producto.subcategoria.nombre if producto.subcategoria else None
    })

# Actualizar producto
@productos_bp.route('/<int:id>', methods=['PUT'])
def actualizar_producto(id):
    producto = Producto.query.get_or_404(id)
    data = request.get_json()
    producto.nombre = data.get('nombre', producto.nombre)
    producto.talle = data.get('talle', producto.talle)
    producto.codigo = data.get('codigo', producto.codigo)
    producto.color = data.get('color', producto.color)
    producto.marca = data.get('marca', producto.marca)
    producto.costo = data.get('costo', producto.costo)
    producto.precio_venta = data.get('precio_venta', producto.precio_venta)
    producto.stock_actual = data.get('stock_actual', producto.stock_actual)
    producto.categoria_id = data.get('categoria_id', producto.categoria_id)
    producto.subcategoria_id = data.get('subcategoria_id', producto.subcategoria_id)
    db.session.commit()
    return jsonify({'msg': 'Producto actualizado'})

# Eliminar producto
@productos_bp.route('/<int:id>', methods=['DELETE'])
def eliminar_producto(id):
    producto = Producto.query.get_or_404(id)
    producto.activo = False
    db.session.commit()
    return jsonify({'msg': 'Producto eliminado (borrado lógico)'})

# Obtener productos con categoría o subcategoría inactiva
@productos_bp.route('/inconsistentes', methods=['GET'])
def productos_con_categoria_inactiva():
    productos = Producto.query.filter_by(activo=True).all()
    inconsistentes = []
    for p in productos:
        cat_inactiva = p.categoria and not p.categoria.activo
        subcat_inactiva = p.subcategoria and not p.subcategoria.activo
        if cat_inactiva or subcat_inactiva:
            inconsistentes.append({
                'id': p.id,
                'nombre': p.nombre,
                'categoria_id': p.categoria_id,
                'categoria_nombre': p.categoria.nombre if p.categoria else None,
                'categoria_activa': p.categoria.activo if p.categoria else None,
                'subcategoria_id': p.subcategoria_id,
                'subcategoria_nombre': p.subcategoria.nombre if p.subcategoria else None,
                'subcategoria_activa': p.subcategoria.activo if p.subcategoria else None
            })
    return jsonify(inconsistentes)

# Reasignar categoría y subcategoría activas a un producto
@productos_bp.route('/<int:id>/reasignar', methods=['PUT'])
def reasignar_categoria_subcategoria(id):
    data = request.get_json()
    producto = Producto.query.get_or_404(id)
    # Validar categoría activa
    categoria_id = data.get('categoria_id')
    subcategoria_id = data.get('subcategoria_id')
    if categoria_id:
        from models.categoria import Categoria
        categoria = Categoria.query.filter_by(id=categoria_id, activo=True).first()
        if not categoria:
            return jsonify({'error': 'Categoría no encontrada o inactiva'}), 400
        producto.categoria_id = categoria_id
    if subcategoria_id:
        from models.subcategoria import Subcategoria
        subcategoria = Subcategoria.query.filter_by(id=subcategoria_id, activo=True).first()
        if not subcategoria:
            return jsonify({'error': 'Subcategoría no encontrada o inactiva'}), 400
        producto.subcategoria_id = subcategoria_id
    db.session.commit()
    return jsonify({'msg': 'Producto reasignado correctamente'})
