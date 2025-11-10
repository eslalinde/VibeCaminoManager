# Sistema de Reportes - ComunidadCat

## Descripción General

El sistema de reportes de ComunidadCat proporciona análisis detallados y estadísticas de las comunidades neocatecumenales, equipos de catequistas y presbíteros. Los reportes están diseñados para facilitar la toma de decisiones y el seguimiento del crecimiento de las comunidades.

## Tipos de Reportes Disponibles

### 1. Equipos de Catequistas
- **Ubicación**: `/protected/reports/catechist-teams`
- **Descripción**: Reporte completo de todos los equipos de catequistas con información detallada
- **Datos incluidos**:
  - Nombre del equipo
  - Comunidad asignada
  - Parroquia y ciudad
  - Número de miembros
  - Responsable del equipo

### 2. Comunidades por Parroquia
- **Ubicación**: `/protected/reports/communities-by-parish`
- **Descripción**: Agrupación de comunidades por parroquia con estadísticas consolidadas
- **Datos incluidos**:
  - Información de la parroquia (nombre, diócesis, ciudad)
  - Cantidad de comunidades
  - Total de hermanos
  - Promedio de hermanos por comunidad
  - Resumen de etapas del camino

### 3. Presbíteros
- **Ubicación**: `/protected/reports/priests`
- **Descripción**: Listado completo de presbíteros con sus asignaciones
- **Datos incluidos**:
  - Información personal del presbítero
  - Parroquia asignada
  - Número de comunidades a cargo
  - Información de contacto
  - Estado de párroco


## Características Técnicas

### Base de Datos
- **Vistas optimizadas**: Las consultas complejas se ejecutan usando vistas de PostgreSQL para mejor rendimiento
- **RLS (Row Level Security)**: Todos los datos están protegidos por políticas de seguridad

### Funcionalidades
- **Exportación CSV**: Todos los reportes pueden exportarse en formato CSV
- **Actualización en tiempo real**: Botón de actualización para refrescar los datos
- **Interfaz responsive**: Diseño adaptable para diferentes tamaños de pantalla
- **Carga asíncrona**: Indicadores de carga para mejor experiencia de usuario

## Componentes Principales

### ReportTable
Componente base reutilizable para mostrar datos en formato tabla con:
- Exportación a CSV
- Botones de actualización
- Estados de carga
- Navegación de regreso

### Páginas de Reportes
Cada tipo de reporte tiene su propia página que:
- Define las columnas específicas
- Maneja la carga de datos
- Procesa la información para mostrar

## Sugerencias para Consultas Complejas en Supabase

### 1. Vistas (Views)
- **Uso**: Para consultas complejas que se reutilizan frecuentemente
- **Ventajas**: Mejor rendimiento, código más limpio
- **Ejemplo**: `view_catechist_teams` combina múltiples JOINs

### 2. Consultas con JOINs Múltiples
- **Uso**: Para relaciones complejas entre tablas
- **Ventajas**: Una sola consulta para datos relacionados
- **Ejemplo**: Equipos con comunidades, parroquias y ciudades

### 3. Agregaciones y Agrupaciones
- **Uso**: Para estadísticas y resúmenes
- **Ventajas**: Cálculos eficientes en la base de datos
- **Ejemplo**: COUNT, SUM, AVG por grupos

## Mejores Prácticas

1. **Usar vistas para consultas complejas frecuentes**
2. **Aprovechar las capacidades de agregación de PostgreSQL**
3. **Usar índices apropiados para mejorar el rendimiento**
4. **Implementar paginación para grandes conjuntos de datos**
5. **Usar RLS para seguridad de datos**

## Extensibilidad

El sistema está diseñado para ser fácilmente extensible:
- Nuevos tipos de reportes pueden agregarse siguiendo el patrón existente
- Las vistas pueden modificarse sin afectar el frontend
- Los componentes son reutilizables para nuevos reportes
- La estructura modular permite agregar nuevas funcionalidades fácilmente
