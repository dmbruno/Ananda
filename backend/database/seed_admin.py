from database.db import db
from models.usuario import Usuario

def main():
    nombre = "diego"
    apellido = "admin"
    email = "diego@gmail.com"
    password = "admin123"
    is_admin = True
    activo = True

    # ¿Ya existe este usuario?
    existing = Usuario.query.filter(Usuario.email == email).first()
    if existing:
        print("El usuario admin ya existe.")
        return

    # Crear usuario
    usuario = Usuario(
        nombre=nombre,
        apellido=apellido,
        email=email,
        is_admin=is_admin,
        activo=activo
    )
    usuario.set_password(password)  # Hashea la clave

    db.session.add(usuario)
    db.session.commit()
    print("Usuario admin creado exitosamente.")

if __name__ == "__main__":
    main()