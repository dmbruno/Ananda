import sys
import os
import datetime
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Test para las rutas de Clientes
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

def test_crear_cliente(client):
    response = client.post('/clientes/', json={
        'nombre': 'Cliente',
        'apellido': 'Demo',
        'telefono': '123456',
        'fecha_nacimiento': datetime.date(2000, 1, 1).isoformat()
    })
    assert response.status_code == 201
    data = response.get_json()
    assert 'id' in data

def test_listar_clientes(client):
    client.post('/clientes/', json={
        'nombre': 'Cliente',
        'apellido': 'Demo',
        'telefono': '123456',
        'fecha_nacimiento': datetime.date(2000, 1, 1).isoformat()
    })
    response = client.get('/clientes/')
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_obtener_cliente(client):
    res = client.post('/clientes/', json={
        'nombre': 'Cliente',
        'apellido': 'Demo',
        'telefono': '123456',
        'fecha_nacimiento': datetime.date(2000, 1, 1).isoformat()
    })
    cliente_id = res.get_json()['id']
    response = client.get(f'/clientes/{cliente_id}')
    assert response.status_code == 200
    data = response.get_json()
    assert data['id'] == cliente_id

def test_actualizar_cliente(client):
    res = client.post('/clientes/', json={
        'nombre': 'Cliente',
        'apellido': 'Demo',
        'telefono': '123456',
        'fecha_nacimiento': datetime.date(2000, 1, 1).isoformat()
    })
    cliente_id = res.get_json()['id']
    response = client.put(f'/clientes/{cliente_id}', json={'nombre': 'NuevoNombre'})
    assert response.status_code == 200
    data = response.get_json()
    assert data['msg'] == 'Cliente actualizado'

def test_eliminar_cliente(client):
    res = client.post('/clientes/', json={
        'nombre': 'Cliente',
        'apellido': 'Demo',
        'telefono': '123456',
        'fecha_nacimiento': datetime.date(2000, 1, 1).isoformat()
    })
    cliente_id = res.get_json()['id']
    response = client.delete(f'/clientes/{cliente_id}')
    assert response.status_code == 200
    data = response.get_json()
    # Ajusta el mensaje según el mensaje real de tu backend
    assert data['msg'] in ['Cliente eliminado', 'Cliente eliminado (borrado lógico)']
