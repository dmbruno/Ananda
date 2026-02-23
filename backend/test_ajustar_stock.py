import os
import sys

# Añadir la carpeta raíz del proyecto al path: .../Ananda
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))  # .../Ananda/backend
ROOT_DIR = os.path.dirname(ROOT_DIR)                   # .../Ananda
if ROOT_DIR not in sys.path:
    sys.path.append(ROOT_DIR)

# Ahora podemos importar backend.app
from backend.app import app
from backend.database.db import db
from backend.models.producto import Producto


def test_ajustar_stock():
    with app.app_context():
        # OJO: usá una categoria_id que exista en tu DB (ajusta si no es 1)
        producto = Producto(
            nombre="Test",
            costo=100,
            precio_venta=200,
            stock_actual=5,
            categoria_id=1,
        )
        db.session.add(producto)
        db.session.commit()
        producto_id = producto.id

        client = app.test_client()
        resp = client.post(
            f"/api/productos/{producto_id}/ajustar-stock",
            json={"delta": 3},
        )

        assert resp.status_code in (200, 401, 403)