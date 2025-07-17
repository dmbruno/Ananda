import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Test para las rutas de Detalle de Ventas
import pytest
from app import create_app
from database.db import db
from models.usuario import Usuario
from models.cliente import Cliente
from models.categoria import Categoria
from models.producto import Producto
from models.venta import Venta
import datetime

@pytest.fixture
def app():
    app = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    with app.app_context():
        db.create_all()
        # Crear datos necesarios
        u = Usuario(nombre='Ana', apellido='García', is_admin=True, email='ana@demo.com')
        c = Cliente(nombre='Carlos', apellido='López', telefono='123456789', fecha_nacimiento=datetime.date(1990, 1, 1))
        cat = Categoria(nombre='Ropa')
        p = Producto(nombre='Remera Azul', talle='M', codigo='R001', color='Azul', marca='Nike', costo=2500, precio_venta=3500, stock_actual=10, categoria=cat)
        db.session.add_all([u, c, cat, p])
        db.session.commit()
        v = Venta(cliente=c, usuario=u, fecha_venta=datetime.date(2024, 1, 1), total=5000, metodo_pago='Efectivo', descuento=0)
        db.session.add(v)
        db.session.commit()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

def test_crear_detalle_venta(client):
    from models.venta import Venta
    from models.producto import Producto
    v = Venta.query.first()
    p = Producto.query.first()
    response = client.post('/detalle_ventas/', json={
        'venta_id': v.id,
        'producto_id': p.id,
        'cantidad': 2,
        'precio_unitario': 15.0,
        'subtotal': 30.0
    })
    assert response.status_code == 201
    data = response.get_json()
    assert 'id' in data

def test_listar_detalles_venta(client):
    from models.venta import Venta
    from models.producto import Producto
    v = Venta.query.first()
    p = Producto.query.first()
    client.post('/detalle_ventas/', json={
        'venta_id': v.id,
        'producto_id': p.id,
        'cantidad': 2,
        'precio_unitario': 2500
    })
    response = client.get('/detalle_ventas/')
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_obtener_detalle_venta(client):
    from models.venta import Venta
    from models.producto import Producto
    v = Venta.query.first()
    p = Producto.query.first()
    res = client.post('/detalle_ventas/', json={
        'venta_id': v.id,
        'producto_id': p.id,
        'cantidad': 2,
        'precio_unitario': 2500
    })
    detalle_id = res.get_json()['id']
    response = client.get(f'/detalle_ventas/{detalle_id}')
    assert response.status_code == 200
    data = response.get_json()
    assert data['id'] == detalle_id

def test_actualizar_detalle_venta(client):
    from models.venta import Venta
    from models.producto import Producto
    v = Venta.query.first()
    p = Producto.query.first()
    res = client.post('/detalle_ventas/', json={
        'venta_id': v.id,
        'producto_id': p.id,
        'cantidad': 2,
        'precio_unitario': 2500
    })
    detalle_id = res.get_json()['id']
    response = client.put(f'/detalle_ventas/{detalle_id}', json={'cantidad': 3})
    assert response.status_code == 200
    data = response.get_json()
    assert data['msg'] == 'Detalle de venta actualizado'

def test_eliminar_detalle_venta(client):
    from models.venta import Venta
    from models.producto import Producto
    v = Venta.query.first()
    p = Producto.query.first()
    res = client.post('/detalle_ventas/', json={
        'venta_id': v.id,
        'producto_id': p.id,
        'cantidad': 2,
        'precio_unitario': 2500
    })
    detalle_id = res.get_json()['id']
    response = client.delete(f'/detalle_ventas/{detalle_id}')
    assert response.status_code == 200
    data = response.get_json()
    assert data['msg'] == 'Detalle de venta eliminado'
