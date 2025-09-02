import yagmail
import os
from datetime import datetime

class EmailService:
    def __init__(self):
        self.email_user = os.getenv('EMAIL_USER')
        self.email_password = os.getenv('EMAIL_PASSWORD')
        self.from_name = os.getenv('EMAIL_FROM_NAME', 'Ananda Sistema')
        
        if not self.email_user or not self.email_password:
            raise ValueError("EMAIL_USER y EMAIL_PASSWORD deben estar configurados en .env")
        
        # Cargar estilos CSS
        try:
            css_path = os.path.join(os.path.dirname(__file__), 'email_styles.css')
            with open(css_path, 'r', encoding='utf-8') as f:
                self.css_styles = f.read()
        except Exception:
            self.css_styles = ""  # Fallback si no se puede cargar
        
        try:
            self.yag = yagmail.SMTP(self.email_user, self.email_password)
        except Exception as e:
            print(f"Error al inicializar el servicio de email: {e}")
            raise

    def send_password_reset_email(self, to_email, reset_url, user_name=None):
        """Envía email de recuperación de contraseña"""
        try:
            subject = "🔐 Recuperación de Contraseña - Ananda Sistema"
            
            # Template HTML ultra compacto
            html_content = f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>{self.css_styles}</style></head>
<body><div class="container">
<div class="header"><h1>🔐 Ananda Sistema</h1><p>Recuperación de Contraseña</p></div>
<div class="content">
<div class="greeting">Hola{f", {user_name}" if user_name else ""},</div>
<div class="message">Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>Ananda Sistema</strong>.</div>
<div class="button-container"><a href="{reset_url}" class="reset-button">🔄 Restablecer mi Contraseña</a></div>
<div class="alternative-link"><strong>Si el botón no funciona, copia este enlace:</strong>{reset_url}</div>
<div class="warning"><strong>⚠️ Importante:</strong> Este enlace es válido por <strong>1 hora</strong> y solo puede usarse una vez.</div>
<div class="security-info"><strong>🛡️ Por tu seguridad:</strong>
<ul><li>Nunca compartas este enlace</li><li>Usa una contraseña fuerte</li><li>Verifica que estés en el sitio oficial</li></ul></div>
</div>
<div class="footer"><p><strong>Ananda Sistema</strong> - {datetime.now().strftime('%d/%m/%Y %H:%M')}</p></div>
</div></body></html>"""
            
            # Enviar el email
            self.yag.send(
                to=to_email,
                subject=subject,
                contents=html_content
            )
            
            print(f"✅ Email de recuperación enviado exitosamente a: {to_email}")
            return True
            
        except Exception as e:
            print(f"❌ Error al enviar email a {to_email}: {e}")
            return False

    def send_password_changed_notification(self, to_email, user_name=None):
        """Envía notificación de que la contraseña fue cambiada"""
        try:
            subject = "🔒 Contraseña Actualizada - Ananda Sistema"
            
            html_content = f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>{self.css_styles}</style></head>
<body><div class="container">
<div class="header"><h1>🔒 Ananda Sistema</h1><p>Contraseña Actualizada</p></div>
<div class="content">
<div class="success-icon">✅</div>
<h2>¡Contraseña Actualizada!</h2>
<p>Hola{f", {user_name}" if user_name else ""},</p>
<p>Tu contraseña de <strong>Ananda Sistema</strong> ha sido actualizada exitosamente.</p>
<div class="info-box"><strong>📅 Fecha:</strong> {datetime.now().strftime('%d/%m/%Y %H:%M')}<br><strong>📧 Cuenta:</strong> {to_email}</div>
<div class="warning-box"><strong>⚠️ ¿No fuiste tú?</strong> Si no realizaste este cambio, contacta inmediatamente con el administrador.</div>
</div>
<div class="footer"><p><strong>Ananda Sistema</strong> - {datetime.now().strftime('%d/%m/%Y %H:%M')}</p></div>
</div></body></html>"""
            
            self.yag.send(
                to=to_email,
                subject=subject,
                contents=html_content
            )
            
            print(f"✅ Notificación de cambio de contraseña enviada a: {to_email}")
            return True
            
        except Exception as e:
            print(f"❌ Error al enviar notificación a {to_email}: {e}")
            return False

    def test_connection(self):
        """Prueba la conexión con el servicio de email"""
        if not self.yag:
            return False, "Servicio no configurado"
        
        try:
            # Intentar enviar un email de prueba a la misma cuenta
            test_subject = "🧪 Test de Conexión - Ananda Sistema"
            test_content = f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>{self.css_styles}</style></head>
<body><div class="container">
<div class="header"><h1>🧪 Ananda Sistema</h1><p>Test de Conexión</p></div>
<div class="content">
<h2>✅ Test de Conexión Exitoso</h2>
<p>El servicio de email está funcionando correctamente.</p>
<div class="info-box"><strong>📅 Fecha:</strong> {datetime.now().strftime('%d/%m/%Y %H:%M')}</div>
</div>
<div class="footer"><p><strong>Ananda Sistema</strong></p></div>
</div></body></html>"""
            
            self.yag.send(
                to=self.email_user,
                subject=test_subject,
                contents=test_content
            )
            return True, "Conexión exitosa"
        except Exception as e:
            return False, str(e)