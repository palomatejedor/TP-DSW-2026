# DSW: Desarrollo de Software
Repo con información general de la cátedra

## Media
* [Canal de Youtube](https://www.youtube.com/@dsw-utn).
* [Grupo de Telegram](https://bit.ly/dsw-telegram). Una vez unido se recomienda silenciar los topics de las comisiones a las que no pertenece y solo dejar activos el de su comisión y año, General, TP y PoC.
* Repos:
    * [TP](https://www.github.com/utnfrrodsw/tp)
    * [PoC](https://www.github.com/utnfrrodsw/poc)
    * Material de Back-end:
        * [Youtube playlist](https://youtube.com/playlist?list=PLstUYTrWtZx0Vv18QId7UHN5h2trJwUlD&si=qOkk08s4u49a_z68)
        * [Código Fuente](https://www.github.com/utnfrrodsw/material-be) de los videos
        * [Material teórico](https://www.github.com/utnfrrodsw/clases) escrito
        * [Temario](https://www.github.com/utnfrrodsw/clases/blob/main/backend/topics.md)

## Profesores
* Arnold, Joel
* Bressano, Mario
* Luna, Lucas
* Meca, Adrián
* Otaduy, Andrés
* Tabacman, Ricardo

Regularidad:
|Req|Detalle|
|:-|:-|
|CRUD simple|1. CRUD Tipo Habitacion<br>2. CRUD Servicio<br>3. CRUD Localidad|
|CRUD dependiente|1. CRUD Habitación {depende de} CRUD Tipo Habitacion<br>2. CRUD Cliente {depende de} CRUD Localidad|
|Listado<br>+<br>detalle| 1. Listado de habitaciones filtrado por tipo de habitación, muestra nro y tipo de habitación => detalle CRUD Habitacion<br> 2. Listado de reservas filtrado por rango de fecha, muestra nro de habitación, fecha inicio y fin estadía, estado y nombre del cliente => detalle muestra datos completos de la reserva y del cliente|
|CUU/Epic|1. Reservar una habitación para la estadía<br>2. Realizar el check-in de una reserva|


Adicionales para Aprobación
|Req|Detalle|
|:-|:-|
|CRUD |1. CRUD Tipo Habitacion<br>2. CRUD Servicio<br>3. CRUD Localidad<br>4. CRUD Provincia<br>5. CRUD Habitación<br>6. CRUD Empleado<br>7. CRUD Cliente|
|CUU/Epic|1. Reservar una habitación para la estadía<br>2. Realizar el check-in de una reserva<br>3. Realizar el check-out y facturación de estadía y servicios|


### Alcance Adicional Voluntario

*Nota*: El Alcance Adicional Voluntario es opcional, pero ayuda a que la funcionalidad del sistema esté completa y será considerado en la nota en función de su complejidad y esfuerzo.

|Req|Detalle|
|:-|:-|
|Listados |1. Estadía del día filtrado por fecha muestra, cliente, habitaciones y estado <br>2. Reservas filtradas por cliente muestra datos del cliente y de cada reserve fechas, estado cantidad de habitaciones y huespedes|
|CUU/Epic|1. Consumir servicios<br>2. Cancelación de reserva|
|Otros|1. Envío de recordatorio de reserva por email|
