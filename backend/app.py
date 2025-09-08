# Punto de entrada de la aplicación Flask
from flask import Flask, send_from_directory
from dotenv import load_dotenv
import os

# Cargar variables de entorno
load_dotenv()

from database.db import db
from routes.usuario import usuarios_bp
from routes.cliente import clientes_bp
from routes.categoria import categorias_bp
from routes.producto import productos_bp
from routes.venta import ventas_bp
from routes.detalle_venta import detalle_ventas_bp
from routes.caja import caja_bp
from routes.subcategoria import subcategorias_bp
from routes.auth import auth_bp
from routes.ajuste_precios import ajuste_precios_bp

from flask_cors import CORS
from flask_jwt_extended import JWTManager

def create_app():
    app = Flask(__name__)
    # Servir archivos de la carpeta uploads
    @app.route('/uploads/<filename>')
    def uploaded_file(filename):
        return send_from_directory('uploads', filename)
    # Asegurar que el directorio instance exista antes de usar app.instance_path
    os.makedirs(app.instance_path, exist_ok=True)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
        'DATABASE_URL',
        f"sqlite:///{os.path.join(app.instance_path, 'ananda.db')}"
   )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # JWT Configuration
    app.config['JWT_SECRET_KEY'] = os.getenv('SECRET_KEY', 'tu_clave_secreta_muy_segura_aqui_123456789')
    app.config['JWT_TOKEN_LOCATION'] = ['headers']
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 3600  # 1 hour
    
    # Initialize extensions
    jwt = JWTManager(app)
    db.init_app(app)



    # Registrar blueprints
    app.register_blueprint(usuarios_bp)
    app.register_blueprint(clientes_bp)
    app.register_blueprint(categorias_bp)
    app.register_blueprint(productos_bp)
    app.register_blueprint(ventas_bp)
    app.register_blueprint(detalle_ventas_bp)
    app.register_blueprint(caja_bp, url_prefix="/api/caja")
    app.register_blueprint(subcategorias_bp)
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(ajuste_precios_bp, url_prefix='/api/productos')
    
    # Configure CORS with more specific settings - incluye puerto 5174
    CORS(app, 
         resources={r"/api/*": {"origins": ["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://localhost:5001", "http://127.0.0.1:5001","https://ananda-front.onrender.com" ]}}, 
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

    return app

if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        db.create_all()  # Crea las tablas si no existen
    app.run(debug=True, host="0.0.0.0", port=5001)
