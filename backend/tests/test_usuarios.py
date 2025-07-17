import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Test para las rutas de Usuarios (puedes replicar la estructura para las demás rutas)
import pytest
from app import create_app
from database.db import db
from models.usuario import Usuario

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

def test_crear_usuario(client):
    response = client.post('/usuarios/', json={
        'nombre': 'Test',
        'apellido': 'User',
        'email': 'test@demo.com',
        'is_admin': True
    })
    assert response.status_code == 201
    data = response.get_json()
    assert 'id' in data

def test_listar_usuarios(client):
    # Crear usuario primero
    client.post('/usuarios/', json={
        'nombre': 'Test',
        'apellido': 'User',
        'email': 'test@demo.com',
        'is_admin': True
    })
    response = client.get('/usuarios/')
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_obtener_usuario(client):
    # Crear usuario primero
    res = client.post('/usuarios/', json={
        'nombre': 'Test',
        'apellido': 'User',
        'email': 'test@demo.com',
        'is_admin': True
    })
    user_id = res.get_json()['id']
    response = client.get(f'/usuarios/{user_id}')
    assert response.status_code == 200
    data = response.get_json()
    assert data['id'] == user_id

def test_actualizar_usuario(client):
    res = client.post('/usuarios/', json={
        'nombre': 'Test',
        'apellido': 'User',
        'email': 'test@demo.com',
        'is_admin': True
    })
    user_id = res.get_json()['id']
    response = client.put(f'/usuarios/{user_id}', json={'nombre': 'NuevoNombre'})
    assert response.status_code == 200
    data = response.get_json()
    assert data['msg'] == 'Usuario actualizado'

def test_eliminar_usuario(client):
    res = client.post('/usuarios/', json={
        'nombre': 'Test',
        'apellido': 'User',
        'email': 'test@demo.com',
        'is_admin': True
    })
    user_id = res.get_json()['id']
    response = client.delete(f'/usuarios/{user_id}')
    assert response.status_code == 200
    data = response.get_json()
    assert data['msg'] == 'Usuario eliminado (borrado lógico)'
