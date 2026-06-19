# Instrucciones para generar nuevos dashboards

## Contexto
Estoy trabajando en un proyecto TypeScript con React. Existe una carpeta `templateDashboard/` que contiene la plantilla base para todas las páginas de dashboard del proyecto.

## Tu tarea
Cuando se te pida crear un nuevo dashboard, primero lee y analiza todos los archivos dentro de `templateDashboard/`. Luego genera el nuevo componente siguiendo EXACTAMENTE los mismos patrones que encuentres ahí.

## Patrones que debes replicar del template

### Estructura del componente
- Usa arrow function con tipado TypeScript implícito
- Exporta como `export default` al final
- Nombre del componente en PascalCase terminando en `Page`

### Hooks y data fetching
- Desestructura siempre: `{ data, isLoading, isError, error }` del hook correspondiente
- Maneja los estados en este orden:
    1. `if (isLoading) return <LoadingSpinner />;`
    2. `if (isError) return <div>Error: {error?.message}</div>;`
    3. Return del JSX principal

### Imports
- `useNavigate` de `react-router-dom` si hay navegación
- Hooks personalizados desde `../hooks/`
- Componentes reutilizables desde `../components/`
- Siempre incluye `LoadingSpinner` y `Breadcrumb`

### Layout y clases Tailwind
- Contenedor raíz: `className="p-8"`
- Header: `className="flex justify-between items-center mb-8"`
- Título principal: `className="text-3xl font-bold"`
- Botón primario de acción: `className="bg-blue-500 text-white px-4 py-2 rounded"`
- Grid de tarjetas: `className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"`
- Tarjeta individual: `className="border p-4 rounded cursor-pointer hover:bg-gray-100"`

### Breadcrumb
- Siempre es el primer elemento dentro del contenedor raíz
- Usa el prop `items` con array de objetos `{ label: string }`

### Navegación
- Usa `useNavigate()` para toda la navegación programática
- Rutas siguen el patrón: `/[recurso]/new` y `/[recurso]/[uuid]`

### Estado vacío
- Siempre incluye un mensaje simple cuando no hay datos: `<p>Crea tu primer [recurso]</p>`

## Ejemplo de uso
"Crea un dashboard para gestionar tareas usando la plantilla de templateDashboard"

→ Deberás generar `TasksDashboardPage.tsx` replicando la estructura anterior pero adaptada al dominio de tareas.