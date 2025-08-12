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
            nombre = f'Producto {k+1}'
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
                subcategoria=subcat,
                temporada='Primavera-Verano',  # Temporada ficticia
                fecha_ingreso=datetime.now().strftime('%Y-%m-%d'),  # Fecha de ingreso actual
                imagen_url=f'https://picsum.photos/seed/{i*10+k}/100'
            ))
    db.session.add_all(productos)



    # Generar ventas distribuidas en los últimos 60 días con datos variados y realistas
    import random
    metodos = ['FT', 'TC', 'TB']
    clientes = Cliente.query.all()
    base_fecha = datetime.now()
    dias_a_generar = 60
    ventas_por_dia = 4
    productos_ids = [p.id for p in productos]
    for dia in range(dias_a_generar):
        fecha_venta = base_fecha - timedelta(days=dia)
        for v in range(ventas_por_dia):
            cliente = random.choice(clientes)
            metodo = random.choice(metodos)
            # Elegir entre 1 y 3 productos distintos para la venta
            prods_vendidos = random.sample(productos, k=random.randint(1, 3))
            total_venta = 0
            detalles = []
            for prod in prods_vendidos:
                cantidad = random.randint(1, 4)
                subtotal = prod.precio_venta * cantidad
                total_venta += subtotal
                detalles.append((prod.id, prod.precio_venta, cantidad, subtotal))
            # Pequeño descuento aleatorio en algunas ventas (como porcentaje)
            descuento = 0
            if random.random() < 0.15:
                # Descuento entre 5% y 20%
                descuento = random.randint(5, 20)
                descuento_valor = total_venta * (descuento / 100)
                total_venta = max(0, total_venta - descuento_valor)
            venta = Venta(cliente=cliente, usuario=u1, fecha_venta=fecha_venta, total=total_venta, metodo_pago=metodo, descuento=descuento)
            db.session.add(venta)
            db.session.flush()
            for prod_id, precio_unitario, cantidad, subtotal in detalles:
                detalle = DetalleVenta(venta_id=venta.id, producto_id=prod_id, cantidad=cantidad, precio_unitario=precio_unitario, subtotal=subtotal)
                db.session.add(detalle)

    db.session.commit()
    print('Datos ficticios cargados correctamente.')
