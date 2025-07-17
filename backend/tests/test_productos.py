import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Test para las rutas de Productos
import pytest
from app import create_app
from database.db import db
from models.categoria import Categoria

@pytest.fixture
def app():
    app = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    with app.app_context():
        db.create_all()
        # Crear una categoría para los productos
        cat = Categoria(nombre='Ropa')
        db.session.add(cat)
        db.session.commit()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

def test_crear_producto(client):
    # Obtener id de la categoría
    from models.categoria import Categoria
    cat = Categoria.query.first()
    response = client.post('/productos/', json={
        'nombre': 'Remera Azul',
        'talle': 'M',
        'codigo': 'R001',
        'color': 'Azul',
        'marca': 'Nike',
        'costo': 2500,
        'stock_actual': 10,
        'categoria_id': cat.id,
        'precio_venta': 3000
    })
    assert response.status_code == 201
    data = response.get_json()
    assert 'id' in data

def test_listar_productos(client):
    from models.categoria import Categoria
    cat = Categoria.query.first()
    client.post('/productos/', json={
        'nombre': 'Remera Azul',
        'talle': 'M',
        'codigo': 'R001',
        'color': 'Azul',
        'marca': 'Nike',
        'costo': 2500,
        'stock_actual': 10,
        'categoria_id': cat.id,
        'precio_venta': 3000
    })
    response = client.get('/productos/')
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_obtener_producto(client):
    from models.categoria import Categoria
    cat = Categoria.query.first()
    res = client.post('/productos/', json={
        'nombre': 'Remera Azul',
        'talle': 'M',
        'codigo': 'R001',
        'color': 'Azul',
        'marca': 'Nike',
        'costo': 2500,
        'stock_actual': 10,
        'categoria_id': cat.id,
        'precio_venta': 3000
    })
    producto_id = res.get_json()['id']
    response = client.get(f'/productos/{producto_id}')
    assert response.status_code == 200
    data = response.get_json()
    assert data['id'] == producto_id

def test_actualizar_producto(client):
    from models.categoria import Categoria
    cat = Categoria.query.first()
    res = client.post('/productos/', json={
        'nombre': 'Remera Azul',
        'talle': 'M',
        'codigo': 'R001',
        'color': 'Azul',
        'marca': 'Nike',
        'costo': 2500,
        'stock_actual': 10,
        'categoria_id': cat.id,
        'precio_venta': 3000
    })
    producto_id = res.get_json()['id']
    response = client.put(f'/productos/{producto_id}', json={'nombre': 'Remera Roja'})
    assert response.status_code == 200
    data = response.get_json()
    assert data['msg'] == 'Producto actualizado'

def test_eliminar_producto(client):
    from models.categoria import Categoria
    cat = Categoria.query.first()
    res = client.post('/productos/', json={
        'nombre': 'Remera Azul',
        'talle': 'M',
        'codigo': 'R001',
        'color': 'Azul',
        'marca': 'Nike',
        'costo': 2500,
        'stock_actual': 10,
        'categoria_id': cat.id,
        'precio_venta': 3000
    })
    producto_id = res.get_json()['id']
    response = client.delete(f'/productos/{producto_id}')
    assert response.status_code == 200
    data = response.get_json()
    assert data['msg'] in ['Producto eliminado', 'Producto eliminado (borrado lógico)']
