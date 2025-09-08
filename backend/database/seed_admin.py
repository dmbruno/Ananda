from backend.app import create_app
from backend.models.usuario import Usuario
from backend.database.db import db

def main():
    nombre = "diego"
    apellido = "admin"
    email = "diego@gmail.com"
    password = "admin123"
    is_admin = True
    activo = True

    existing = Usuario.query.filter(Usuario.email == email).first()
    if existing:
        print("El usuario admin ya existe.")
        return

    usuario = Usuario(
        nombre=nombre,
        apellido=apellido,
        email=email,
        is_admin=is_admin,
        activo=activo
    )
    usuario.set_password(password)
    db.session.add(usuario)
    db.session.commit()
    print("Usuario admin creado exitosamente.")

if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        main()