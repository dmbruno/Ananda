"""Seed script to create an admin user in the production DB.

Usage:
  # use defaults
  PYTHONPATH=backend python3 backend/database/seed_admin.py

  # or override using environment variables
  ADMIN_USERNAME=admin ADMIN_EMAIL=admin@gmail.com ADMIN_PASSWORD=Admin123 PYTHONPATH=backend python3 backend/database/seed_admin.py

The script will use the app configuration (DATABASE_URL) so it will create the user in the DB defined by your environment.
"""

from app import create_app
from database.db import db
from models.usuario import Usuario
from werkzeug.security import generate_password_hash
import os
import sys


def main():
    # Read defaults (can be overridden via environment variables)
    username = os.environ.get('ADMIN_USERNAME', 'admin')
    email = os.environ.get('ADMIN_EMAIL', 'admin@gmail.com')
    password = os.environ.get('ADMIN_PASSWORD', 'Admin123')
    nombre = os.environ.get('ADMIN_NOMBRE', 'Administrador')
    rol = os.environ.get('ADMIN_ROL', 'admin')

    app = create_app()
    with app.app_context():
        # Try to find existing user by username or email
        existing = Usuario.query.filter((Usuario.username == username) | (Usuario.email == email)).first()
        if existing:
            print(f"Admin user already exists: username={existing.username}, email={existing.email}")
            return 0

        # Create user
        password_hash = generate_password_hash(password)
        admin = Usuario(
            username=username,
            email=email,
            password_hash=password_hash,
            nombre=nombre,
            rol=rol,
        )
        db.session.add(admin)
        db.session.commit()
        print(f"Admin user created: username={admin.username}, email={admin.email}")
        return 0


if __name__ == '__main__':
    exit(main())
