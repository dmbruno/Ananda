from app import create_app
from database.db import db
from models.caja import Caja
from models.usuario import Usuario
from datetime import datetime

# Crea la aplicación y el contexto
app = create_app()

def test_abrir_caja():
    """Test para abrir una caja directamente en la base de datos"""
    try:
        with app.app_context():
            # Verificar si hay usuario con ID 1
            usuario = Usuario.query.get(1)
            if not usuario:
                print("No hay usuario con ID 1. Creando usuario de prueba...")
                nuevo_usuario = Usuario(
                    nombre="Admin",
                    email="admin@test.com",
                    password="admin123",
                    rol="admin"
                )
                db.session.add(nuevo_usuario)
                db.session.commit()
                usuario_id = nuevo_usuario.id
                print(f"Usuario creado con ID {usuario_id}")
            else:
                usuario_id = usuario.id
                print(f"Usuario existente con ID {usuario_id}")
            
            # Verificar que no haya cajas abiertas
            caja_abierta = Caja.query.filter_by(estado='abierta').first()
            if caja_abierta:
                print(f"Ya hay una caja abierta con ID {caja_abierta.id}")
                print(f"Cerrando la caja abierta...")
                caja_abierta.estado = 'cerrada'
                caja_abierta.fecha_cierre = datetime.utcnow()
                db.session.commit()
                print("Caja cerrada.")

            # Crear nueva caja
            nueva_caja = Caja(
                monto_inicial=100.0,
                usuario_apertura_id=usuario_id,
                estado='abierta',
                fecha_apertura=datetime.utcnow()
            )
            
            # Agregar a la base de datos
            db.session.add(nueva_caja)
            db.session.commit()
            
            print(f"Caja creada exitosamente con ID: {nueva_caja.id}")
            print(f"Detalles de la caja: {nueva_caja.to_dict()}")
            
            return True
    except Exception as e:
        import traceback
        print(f"ERROR: {e}")
        print(traceback.format_exc())
        return False

# Ejecutar el test
if __name__ == "__main__":
    success = test_abrir_caja()
    print(f"Test {'exitoso' if success else 'fallido'}")
