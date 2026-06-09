# Apuntes de Seguridad y Mejoras Pendientes

Este documento recopila las vulnerabilidades y problemas identificados durante la auditoría del sistema para ser solucionados en el futuro.

## 1. Vulnerabilidad Crítica: Claves Expuestas en el Código
**Ubicación**: `backend/app/config.py`

**Problema**:
Se dejaron "valores por defecto" hardcodeados en el código que se subió a GitHub. Cualquier persona con acceso al repositorio público puede ver:
- El `SECRET_KEY` del sistema (permite falsificar sesiones).
- Las credenciales de `Cloudinary` (API_KEY y API_SECRET), lo que permite borrar o subir imágenes maliciosamente.

**Solución Propuesta**:
1. Modificar `config.py` para eliminar los valores por defecto (ej. `os.getenv("SECRET_KEY")`).
2. Subir este cambio a GitHub.
3. Generar nuevas credenciales en Cloudinary.
4. Agregar las nuevas credenciales como Variables de Entorno en el panel de **Render**.

---

## 2. Pantalla en Blanco (Crash) en Rutas Protegidas del Frontend
**Ubicación**: `frontend/src/App.jsx`, `Layout.jsx` y `useAuthStore.js`

**Problema**:
Como confirmaste en las pruebas, si un usuario nunca ha iniciado sesión, el sistema lo bloquea correctamente y lo deja en el login. Sin embargo, si el usuario tiene un "rastro" de una sesión anterior (un token viejo o expirado por inactividad) e intenta entrar a una ruta protegida (ej. `/sales`), la pantalla se queda en blanco. El sistema falla al intentar leer datos del usuario de una sesión que ya no es válida, y no lo expulsa correctamente.

**Solución Propuesta**:
1. Implementar un estado de "Carga" (`isLoading`) inicial en el `useAuthStore`.
2. El sistema debe validar silenciosamente si la sesión aún es válida. Si la sesión ya se cerró, expiró el tiempo, o es inválida, **debe obligar al usuario a iniciar sesión otra vez**.
3. Bajo ninguna circunstancia debe mostrar una pantalla en blanco. Debe limpiar el rastro viejo y hacer un redireccionamiento automático y limpio hacia la pantalla de `/login`.

---

## 3. Mala Práctica de Consultas SQL (Inyección SQL)
**Ubicación**: `backend/app/crud_organization.py`

**Problema**:
La función `delete_organization` utiliza `db.execute()` inyectando variables directamente con f-strings. Ejemplo:
```python
db.execute(f"DELETE FROM rental_items WHERE rental_id IN (SELECT id FROM rentals WHERE organization_id = {organization_id})")
```
Aunque actualmente FastAPI protege contra esto forzando que `organization_id` sea un entero, interpolar variables directamente en texto SQL abre la puerta a Inyecciones SQL si los tipos de datos cambian en el futuro.

**Solución Propuesta**:
Reemplazar las consultas en texto crudo por el uso formal del ORM de SQLAlchemy.
Ejemplo de corrección:
```python
db.query(RentalItem).filter(RentalItem.rental.has(organization_id=organization_id)).delete(synchronize_session=False)
```

---

## 4. Manejo de Rutas Inexistentes (Error 404) y Protección Anticuriosos
**Ubicación**: `frontend/src/App.jsx`

**Problema**:
Actualmente, si alguien intenta adivinar rutas o escribe mal una URL (por ejemplo, `/ventas` o `/dfgdfhg`), React Router no tiene una ruta "comodín" configurada, provocando que la pantalla se quede en blanco. Esto ocurre en dos escenarios:
1. Usuario NO logueado que escribe una ruta que no existe.
2. Usuario SÍ logueado que, estando dentro del sistema, altera la URL manualmente con letras inválidas por curiosidad.

**Solución Propuesta**:
1. Agregar una ruta comodín (`<Route path="*" element={<NotFoundHandler />} />`) al final de `App.jsx`.
2. **Para usuarios NO logueados**: Si entran a una ruta que no existe, mostrarles una página amigable de "Error 404 - Página no encontrada" y un botón para volver al login.
3. **Para usuarios SÍ logueados**: Si estando dentro del sistema alteran la URL con basura, el sistema debe detectarlo, evitar la pantalla en blanco y redirigirlos automáticamente de regreso a su dashboard (o a la página donde estaban), anulando su intento de dañar la vista.

---

## 5. Vulnerabilidad MUY CRÍTICA: Violación de Aislamiento de Datos (IDOR)
**Ubicación**: Archivos de rutas del backend (ej. `backend/app/routers/products.py`) y `backend/app/crud.py`

**Problema**:
Al consultar, actualizar o borrar un elemento específico (por ejemplo, buscar un producto por su ID), el backend **no verifica** a qué organización pertenece ese producto. Solo verifica que el usuario haya iniciado sesión.
Esto significa que si un usuario de la "Empresa A" envía un comando directo al sistema pidiendo borrar el Producto `ID 45` (que pertenece a la "Empresa B"), el sistema lo borrará sin hacer preguntas. Esto es una vulnerabilidad de Referencia Directa a Objetos Insegura (IDOR) y rompe por completo la seguridad de un sistema multi-empresa (SaaS).

**Solución Propuesta**:
1. Reescribir las funciones CRUD individuales (`get_product`, `update_product`, `delete_product`, etc.) para que SIEMPRE exijan y validen el `organization_id` del usuario que hace la petición.
2. Hacer esto mismo para `categories`, `suppliers`, `clients`, y cualquier otra entidad.

---

## 6. Fuga de Datos (Data Leak) en Reportes Globales
**Ubicación**: `backend/app/routers/products.py` (Endpoint `/low-stock`) y `backend/app/crud.py`

**Problema**:
El endpoint que devuelve la lista de productos con stock bajo (`/api/products/low-stock`) realiza una consulta general a la base de datos sin aplicar ningún filtro por `organization_id`. 
Cualquier usuario de cualquier empresa que acceda a esta ruta recibe la información de bajo stock de **absolutamente todas las empresas** registradas en el sistema.

**Solución Propuesta**:
1. Modificar la función `get_low_stock_products` en `crud.py` para que requiera el `organization_id`.
2. Actualizar el router para que inyecte `current_user.organization_id` en la llamada a la base de datos, garantizando que cada empresa solo vea su propia información.

---

## 7. Vulnerabilidad MUY CRÍTICA: Registro Abierto Oculto (Privilege Escalation)
**Ubicación**: `backend/app/routers/auth.py` (Endpoint `/register`)

**Problema**:
Me mencionaste que: *"El sistema es muy difícil que alguien pueda acceder porque ya las contraseñas las creo yo. No es que alguien viene y puede registrarse"*.
**Lamento decirte que esto no es cierto a nivel de código.** Aunque no tengas un botón visual de "Registrarse" en tu página web, el servidor tiene una "puerta trasera" abierta. El endpoint `/api/auth/register` en el backend **no exige autenticación previa**. 
Cualquier atacante (o un bot) que sepa o adivine la URL de tu backend puede enviar un comando directamente desde su computadora (usando programas como Postman o cURL) y crearse un usuario válido. Peor aún, el código permite inyectar el rol que deseen (ej. `role: "super_admin"`), lo que les daría control total de tu sistema.

**Solución Propuesta**:
1. Eliminar o proteger con contraseña/token exclusivo el endpoint `/register` si no se necesita.
2. Si tú eres el único que crea usuarios, la función de crear usuarios en el backend debe exigir `Depends(get_current_active_user)` y verificar que el usuario actual tenga permisos de `super_admin` antes de dejarlo crear otra cuenta.

---

## 8. Vulnerabilidad Grave: Creación de Empresas (Organizaciones) Pública
**Ubicación**: `backend/app/routers/organizations.py` (Endpoint `/register`)

**Problema**:
Al igual que el registro de usuarios, el sistema tiene una ruta completamente pública para registrar Organizaciones/Empresas. El mismo código lo dice en los comentarios: `No requiere autenticación - es la primera pantalla que ve el cliente`.
Si tu sistema está pensado para ser privado (solo tú invitas o creas las empresas y usuarios), este código permite que cualquier persona en internet envíe una solicitud POST a este endpoint y cree su propio "Tenant" (espacio de trabajo) en tu base de datos y llene tu almacenamiento gratis.

**Solución Propuesta**:
Proteger la ruta de registro de organizaciones para que solo un usuario con rol de `super_admin` (o sea, tú) pueda crear nuevas empresas en el sistema.

---

## 9. Debilidad en Subida de Archivos (MIME Spoofing)
**Ubicación**: `backend/app/routers/organizations.py` (Subida de logos y sellos)

**Problema**:
El sistema valida que el logo o sello subido sea una imagen haciendo esto: `if not file.content_type.startswith("image/")`. Esto es inseguro porque un atacante puede subir un archivo malicioso (como un script `.exe` o `.js`) e interceptar la petición para decirle al servidor "Oye, confía en mí, esto es una imagen `image/png`". El servidor lo creerá y lo subirá a Cloudinary.

**Solución Propuesta**:
Implementar una validación más robusta que lea la extensión real del archivo (ej. asegurarse de que termine en `.jpg`, `.png`, `.webp`) o usar una librería que lea la firma binaria del archivo (Magic Bytes) para confirmar que realmente es una imagen.

---

## 10. Riesgo de Corrupción de Datos (Mala Gestión de Borrado en Cascada)
**Ubicación**: `backend/app/crud_organization.py`

**Problema**:
En la función que borra organizaciones, el código intenta eliminar "manualmente" tabla por tabla (borra primero los items de alquiler, luego los alquileres, luego las ventas, luego los productos...). Si durante este largo proceso ocurre un error a la mitad (por ejemplo, el servidor se reinicia o falla una consulta), la base de datos quedará en un estado **inconsistente y corrupto**: tendrás una organización "a medias", con productos pero sin ventas, o sin usuarios pero con clientes.

**Solución Propuesta**:
En lugar de hacer 12 operaciones de borrado manuales (y usar `db.execute` riesgoso), se debe configurar **Cascade Delete** en los modelos de SQLAlchemy (`models_extended.py`). De esta forma, cuando el servidor ordene borrar una organización, la base de datos se encargará automáticamente y de forma atómica de destruir todo lo asociado a ella en una sola transacción segura.

---

## 11. Riesgo de Fuga de Información Técnica (Information Disclosure)
**Ubicación**: `backend/app/main.py` (Manejador global de excepciones)

**Problema**:
Tu aplicación tiene un bloque en el código principal que atrapa cualquier error imprevisto (ej. una caída de base de datos o un fallo interno) y hace lo siguiente: `content={"detail": f"Error interno: {str(exc)}"}`. 
Esto significa que si la base de datos falla, el sistema le enviará al navegador del usuario el mensaje exacto y técnico del error. Un atacante podría usar esto forzando un error para leer fragmentos de tus consultas SQL, ver cómo se llaman tus tablas, o descubrir rutas internas de tu servidor.

**Solución Propuesta**:
En un ambiente de producción, los errores 500 deben ser opacos. El sistema debe guardar el error real en un registro privado (log) para que tú lo leas, pero al usuario/atacante solo se le debe devolver un mensaje genérico como: `"Error interno del servidor. Por favor contacte al administrador."`
