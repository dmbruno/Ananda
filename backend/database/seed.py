# Script para poblar la base de datos con datos ficticios
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from database.db import db
from models.usuario import Usuario
from models.cliente import Cliente
from models.categoria import Categoria
from models.producto import Producto
from models.venta import Venta
from models.detalle_venta import DetalleVenta
from models.subcategoria import Subcategoria
from datetime import datetime, timedelta

app = create_app()

with app.app_context():
    db.drop_all()
    db.create_all()

    # Usuarios
    u1 = Usuario(nombre='Ana', apellido='García', is_admin=True, email='ana@demo.com')
    u2 = Usuario(nombre='Luis', apellido='Pérez', is_admin=False, email='luis@demo.com')
    db.session.add_all([u1, u2])

    # Clientes (corregido: fecha_nacimiento como objeto date)
    c1 = Cliente(nombre='Carlos', apellido='López', telefono='123456789', fecha_nacimiento=datetime.strptime('1990-01-01', '%Y-%m-%d').date())
    c2 = Cliente(nombre='María', apellido='Martínez', telefono='987654321', fecha_nacimiento=datetime.strptime('1985-05-10', '%Y-%m-%d').date())
    db.session.add_all([c1, c2])

    # Clientes con cumpleaños en distintas fechas (hoy, mañana, pasado, etc)
    hoy = datetime.now().date()
    c1 = Cliente(nombre='Carlos', apellido='López', telefono='123456789', fecha_nacimiento=hoy)
    c2 = Cliente(nombre='María', apellido='Martínez', telefono='987654321', fecha_nacimiento=hoy + timedelta(days=1))
    c3 = Cliente(nombre='Juan', apellido='Perez', telefono='111111111', fecha_nacimiento=hoy + timedelta(days=2))
    c4 = Cliente(nombre='Ofelia', apellido='Ruiz', telefono='222222222', fecha_nacimiento=hoy + timedelta(days=3))
    c5 = Cliente(nombre='Daniela', apellido='Perez', telefono='333333333', fecha_nacimiento=hoy + timedelta(days=4))
    c6 = Cliente(nombre='Juana', apellido='Paz', telefono='444444444', fecha_nacimiento=hoy + timedelta(days=5))
    c7 = Cliente(nombre='Lucas', apellido='Gomez', telefono='555555555', fecha_nacimiento=hoy + timedelta(days=6))
    c8 = Cliente(nombre='Sofia', apellido='Mendez', telefono='666666666', fecha_nacimiento=hoy + timedelta(days=7))
    c9 = Cliente(nombre='Pedro', apellido='Sosa', telefono='777777777', fecha_nacimiento=hoy + timedelta(days=8))
    c10 = Cliente(nombre='Valeria', apellido='Rios', telefono='888888888', fecha_nacimiento=hoy + timedelta(days=9))
    c11 = Cliente(nombre='Martina', apellido='Diaz', telefono='999999999', fecha_nacimiento=hoy + timedelta(days=10))
    db.session.add_all([c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11])

    # Categorías reales
    categorias = [
        Categoria(nombre='Top & Blusas'),
        Categoria(nombre='Remeras & Musculosas'),
        Categoria(nombre='Vestidos'),
        Categoria(nombre='Pantalones'),
        Categoria(nombre='Camperas y Tapados'),
        Categoria(nombre='Buzos y Sweters')
    ]
    db.session.add_all(categorias)

    # Subcategorías (2 por cada categoría para facilitar pruebas)
    subcategorias = []
    for cat in categorias:
        for j in range(2):
            subcategorias.append(Subcategoria(nombre=f'{cat.nombre} Subcategoria {j+1}', categoria=cat, activo=True))
    db.session.add_all(subcategorias)

    # Productos: generar productos para cada subcategoría
    productos = []
    marcas = ['Nike', 'Adidas', 'Puma', 'Levis', 'Reebok']
    colores = ['Azul', 'Negro', 'Rojo', 'Blanco', 'Gris']
    talles = ['S', 'M', 'L', '38', '40', '42']
    for i, subcat in enumerate(subcategorias):
        cat = subcat.categoria
        for k in range(3):  # 3 productos por subcategoría
            nombre = f'Producto {cat.nombre}-{subcat.nombre}-{k+1}'
            talle = talles[(i + k) % len(talles)]
            codigo = f'P{i+1:03d}{k+1}'
            color = colores[(i + k) % len(colores)]
            marca = marcas[(i + k) % len(marcas)]
            costo = 2000 + ((i + k) * 100)
            precio_venta = costo + 1500
            stock_actual = 5 + ((i + k) % 10)
            productos.append(Producto(
                nombre=nombre,
                talle=talle,
                codigo=codigo,
                color=color,
                marca=marca,
                costo=costo,
                precio_venta=precio_venta,
                stock_actual=stock_actual,
                categoria=cat,
                subcategoria=subcat
            ))
    db.session.add_all(productos)

    # Venta y detalle
    v1 = Venta(cliente=c1, usuario=u1, fecha_venta=datetime.now(), total=9000, metodo_pago='FT', descuento=10)
    db.session.add(v1)
    db.session.flush()
    # Usar los primeros 6 productos para los detalles de venta inicial
    for i in range(6):
        prod = productos[i]
        cantidad = 1 + (i % 3)
        detalle = DetalleVenta(venta_id=v1.id, producto_id=prod.id, cantidad=cantidad, precio_unitario=prod.costo, subtotal=prod.costo*cantidad)
        db.session.add(detalle)

    # Ventas y detalles de los últimos 10 días (incluyendo todos los productos)
    metodos = ['FT', 'TC', 'TB']
    for i in range(10):
        fecha = datetime.now() - timedelta(days=9-i)
        metodo = metodos[i % 3]
        venta = Venta(cliente=c1, usuario=u1, fecha_venta=fecha, total=5000 + i*500, metodo_pago=metodo, descuento=5)
        db.session.add(venta)
        db.session.flush()
        for j, prod in enumerate(productos[:12]):  # Solo los primeros 12 productos para no generar demasiados detalles
            cantidad = 1 + ((i+j) % 3)  # 1 a 3 unidades
            detalle = DetalleVenta(venta_id=venta.id, producto_id=prod.id, cantidad=cantidad, precio_unitario=prod.costo, subtotal=prod.costo*cantidad)
            db.session.add(detalle)

    # Agregar ventas del día de hoy con todos los métodos de pago
    for metodo in metodos:
        venta = Venta(cliente=c1, usuario=u1, fecha_venta=datetime.now(), total=7000, metodo_pago=metodo, descuento=0)
        db.session.add(venta)
        db.session.flush()
        for prod in productos[:12]:
            detalle = DetalleVenta(venta_id=venta.id, producto_id=prod.id, cantidad=1, precio_unitario=prod.costo, subtotal=prod.costo)
            db.session.add(detalle)

    db.session.commit()
    print('Datos ficticios cargados correctamente.')
