CREATE TABLE usuarios (
	id INTEGER NOT NULL, 
	nombre VARCHAR(50) NOT NULL, 
	apellido VARCHAR(50) NOT NULL, 
	is_admin BOOLEAN, 
	email VARCHAR(120) NOT NULL, 
	activo BOOLEAN, 
	PRIMARY KEY (id), 
	UNIQUE (email)
);
CREATE TABLE clientes (
	id INTEGER NOT NULL, 
	nombre VARCHAR(50) NOT NULL, 
	apellido VARCHAR(50) NOT NULL, 
	telefono VARCHAR(20), 
	fecha_nacimiento DATE, 
	activo BOOLEAN, 
	PRIMARY KEY (id)
);
CREATE TABLE categorias (
	id INTEGER NOT NULL, 
	nombre VARCHAR(50) NOT NULL, 
	activo BOOLEAN, 
	PRIMARY KEY (id)
);
CREATE TABLE subcategorias (
	id INTEGER NOT NULL, 
	nombre VARCHAR(50) NOT NULL, 
	categoria_id INTEGER NOT NULL, 
	activo BOOLEAN, 
	PRIMARY KEY (id), 
	FOREIGN KEY(categoria_id) REFERENCES categorias (id)
);
CREATE TABLE ventas (
	id INTEGER NOT NULL, 
	cliente_id INTEGER NOT NULL, 
	usuario_id INTEGER NOT NULL, 
	fecha_venta DATETIME NOT NULL, 
	total FLOAT NOT NULL, 
	metodo_pago VARCHAR(30) NOT NULL, 
	descuento FLOAT, 
	PRIMARY KEY (id), 
	FOREIGN KEY(cliente_id) REFERENCES clientes (id), 
	FOREIGN KEY(usuario_id) REFERENCES usuarios (id)
);
CREATE TABLE productos (
	id INTEGER NOT NULL, 
	nombre VARCHAR(50) NOT NULL, 
	talle VARCHAR(10), 
	codigo VARCHAR(30), 
	color VARCHAR(30), 
	marca VARCHAR(30), 
	stock_minimo INTEGER, 
	costo FLOAT NOT NULL, 
	precio_venta FLOAT NOT NULL, 
	imagen_url VARCHAR(255), 
	stock_actual INTEGER, 
	categoria_id INTEGER NOT NULL, 
	subcategoria_id INTEGER, 
	activo BOOLEAN, 
	temporada VARCHAR(50), 
	fecha_ingreso VARCHAR(50), 
	PRIMARY KEY (id), 
	UNIQUE (codigo), 
	FOREIGN KEY(categoria_id) REFERENCES categorias (id), 
	FOREIGN KEY(subcategoria_id) REFERENCES subcategorias (id)
);
CREATE TABLE detalle_ventas (
	id INTEGER NOT NULL, 
	venta_id INTEGER NOT NULL, 
	producto_id INTEGER NOT NULL, 
	cantidad INTEGER NOT NULL, 
	precio_unitario FLOAT NOT NULL, 
	subtotal FLOAT NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(venta_id) REFERENCES ventas (id), 
	FOREIGN KEY(producto_id) REFERENCES productos (id)
);
CREATE TABLE cajas (
	id INTEGER NOT NULL, 
	fecha_apertura DATETIME NOT NULL, 
	fecha_cierre DATETIME, 
	monto_inicial FLOAT NOT NULL, 
	monto_final FLOAT, 
	monto_sistema FLOAT, 
	diferencia FLOAT, 
	usuario_apertura_id INTEGER NOT NULL, 
	usuario_cierre_id INTEGER, 
	estado VARCHAR(20) NOT NULL, 
	notas_apertura TEXT, 
	notas_cierre TEXT, 
	fecha_control DATETIME, 
	usuario_control_id INTEGER, 
	PRIMARY KEY (id), 
	FOREIGN KEY(usuario_apertura_id) REFERENCES usuarios (id), 
	FOREIGN KEY(usuario_cierre_id) REFERENCES usuarios (id), 
	FOREIGN KEY(usuario_control_id) REFERENCES usuarios (id)
);
