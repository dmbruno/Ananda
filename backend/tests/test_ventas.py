import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Test para las rutas de Ventas
import pytest
from app import create_app
from database.db import db
from models.usuario import Usuario
from models.cliente import Cliente
from models.categoria import Categoria
from models.producto import Producto
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
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

def test_crear_venta(client):
    from models.usuario import Usuario
    from models.cliente import Cliente
    from models.producto import Producto
    u = Usuario.query.first()
    c = Cliente.query.first()
    p = Producto.query.first()
    response = client.post('/ventas/', json={
        'cliente_id': c.id,
        'usuario_id': u.id,
        'fecha': datetime.date.today().isoformat(),
        'metodo_pago': 'Efectivo',
        'descuento': 10,
        'total': 2500*2*0.9,
        'detalles': [
            {'producto_id': p.id, 'cantidad': 2, 'precio_unitario': 2500}
        ]
    })
    assert response.status_code == 201
    data = response.get_json()
    assert 'id' in data
    assert data['total'] == 2500*2*0.9

def test_listar_ventas(client):
    from models.usuario import Usuario
    from models.cliente import Cliente
    from models.producto import Producto
    u = Usuario.query.first()
    c = Cliente.query.first()
    p = Producto.query.first()
    client.post('/ventas/', json={
        'cliente_id': c.id,
        'usuario_id': u.id,
        'fecha': datetime.date.today().isoformat(),
        'metodo_pago': 'Efectivo',
        'descuento': 10,
        'total': 2500*2*0.9,
        'detalles': [
            {'producto_id': p.id, 'cantidad': 2, 'precio_unitario': 2500}
        ]
    })
    response = client.get('/ventas/')
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_obtener_venta(client):
    from models.usuario import Usuario
    from models.cliente import Cliente
    from models.producto import Producto
    u = Usuario.query.first()
    c = Cliente.query.first()
    p = Producto.query.first()
    res = client.post('/ventas/', json={
        'cliente_id': c.id,
        'usuario_id': u.id,
        'fecha': datetime.date.today().isoformat(),
        'metodo_pago': 'Efectivo',
        'descuento': 10,
        'total': 2500*2*0.9,
        'detalles': [
            {'producto_id': p.id, 'cantidad': 2, 'precio_unitario': 2500}
        ]
    })
    venta_id = res.get_json()['id']
    response = client.get(f'/ventas/{venta_id}')
    assert response.status_code == 200
    data = response.get_json()
    assert data['id'] == venta_id

def test_eliminar_venta(client):
    from models.usuario import Usuario
    from models.cliente import Cliente
    from models.producto import Producto
    u = Usuario.query.first()
    c = Cliente.query.first()
    p = Producto.query.first()
    res = client.post('/ventas/', json={
        'cliente_id': c.id,
        'usuario_id': u.id,
        'fecha': datetime.date.today().isoformat(),
        'metodo_pago': 'Efectivo',
        'descuento': 10,
        'total': 2500*2*0.9,
        'detalles': [
            {'producto_id': p.id, 'cantidad': 2, 'precio_unitario': 2500}
        ]
    })
    venta_id = res.get_json()['id']
    response = client.delete(f'/ventas/{venta_id}')
    assert response.status_code == 200
    data = response.get_json()
    assert data['msg'] == 'Venta eliminada'
