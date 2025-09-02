from flask import Blueprint, request, jsonify
from models.producto import Producto
from models.categoria import Categoria
from models.subcategoria import Subcategoria
from database.db import db
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from models.usuario import Usuario

ajuste_precios_bp = Blueprint('ajuste_precios', __name__)

@ajuste_precios_bp.route('/ajuste-masivo-precios', methods=['POST', 'OPTIONS'])
def ajuste_masivo_precios():
    # Responder preflight
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    try:
        # Verificar JWT manualmente y permisos de admin
        verify_jwt_in_request()
        current_user_id = get_jwt_identity()
        current_user = Usuario.query.filter_by(id=current_user_id, activo=True).first()
        if not current_user:
            return jsonify({'error': 'Usuario no autenticado'}), 401
        if not getattr(current_user, 'is_admin', False):
            return jsonify({'error': 'No autorizado'}), 403

        data = request.json or {}
        tipo_ajuste = data.get('tipo_ajuste')  # 'monto' o 'porcentaje'
        try:
            valor_ajuste = float(data.get('valor_ajuste', 0))
        except Exception:
            return jsonify({'error': 'valor_ajuste inválido'}), 400

        alcance = data.get('alcance', 'todos')  # 'todos', 'categoria', 'subcategoria', 'productos_especificos'
        categoria_id = data.get('categoria_id')
        subcategoria_id = data.get('subcategoria_id')
        productos_ids = data.get('productos_ids', [])  # Lista de IDs para 'productos_especificos'

        # Validaciones
        if tipo_ajuste not in ['monto', 'porcentaje']:
            return jsonify({'error': 'Tipo de ajuste inválido'}), 400

        if valor_ajuste <= 0:
            return jsonify({'error': 'El valor del ajuste debe ser positivo'}), 400

        # Construir la consulta según el alcance
        query = Producto.query

        if alcance == 'productos_especificos' and productos_ids:
            # Asegurar que los IDs sean enteros
            try:
                productos_ids = [int(x) for x in productos_ids]
            except Exception:
                return jsonify({'error': 'productos_ids inválido'}), 400
            query = query.filter(Producto.id.in_(productos_ids))
        elif alcance == 'categoria' and categoria_id:
            try:
                cid = int(categoria_id)
            except Exception:
                return jsonify({'error': 'categoria_id inválido'}), 400
            query = query.filter(Producto.categoria_id == cid)
        elif alcance == 'subcategoria' and subcategoria_id:
            try:
                sid = int(subcategoria_id)
            except Exception:
                return jsonify({'error': 'subcategoria_id inválido'}), 400
            query = query.filter(Producto.subcategoria_id == sid)

        productos = query.all()
        productos_actualizados = 0

        for producto in productos:
            # Usar precio_venta, que puede ser None
            precio_original = float(producto.precio_venta or 0)

            if tipo_ajuste == 'monto':
                nuevo_precio = precio_original + valor_ajuste
            else:  # porcentaje
                nuevo_precio = precio_original * (1 + (valor_ajuste / 100.0))

            # Evitar precios negativos
            if nuevo_precio < 0:
                nuevo_precio = 0.0

            # Redondear a 2 decimales
            producto.precio_venta = round(nuevo_precio, 2)

            # Log para depuración
            print(f"Actualizando producto {producto.id}: {producto.nombre} - Precio anterior: ${precio_original} → Nuevo precio: ${producto.precio_venta}")
            productos_actualizados += 1

        # Guardar cambios
        db.session.commit()

        return jsonify({
            'mensaje': f'Se actualizaron los precios de {productos_actualizados} productos',
            'productos_actualizados': productos_actualizados
        }), 200

    except Exception as e:
        db.session.rollback()
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
