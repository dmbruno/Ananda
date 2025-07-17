# Punto de entrada de la aplicación Flask
from flask import Flask
from database.db import db
from routes.usuario import usuarios_bp
from routes.cliente import clientes_bp
from routes.categoria import categorias_bp
from routes.producto import productos_bp
from routes.venta import ventas_bp
from routes.detalle_venta import detalle_ventas_bp

from routes.subcategoria import subcategorias_bp

from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///ananda.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)

    # Registrar blueprints
    app.register_blueprint(usuarios_bp)
    app.register_blueprint(clientes_bp)
    app.register_blueprint(categorias_bp)
    app.register_blueprint(productos_bp)
    app.register_blueprint(ventas_bp)
    app.register_blueprint(detalle_ventas_bp)
    
    app.register_blueprint(subcategorias_bp)
    
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    return app

if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        db.create_all()  # Crea las tablas si no existen
    app.run(debug=True, host="0.0.0.0", port=5001)
