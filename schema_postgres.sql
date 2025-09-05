CREATE TABLE usuarios (
	id SERIAL NOT NULL, 
	nombre VARCHAR(50) NOT NULL, 
	apellido VARCHAR(50) NOT NULL, 
	is_admin BOOLEAN, 
	email VARCHAR(120) NOT NULL, 
	activo BOOLEAN, 
	PRIMARY KEY (id), 
	UNIQUE (email)
);

CREATE TABLE clientes (
	id SERIAL NOT NULL, 
	nombre VARCHAR(50) NOT NULL, 
	apellido VARCHAR(50) NOT NULL, 
	telefono VARCHAR(20), 
	fecha_nacimiento DATE, 
	activo BOOLEAN, 
	PRIMARY KEY (id)
);

CREATE TABLE categorias (
	id SERIAL NOT NULL, 
	nombre VARCHAR(50) NOT NULL, 
	activo BOOLEAN, 
	PRIMARY KEY (id)
);

CREATE TABLE subcategorias (
	id SERIAL NOT NULL, 
	nombre VARCHAR(50) NOT NULL, 
	categoria_id INTEGER NOT NULL, 
	activo BOOLEAN, 
	PRIMARY KEY (id), 
	FOREIGN KEY(categoria_id) REFERENCES categorias (id)
);

CREATE TABLE ventas (
	id SERIAL NOT NULL, 
	cliente_id INTEGER NOT NULL, 
	usuario_id INTEGER NOT NULL, 
	fecha_venta TIMESTAMP NOT NULL, 
	total REAL NOT NULL, 
	metodo_pago VARCHAR(30) NOT NULL, 
	descuento REAL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(cliente_id) REFERENCES clientes (id), 
	FOREIGN KEY(usuario_id) REFERENCES usuarios (id)
);

CREATE TABLE productos (
	id SERIAL NOT NULL, 
	nombre VARCHAR(50) NOT NULL, 
	talle VARCHAR(10), 
	codigo VARCHAR(30), 
	color VARCHAR(30), 
	marca VARCHAR(30), 
	stock_minimo INTEGER, 
	costo REAL NOT NULL, 
	precio_venta REAL NOT NULL, 
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
	id SERIAL NOT NULL, 
	venta_id INTEGER NOT NULL, 
	producto_id INTEGER NOT NULL, 
	cantidad INTEGER NOT NULL, 
	precio_unitario REAL NOT NULL, 
	subtotal REAL NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(venta_id) REFERENCES ventas (id), 
	FOREIGN KEY(producto_id) REFERENCES productos (id)
);

CREATE TABLE cajas (
	id SERIAL NOT NULL, 
	fecha_apertura TIMESTAMP NOT NULL, 
	fecha_cierre TIMESTAMP, 
	monto_inicial REAL NOT NULL, 
	monto_final REAL, 
	monto_sistema REAL, 
	diferencia REAL, 
	usuario_apertura_id INTEGER NOT NULL, 
	usuario_cierre_id INTEGER, 
	estado VARCHAR(20) NOT NULL, 
	notas_apertura TEXT, 
	notas_cierre TEXT, 
	fecha_control TIMESTAMP, 
	usuario_control_id INTEGER, 
	PRIMARY KEY (id), 
	FOREIGN KEY(usuario_apertura_id) REFERENCES usuarios (id), 
	FOREIGN KEY(usuario_cierre_id) REFERENCES usuarios (id), 
	FOREIGN KEY(usuario_control_id) REFERENCES usuarios (id)
);