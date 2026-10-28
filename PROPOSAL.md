# TP-DSW-2026

## MIEMBROS
* 50839 - Paloma Tejedor
* 51566- Josefina Iazzetta

## REPOSITORIES
* Frontend: https://github.com/palomatejedor/TP-DSW-2026/tree/main/APP-Club/frontend (React + Vite + React-Bootstrap)
* Backend: https://github.com/palomatejedor/TP-DSW-2026/tree/main/APP-Club/backend (Node.js + Express + TypeORM + MySQL)


## Vision General

### **Sports Club**

Es un sistema web orientado a la gestión integral de un club deportivo. Su objetivo es centralizar la información del club en una única plataforma, facilitando tanto la administración interna como la interacción de los socios con el club. El sistema contará con dos tipos de usuarios: socios y administradores.

Por un lado, los socios pueden registrarse (con la aprobación del administrador), iniciar sesión y acceder a su carnet digital, donde visualizan su estado, categoría, antigüedad y datos personales. Además, pueden consultar y elegir su plan, visualizar beneficios exclusivos, inscribirse a actividades deportivas y pagar su cuota social. Los socios pueden formar grupos familiares, donde un titular elige el plan y paga la cuota de todo el grupo.

Por otro lado, el personal administrativo puede gestionar socios, grupos familiares, planes, actividades, inscripciones, pagos y beneficios, aprobar las solicitudes de cuenta de los socios y administrar otras cuentas de administrador, permitiendo mantener la información actualizada y optimizar la organización del club. A través de una interfaz moderna y fácil de usar, el sistema busca reemplazar procesos manuales por una solución digital eficiente, reduciendo errores y mejorando la experiencia tanto de los socios como del personal del club.

## MODELO DE DATOS

## ALCANCE FUNCIONAL
### ALCANCE MINIMO
|Req|Detail|
|-|-|
|Simple CRUD|1. CRUD-Socio|
|Dependent CRUD|1. CRUD-Inscripción {depend on} Socio y Actividad|
|Listado + Detalle|1. Listado de planes (con su tipo y periodicidad) => muestra nombre, precio, descripción => detalle muestra información completa del plan|
|CUU / EPIC|Inscribirse a actividad deportiva|

---

### ALCANCE ADICIONAL

|Req|Detalle|
|-|-|
|CUU / Epic|1. Registrar pago simulado de cuota social<br>2. Confirmar inscripción a deporte|

---

### ALCANCE FUNCIONAL ADICIONAL VOLUNTARIO

|Req|Detalle|
|-|-|
|Listados|1. Listado de beneficios disponibles para socios (cargados por el administrador)<br>2. Listado de pagos y cuotas (administrador)|
|CUU / Epic|1. Visualizar carnet digital del socio<br>2. Consultar historial de inscripciones<br>3. Registro de socios con aprobación del administrador<br>4. Gestión de administradores y cambio obligatorio de contraseña temporal<br>5. Grupos familiares con plan compartido<br>6. Recuperar contraseña|
|Otros|1. Validación de formularios (login, registro, socios, inscripciones) y de reglas de negocio en el servidor<br>2. Sesión del socio limitada a 15 minutos<br>3. Rango de edad por actividad<br>4. Aviso al administrador de socios mayores de edad sin mail|
