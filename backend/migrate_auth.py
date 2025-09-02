#!/usr/bin/env python3
"""
Script para migrar la base de datos y crear un usuario administrador inicial.
Ejecutar este script después de actualizar el modelo Usuario para agregar el campo password_hash.
"""

import sys
import os

# Agregar el directorio raíz al path para poder importar los módulos
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from database.db import db
from models.usuario import Usuario
from sqlalchemy import text

def migrate_database():
    """Actualizar la base de datos para agregar el campo password_hash"""
    app = create_app()
    
    with app.app_context():
        try:
            # Verificar si la columna password_hash ya existe
            with db.engine.connect() as conn:
                result = conn.execute(text("PRAGMA table_info(usuarios)"))
                columns = [row[1] for row in result]
                
                if 'password_hash' not in columns:
                    print("🔄 Agregando campo password_hash a la tabla usuarios...")
                    # Agregar la columna password_hash
                    conn.execute(text("ALTER TABLE usuarios ADD COLUMN password_hash VARCHAR(255)"))
                    conn.commit()
                    print("✅ Campo password_hash agregado exitosamente")
                else:
                    print("✅ El campo password_hash ya existe en la tabla usuarios")
                
        except Exception as e:
            print(f"❌ Error al agregar campo password_hash: {str(e)}")
            return False
    
    return True

def create_admin_user():
    """Crear un usuario administrador inicial"""
    app = create_app()
    
    with app.app_context():
        try:
            # Verificar si ya existe un usuario administrador
            admin_exists = Usuario.query.filter_by(email='admin@ananda.com').first()
            
            if admin_exists:
                print("✅ Ya existe un usuario administrador")
                return True
            
            print("👤 Creando usuario administrador inicial...")
            
            # Crear usuario administrador
            admin_user = Usuario(
                nombre='Admin',
                apellido='Sistema',
                email='admin@ananda.com',
                is_admin=True,
                activo=True
            )
            
            # Establecer contraseña (cambiar por una contraseña segura)
            admin_user.set_password('admin123')  # Contraseña temporal
            
            db.session.add(admin_user)
            db.session.commit()
            
            print("✅ Usuario administrador creado exitosamente")
            print("📧 Email: admin@ananda.com")
            print("🔑 Contraseña: admin123")
            print("⚠️  IMPORTANTE: Cambia esta contraseña después del primer login")
            
            return True
            
        except Exception as e:
            print(f"❌ Error al crear usuario administrador: {str(e)}")
            db.session.rollback()
            return False

def main():
    """Función principal"""
    print("🚀 Iniciando migración de base de datos...")
    
    # Migrar base de datos
    if not migrate_database():
        print("❌ Falló la migración de la base de datos")
        return
    
    # Crear usuario administrador
    if not create_admin_user():
        print("❌ Falló la creación del usuario administrador")
        return
    
    print("\n🎉 Migración completada exitosamente!")
    print("\n📋 Resumen:")
    print("   • Campo password_hash agregado a la tabla usuarios")
    print("   • Usuario administrador creado")
    print("   • Sistema de autenticación listo para usar")
    print("\n🔐 Para acceder al sistema:")
    print("   Email: admin@ananda.com")
    print("   Contraseña: admin123")

if __name__ == '__main__':
    main()
