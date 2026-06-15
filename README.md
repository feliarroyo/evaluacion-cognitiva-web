# Aplicación web auxiliar
[Ver proyecto relacionado](https://github.com/feliarroyo/evaluacion-cognitiva)

Desarrollada por Felipe Arroyo y Melisa Messa, bajo la dirección de Virginia Yannibelli, en el contexto de Proyecto Final de la carrera de Ingeniería de Sistemas en UNICEN. Esta aplicación web cumple la función de administración y visualización de datos del sistema. Provee al administrador las herramientas necesarias para gestionar los accesos seguros de los usuarios, personalizar el diseño del entorno de evaluación y descargar informes basados en el desempeño observado en la aplicación móvil.

Utiliza Vue.js como framework de frontend en conjunto con las tecnologías web estándar (HTML, CSS, JavaScript), e integra los servicios de la nube de Firebase: **Firebase Authentication** para registrar nuevos pacientes y mantener la sesión del administrador; y **Firebase Realtime Database** para lecturas y escrituras en la base de datos.

## Funcionalidades del sistema

### Control de autenticación y listado de usuarios
*   Garantiza el aislamiento seguro del sistema mediante credenciales validadas directamente en los servidores remotos de Firebase.
*   Incluye lógica nativa de restablecimiento de contraseña automatizado mediante correos de recuperación.
*   El panel principal recupera de manera dinámica el listado general de pacientes de la base de datos NoSQL, renderizando de forma modular sus datos junto con los accesos directos al historial clínico y la configuración individual.

### Registro de usuarios
*   Permite dar de alta nuevos usuarios en el sistema ingresando nombre, apellido y correo electrónico.
*   Para hacer esto, se utiliza una instancia aislada de Firebase Authentication para registrar el nuevo UID del paciente en los servidores sin cerrar ni comprometer la sesión web activa del administrador.
*   Una vez que se crea el usuario, se clona la configuración de la tabla `globalLevelsConfig` en la base de datos.

### Personalización remota de la actividad
El administrador cuenta con un panel avanzado para alterar la complejidad de los niveles de forma independiente:
*   Los tiempos de las etapas de memorización (`timeMem`) e identificación (`timeSearch`) son configurables.
*   Los objetos son asignados a posiciones específicas, indicadas con imágenes del entorno duplas de tipo `<ubicación, objeto>`.
*   **Discriminación de Estímulos:** Permite seleccionar qué elementos exactos se instanciarán en los estantes del hall (objetos a memorizar) y cuáles se distribuirán en el living (distinguiendo entre objetos a memorizar y distractores).
*   Los cambios quedan fijos al presionar "Guardar", transmitiendo los nuevos nodos JSON configurados hacia Firebase para su sincronización remota con la aplicación móvil.

### Referencia virtual del ambiente
*   Se permite visualizar imágenes de referencia de la disposición de cada parte del ambiente virtual.
*   También se ofrece el video tutorial, a modo de referencia para el administrador de la actividad a realizar antes de diseñar un nivel personalizado.

### Historial de usuarios
*   En el historial de un usuario, se pueden ver todas las sesiones realizadas hasta el momento.
*   Los datos calculados son estructurados en un informe, ofrecido en formato PDF o TXT.
*   También se permite la descarga del log de estados realizado durante la actividad, en formato TXT. Este archivo permite reconstruir cronológicamente el desarrollo de la actividad.
