import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Test para las rutas de Categorías
import pytest
from app import create_app
from database.db import db

@pytest.fixture
def app():
    app = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

def test_crear_categoria(client):
    response = client.post('/categorias/', json={
        'nombre': 'Ropa'
    })
    assert response.status_code == 201
    data = response.get_json()
    assert 'id' in data

def test_listar_categorias(client):
    client.post('/categorias/', json={
        'nombre': 'Ropa'
    })
    response = client.get('/categorias/')
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_obtener_categoria(client):
    res = client.post('/categorias/', json={
        'nombre': 'Ropa'
    })
    categoria_id = res.get_json()['id']
    response = client.get(f'/categorias/{categoria_id}')
    assert response.status_code == 200
    data = response.get_json()
    assert data['id'] == categoria_id

def test_actualizar_categoria(client):
    res = client.post('/categorias/', json={
        'nombre': 'Ropa'
    })
    categoria_id = res.get_json()['id']
    response = client.put(f'/categorias/{categoria_id}', json={'nombre': 'Calzado'})
    assert response.status_code == 200
    data = response.get_json()
    assert data['msg'] == 'Categoría actualizada'

def test_eliminar_categoria(client):
    res = client.post('/categorias/', json={
        'nombre': 'Ropa'
    })
    categoria_id = res.get_json()['id']
    response = client.delete(f'/categorias/{categoria_id}')
    assert response.status_code == 200
    data = response.get_json()
    assert data['msg'] == 'Categoría eliminada (borrado lógico)'
