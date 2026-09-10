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


## Flujo y estados de una PQR
 
Una PQR avanza por 4 estados:
 
```
registrada -> asignada -> respondida -> cerrada
```
 
- **registrada**: el cliente la creó.
- **asignada**: servicio al cliente le puso una categoría y la asignó a un área, en un solo paso.
- **respondida**: el área responsable registró la solución.
- **cerrada**: servicio al cliente la cierra, solo posible si ya está respondida.

  
## Cómo probar el flujo completo

1. En `/registro`, crea al menos un área responsable con su propia cuenta: al elegir el rol `area_responsable`, el formulario pide seleccionar a qué área pertenece (Logística, Facturación, Atención al cliente, etc.).
2. Regístrate también con rol `cliente` y con rol `servicio_cliente`.
3. Como **cliente**: inicia sesión y registra una PQR (`/crear-pqr`).
4. Como **servicio_cliente**: en `/gestion-pqrs`, elige una categoría y un área para la PQR, y dale "Clasificar y asignar" (una sola acción).
5. Como **area_responsable** (la cuenta que pertenece a esa área): en `/responder-pqr`, verás solo las PQR de tu propia área. Escribe la respuesta.
6. Como **servicio_cliente** de nuevo: en `/gestion-pqrs`, aparece el botón "Cerrar" para esa PQR una vez está respondida.
7. Como **cliente**: consulta `/historial` y verifica que el estado final y la respuesta aparezcan correctamente.

## URL de la aplicación publicada

https://mercado-viva-x1t4.onrender.com/ 

## Repositorio

https://github.com/MafePiedrahita/Mercado-Viva.git
