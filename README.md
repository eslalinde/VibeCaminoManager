# PRD: CaminoManager
## Visión general 
CaminoManager es una aplicación web que permite a los responsables de la ciudad la creación, búsqueda y coordinación del manejo de las comunidades neocatecumenales de una ciudad y país.

## Funcionalidades esenciales 
- Autenticación con email
- CRUD de ciudad
- CRUD de departamento
- CRUD de país
- CRUD de una parroquia
- CRUD de personas
- Creación de una comunidad (incluye crear todas las personas que pertenecen, crear equipo de responsables y corresponsables)
- Búsqueda por parroquia y por responsable
- Impresión de fichas de comunidad
- Reportes personalizados
  
## Pantallas principales

### CRUD de país
- Visualización en cuadrícula de países con paginación por 10 elementos
- Ventana emergente con formulario con campos requeridos (nombre y código de país) para agregar nuevo país
- Opción de ordenar cuadrícula
- Opción de campo clave de búsqueda de país
- La ultima columna de la cuadrícula son las acciones que se pueden hacer por cada fila (editar y eliminar)

### CRUD de departamento
- Visualización en cuadrícula de departamentos (departamento y país) con paginación por 10 elementos
- Ventana emergente con formulario con campos requeridos para agregar nuevo departamento:
  - país (lista desplegable de países)
  - nombre departamento
- Opción de ordenar cuadrícula
- Opción de campo clave de búsqueda de departamento
- La ultima columna de la cuadrícula son las acciones que se pueden hacer por cada fila (editar y eliminar)

### CRUD de ciudad
- Visualización en cuadrícula de ciudad (ciudad, departamento y país) con paginación por 10 elementos
- Ventana emergente con formulario con campos requeridos para agregar nueva ciudad:
  - país (lista desplegable de países)
  - departamento
  - nombre ciudad
- Opción de ordenar cuadrícula
- Opción de campo clave de búsqueda de ciudad
- La ultima columna de la cuadrícula son las acciones que se pueden hacer por cada fila (editar y eliminar)

### CRUD Personas
- Visualización en cuadrícula de personas (Nombre, Teléfono, Celular, Correo electrónico, Casado, Carisma, Genero) con paginación por 10 elementos
- Un formulario con campos requeridos para agregar nueva persona:
  - Nombre
  - Teléfono
  - Celular
  - Correo electrónico
  - Casado
  - Carisma (Lista desplegable de carismas: Casado, Viudo, Presbítero, Seminarista, Diacono, Monja, Soltero)
  - Genero (Lista desplegables: Masculino o femenino)
  - Opción para crear matrimonio, marido y mujer
- Opción de ordenar cuadrícula
- Opción de campo clave de búsqueda de persona
- La ultima columna de la cuadrícula son las acciones que se pueden hacer por cada fila (editar y eliminar)

### CRUD de parroquia
- Visualización en cuadrícula de parroquias (Nombre, Diócesis, Dirección, Teléfono, Correo electrónico) con paginación por 10 elementos
- Un formulario con campos requeridos para agregar nueva parroquia:
  - Nombre
  - Diócesis
  - Dirección
  - Teléfono
  - Correo electrónico  
  - Sacerdotes (una cuadricula con los sacerdotes asociados a la parroquia, solo uno de ellos puede ser el párroco los otros vicarios, los sacerdotes se seleccionan de los tipos de persona sacerdote, un sacerdote que ya este en una parroquia no puede aparecer en la lista)
- Opción de ordenar cuadrícula
- Opción de campo clave de búsqueda de parroquia
- La ultima columna de la cuadrícula son las acciones que se pueden hacer por cada fila (editar y eliminar)

### CRUD comunidad
- Visualización en cuadrícula de comunidad (Número, Fecha de Nacimiento, Hermanos Iniciales, Hermanos Actuales, Fecha Ultima Etapa, Catequista Actual) con paginación por 10 elementos
- Una pagina para crear comunidad con múltiples elementos
  - formulario con información básica comunidad (Número, Fecha de Nacimiento, Hermanos Iniciales, Hermanos Actuales, Fecha Ultima Etapa, Catequista Actual)
  - Sección de Personas/Hermanos de comunidad
    - un botón que abre un dialogo modal con el formulario de persona para agregar persona
    - un botón para asociar persona existente
    - Visualización en cuadricula de personas (nombre, carisma, celular, columna de acción solo eliminar) 
    - Los matrimonios aunque son 2 personas diferentes se ven como un solo registro formateado "Nombre Hombre y Nombre Mujer"
  - Sección para crear equipo de responsables
    - Visualización en cuadrícula del equipo de responsables (Nombre, Responsable, Carisma, Celular)
    - Solo un matrimonio o soltero puede ser responsable
    - Pueden existir varias personas o matrimonio como corresponsables
    - Botón para agregar el equipo de responsables (Se selecciona de una lista desplegable de hermanos de la comunidad) y los matrimonios o/u otros hermanos que serán corresponsables.
    - Botón de acción para cambiar de responsable.
  - Sección para múltiples equipos de catequistas
    - Visualización en cuadricula de cuadrículas
    - Botón para crear equipo de catequistas se crea la cuadrícula
    - Cada cuadrícula es un equipo de catequistas (Nombre, Responsable, Carisma, Celular)
    - Cada cuadrícula tiene un botón para agregar personas al equipo de catequistas
    - Botón de acción para asignar el responsable
- Opción de ordenar cuadrícula
- Opción de campo clave de búsqueda de comunidad
- La ultima columna de la cuadrícula son las acciones que se pueden hacer por cada fila (editar y eliminar)
- Una comunidad no se puede eliminar, se puede deshabilitar.

## Plan de implementación

### Fase 1: Estructura básica y autenticación 
1. Configuración del proyecto Next.js/Supabase 
2. Diseño de la base de datos en supabase 
   - Base de datos en postgresql
   - La siguiente es el schema de la base de datos que se espera
     - Countries -> Name (texto(256))  y Codigo (texto(2))
     - States -> Name (texto(256)), CountryId (referencia a la tabla country)
     - Cities -> Name (texto(256)), CountryId (referencia a la tabla country), StateId (referencia a la tabla State) 
     - People -> PersonName (texto(256)), Phone (texto(50)), Mobile (texto(50)), Email (texto(256)), PersonTypeId (smallint), GenderId (small int), SpouseId (referencia a la misma tabla People para enlazar los esposos)
     - Parishes -> Name (texto(256)), Diocese (texto(256)), Address (texto(256)), Phone (texto(50)), Email (texto(256)), CityId (referencia a la tabla City)
     - TeamTypes -> Name (texto(256)), Order (smallint)
     - StepWays -> Name (texto(256)), Order (smallint)
     - Teams -> Name (texto(256)), TeamTypeId (referencia a la tabla TeamTypes), CommunityId (referencia a la tabla Communities)        
     - Communities -> Number (texto(50)), BornDate (Date), ParishId (referencia a tabla Parish), BornBrothers (smallint), ActualBrothers (smallint), StepWayId (referencia a la tabla StepWay), LastStepWayDate (Date), CathechistTeamId (integer)
     - ParishTeams -> ParishId (referencia a tabla Parishes), TeamId (referencia a tabla Teams)
     - Priests -> PersonId (referencia a tabla People), IsParishPriest (bool), ParishId (referencia a tabla Parish)
     - Brothers -> PersonId (referencia a tabla People), CommunityId (referencia a tabla Communities) 
     - Belongs -> PersonId (referencia a tabla People), CommunityId (referencia a tabla Communities) , TeamId (referencia a tabla Teams), IsResponsibleForTheTeam (bool)
     - CommunityStepLog -> CommunityId (referencia a tabla Communities), StepWayId (referencia a la tabla StepWay), DateOfStep (Date), PrincipalCatechistName (texto(256)), Outcome (bool), Notes (text)
   - Todas las tablas deben contar con una clave principal con nombre Id de tipo entero y secuencial
   - Quiero implementar busqueda de full text search para la tabla People (PersonName), Parhises (Name)
3. Implementación del sistema de autenticación 
4. Creación de layout básico y navegación


## Estándares técnicos de base de datos
- Mantener un esquema de migraciones para la base de datos

## Estándares técnicos 
- Componentes en React con Shadcn UI
- Esquema de colores: #3498db (primario), #2ecc71 (éxito), #e74c3c (error) 
- Responsive design (mobile-first)
- Quiero que se pueda cambiar entre oscuro y claro


