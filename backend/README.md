# Ananda — Backend (Flask + SQLAlchemy)

Este README explica cómo configurar, desarrollar y desplegar la parte backend del proyecto Ananda.

Resumen
- Framework: Flask
- ORM: SQLAlchemy
- Migrations: Flask-Migrate (opcional pero recomendado)
- DB local por defecto: SQLite (`backend/instance/ananda.db`)
- Producción: usar PostgreSQL (ej. Render)

Requisitos
- Python 3.10+ (recomendado 3.10 - 3.12)
- pip
- Virtualenv o similar

Instalación y entorno de desarrollo

1) Crear y activar entorno virtual

```bash
python3 -m venv .venv
source .venv/bin/activate
```

2) Instalar dependencias

```bash
pip install -r requirements.txt
```

3) Variables de entorno

Crea un archivo `.env` en `backend/` (no lo subas al repositorio). Ejemplo mínimo:

```env
DATABASE_URL=sqlite:////ABSOLUTE/PATH/TO/your-project/backend/instance/ananda.db
SECRET_KEY=tu_clave_secreta
FLASK_ENV=development
FLASK_DEBUG=True
# EMAIL_* y otras variables según tu .env
```

Nota: si `DATABASE_URL` no está definida, la app usa por defecto `backend/instance/ananda.db` (vía `app.instance_path`).

4) Asegurar que `instance/` exista

El `create_app()` del proyecto crea `app.instance_path` automáticamente con `os.makedirs(..., exist_ok=True)`. Si necesitas crear manualmente:

```bash
mkdir -p backend/instance
```

Arrancar la app localmente

```bash
# desde la raíz del repo
export PYTHONPATH=backend
python3 -m backend.app   # o: python3 backend/app.py
# la app por defecto corre en http://0.0.0.0:5001
```

(En algunos setups el entrypoint es `flask run`. El proyecto actual inicializa la app en `backend/app.py`.)

Base de datos y migraciones

- Para crear tablas vacías (según modelos):

```bash
PYTHONPATH=backend python3 - <<'PY'
from app import create_app
from database.db import db
app = create_app()
with app.app_context():
    db.create_all()
    print('Tablas creadas en:', app.config['SQLALCHEMY_DATABASE_URI'])
PY
```

- Recomendado: usar Flask-Migrate para control de esquema y despliegues.

Instalar herramientas (si no están en `requirements.txt`):

```bash
pip install Flask-Migrate psycopg2-binary
```

Inicializar y usar migrations (solo la primera vez)

```bash
export PYTHONPATH=backend
export FLASK_APP=app:create_app
flask db init
flask db migrate -m "initial"
flask db upgrade
```

(Para aplicar migraciones en producción: incluir `flask db upgrade` en el script de deploy/release.)

Seed (datos de desarrollo)

- El script `backend/database/seed.py` crea y puebla tablas. Atención: hace `db.drop_all()`.
- NO ejecutes `seed.py` en producción salvo que quieras re-crear y poblar la base.

Ejecutar seed localmente:

```bash
PYTHONPATH=backend python3 backend/database/seed.py
```

Migrar datos SQLite -> PostgreSQL (opcional)

Si necesitás mover datos desde la DB SQLite de desarrollo a Postgres en producción, las opciones recomendadas son:
- `pgloader` (simple y robusto)
- exportar `.dump` y adaptarlo manualmente (más trabajo)

Ejemplo con pgloader (instalarlo con brew / apt según OS):

```bash
pgloader sqlite:///path/to/backend/instance/ananda.db postgresql://user:pass@host:port/dbname
```

Producción (Render u otros)

- Provisioná una base Postgres y pon `DATABASE_URL` en las variables de entorno del servicio.
- Asegurate que `SECRET_KEY`, `EMAIL_*` y otros secretos estén en las variables del entorno y no en el repo.
- En el proceso de deploy ejecutar:
  - `flask db upgrade` para aplicar migraciones
  - no ejecutar `seed.py` en producción a menos que quieras poblar datos de prueba

Recomendaciones de seguridad

- Nunca commitees `.env` con credenciales reales.
- Usar `FLASK_DEBUG=False` en producción.
- Mantener `SECRET_KEY` seguro y rotarlo si se filtra.

Comandos útiles

- Crear entorno e instalar:
  - `python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt`
- Crear tablas vacías: ver comando `db.create_all()` en la sección "Base de datos y migraciones".
- Ejecutar seed (desarrollo): `PYTHONPATH=backend python3 backend/database/seed.py`
- Ejecutar tests rápidos (script `test_caja.py`): `python3 backend/test_caja.py`

Estructura relevante

```
/backend
  /database
    db.py            # instancia de SQLAlchemy
    seed.py          # script de poblado (dev)
  /models            # modelos SQLAlchemy
  /routes            # blueprints
  app.py             # create_app + configuración
  requirements.txt
  .env (local, no subir)
```

Depuración y chequeos

- Ver la URI efectiva de la DB usada por la app:

```bash
PYTHONPATH=backend python3 - <<'PY'
from app import create_app
app = create_app()
print('SQLALCHEMY_DATABASE_URI =', app.config.get('SQLALCHEMY_DATABASE_URI'))
print('instance_path =', app.instance_path)
PY
```

- Inspeccionar archivo sqlite:

```bash
sqlite3 backend/instance/ananda.db ".tables"
sqlite3 backend/instance/ananda.db ".schema"
```

Contribuir

- Crear ramas con nombre claro: `feature/...`, `fix/...`.
- PR hacia `main` con descripción y pasos para reproducir.

Contacto

- Para dudas sobre la API o despliegue, abrí una issue o contactame.

---

README generado por GitHub Copilot — adaptalo si necesitás más detalle sobre despliegue en Render u otros proveedores.
