import sys
import os

# Agregar el directorio raíz al path para poder importar desde ahí
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.db import db
from models.caja import Caja
from models.usuario import Usuario

# Script para arreglar el estado de las cajas
def arreglar_cajas():
    """Arregla el estado de las cajas para asegurar que estén en un estado válido"""
    try:
        # Obtener todas las cajas
        cajas = Caja.query.all()
        
        for caja in cajas:
            # Asegurarse de que el estado es 'abierta', 'cerrada' o 'controlada'
            if caja.estado not in ['abierta', 'cerrada', 'controlada']:
                # Determinar el estado basado en los campos fecha
                if caja.fecha_control:
                    caja.estado = 'controlada'
                elif caja.fecha_cierre:
                    caja.estado = 'cerrada'
                else:
                    caja.estado = 'abierta'
                
                print(f"Corrigiendo caja #{caja.id}: estado actualizado a '{caja.estado}'")
        
        # Guardar los cambios
        db.session.commit()
        print("Correcciones aplicadas y guardadas en la base de datos")
        
    except Exception as e:
        db.session.rollback()
        print(f"Error al arreglar cajas: {str(e)}")

if __name__ == "__main__":
    from app import app
    with app.app_context():
        arreglar_cajas()
