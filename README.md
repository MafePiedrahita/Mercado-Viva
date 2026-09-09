# Mercado Viva

Centralizar la gestión de las PQR y el historial del cliente en una única aplicación, permitiendo consultar, registrar y actualizar las solicitudes de manera organizada, sin importar el canal de origen (tienda física, web o app).

## Tecnologías

- **Backend:** FastAPI (Python)
- **Base de datos:** Supabase (PostgreSQL)
- **ORM:** SQLAlchemy
- **Frontend:** HTML, CSS y JavaScript con plantillas Jinja2
- **Autenticación:** Sesiones con cookies + contraseñas hasheadas (bcrypt)
- **Despliegue:** Render

## Requisitos

- Python 3.10+
- pip
- Una cuenta de Supabase (para la base de datos)

## Instalación local

### 1. Clonar el repositorio

```
git clone https://github.com/MafePiedrahita/Mercado-Viva.git
cd Mercado-Viva
```

### 2. Crear entorno virtual

```
python3 -m venv venv
```

### 3. Activar el entorno virtual

- Windows: `venv\Scripts\activate`
- Mac/Linux: `source venv/bin/activate`

### 4. Instalar dependencias

```
pip install -r requirements.txt
```

### 5. Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto con la cadena de conexión a tu base de datos de Supabase:

```
DATABASE_URL=postgresql://postgres:TU_PASSWORD@db.xxxxxxxxxxxx.supabase.co:5432/postgres
```

La URL se obtiene en Supabase: **Settings → Database → Connection string → URI**.


### 6. Ejecutar la aplicación (conexión con la Base de Datos)

```
uvicorn app.main:app --reload
```

### 7. Abrir en el navegador

[http://127.0.0.1:8000](http://127.0.0.1:8000)


## Cómo probar el flujo completo

1. Regístrate en `/registro` con rol `cliente`, `servicio_cliente` o `area_responsable`.
2. Como **cliente**: inicia sesión y registra una PQR.
3. Como **servicio_cliente**: clasifica y asigna la PQR a un área.
4. Como **area_responsable**: responde la PQR.
5. Como **cliente** de nuevo: consulta el historial y verifica que la respuesta aparezca.

## URL de la aplicación publicada

https://mercado-viva-x1t4.onrender.com/ 

## Repositorio

https://github.com/MafePiedrahita/Mercado-Viva.git