# TP-DSW-2026

## MIEMBROS
* 50839 - Paloma Tejedor
* 51566- Josefina Iazzetta

## REPOSITORIES
* 
* 


## Vision General

### '...'

es un sistema web orientado a la gestión integral de un club deportivo. Su objetivo es centralizar la información del club en una única plataforma, facilitando tanto la administración interna como la interacción de los socios con el club. El sistema contará con dos tipos de usuarios: socios y administradores.

Por un lado, los socios podrán iniciar sesión y acceder a su carnet digital, donde visualizarán su estado, categoría, antigüedad y datos personales. Además, podrán consultar los planes disponibles, visualizar beneficios exclusivos, realizar reservas de espacios del club, inscribirse a actividades deportivas y gestionar el pago de su cuota social. Por otro lado, el personal administrativo podrá gestionar socios, planes, beneficios, deportes y reservas, permitiendo mantener la información actualizada y optimizar la organización del club.
A través de una interfaz moderna y fácil de usar, el sistema busca reemplazar procesos manuales por una solución digital eficiente, reduciendo errores y mejorando la experiencia tanto de los socios como del personal del club.

## MODELO DE DATOS

## ALCANCE FUNCIONAL
### ALCANCE MINIMO
|Req|Detail
|-|-|
|Simple CRUD|1. CRUD-Socio<br>2. CRUD-Plan|
|Dependent CRUD|1. CRUD-Reserva {depend on} Socio<br>2. CRUD-Inscripción {depend on} Socio y Deporte|
|Listado + Detalle|1. Listado de planes filtrado por tipo o categoría => muestra nombre, precio, descripción => detalle muestra información completa del plan<br>2. Listado de reservas por socio => muestra fecha, espacio, estado => detalle muestra toda la información de la reserva|
|CUU / EPIC|1. Realizar reserva de espacio (quincho)<br>2. Inscribirse a actividad deportiva|

---

### ALCANCE ADICIONAL

|Req|Detalle|
|-|-|
|CUU / Epic|1. Registrar pago simulado de cuota social<br>2. Confirmar inscripción a deporte|

---

### ALCANCE FUNCIONAL ADICIONAL VOLUNTARIO

|Req|Detalle|
|-|-|
|Listados|1. Listado de beneficios disponibles para socios|
|CUU / Epic|1. Visualizar carnet digital del socio<br>2. Consultar historial de reservas e inscripciones|
|Otros|1. Validación de formularios (login, reservas, inscripciones)|
