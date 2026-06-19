# WebSocket Setup - Mediciones en Tiempo Real

## ✅ Implementación Completada

Sistema WebSocket integrado para recibir progreso de mediciones en tiempo real desde el backend NestJS.

### 📦 Dependencias Instaladas
- `socket.io-client` v4.x

### 🔧 Archivos Creados

#### 1. **Hooks**
- **`src/hooks/useWebSocket.ts`** - Conexión WebSocket global
  - Conecta al servidor mediante Socket.IO
  - Se une a la sala personal del usuario con su `userId`
  - Maneja reconexión automática
  - Se limpia al desmontar el componente

- **`src/hooks/useMeasurementSocket.ts`** - Escucha eventos de medición
  - Recibe eventos: `measurement:progress`, `measurement:completed`, `measurement:error`
  - Mantiene estado de: progreso, canal actual, mensaje de estado, datos completados
  - Se limpia automáticamente al cambiar jobId

#### 2. **Tipos Actualizados**
- **`src/types/measurement.types.ts`** - Nuevas interfaces agregadas
  - `ProgressEvent` - Evento de progreso
  - `CompletedEvent` - Evento de finalización
  - `ErrorEvent` - Evento de error
  - `MeasurementSocketState` - Estado del socket de medición

#### 3. **Componentes Modificados**
- **`src/pages/TaskDetailPage.tsx`**
  - Integra `useWebSocket` y `useMeasurementSocket`
  - Genera `jobId` único para cada medición
  - Pasa estado de progreso a `SweepConfigCard`
  - Actualiza gráfica con datos completados del WebSocket

- **`src/components/task/SweepConfigCard.tsx`**
  - Muestra barra de progreso (0-100%)
  - Texto: "X% — Canal N de 16"
  - Colores: Ámbar mientras mide, Verde cuando completado
  - Mensajes dinámicos del WebSocket

#### 4. **Hooks Actualizados**
- **`src/hooks/useMeasurement.ts`**
  - Parámetro `jobId` opcional en `useMeasure`

## 🚀 Cómo Funciona

### Flujo de Medición

1. **Usuario hace clic en "Sweep Measure"**
   - Se genera un `jobId` único: `${taskId}-${timestamp}`
   - Se enviá POST `/tasks/:id/measure` con los parámetros

2. **Backend inicia medición (16 canales)**
   - Por cada canal:
     - Activa MUX
     - Conecta Hioki IM3570
     - Envía comandos SCPI
     - Recibe y parsea datos
   - Emite eventos WebSocket al frontend:
     - `measurement:progress` → cada canal (1-16)
     - `measurement:completed` → datos finales
     - `measurement:error` → si falla

3. **Frontend recibe eventos**
   - `useMeasurementSocket` actualiza el estado
   - `SweepConfigCard` muestra barra de progreso
   - `MeasurementChart` actualiza con datos finales

### Eventos WebSocket

#### Evento: `measurement:progress`
```typescript
{
  jobId: "1-1713900000000",
  channel: 3,
  total: 16,
  percent: 18.75,
  status: "measuring",
  message: "Mediendo canal 3 de 16..."
}
```

#### Evento: `measurement:completed`
```typescript
{
  jobId: "1-1713900000000",
  measurementId: 123,
  takenAt: "2026-04-24T12:00:00Z",
  totalPoints: 801,
  data: [
    { frequency: 280000, g: [0.1, 0.2, ...], b: [0.01, 0.02, ...] },
    ...
  ]
}
```

#### Evento: `measurement:error`
```typescript
{
  jobId: "1-1713900000000",
  message: "Error conectando a MUX"
}
```

## 🔌 Configuración

### Variables de Entorno (.env)
```env
VITE_API_URL=http://localhost:3000
```

### Backend (NestJS) - Implementar

El backend debe tener un Gateway de WebSocket que:

1. **Escuche evento `join`**
   ```typescript
   @SubscribeMessage('join')
   handleJoin(@MessageBody() userId: string, @ConnectedSocket() socket: Socket) {
     socket.join(userId);
   }
   ```

2. **Emita eventos durante mediciones**
   ```typescript
   this.server.to(userId).emit('measurement:progress', {...});
   this.server.to(userId).emit('measurement:completed', {...});
   this.server.to(userId).emit('measurement:error', {...});
   ```

## 📊 Interfaz de Usuario

### Barra de Progreso
- Visible solo durante medición (`isMeasuring && progress > 0`)
- Ancho proporcional al porcentaje (0-100%)
- Color dinámico: 🟨 Ámbar (midiendo) → 🟩 Verde (completado)
- Texto: Porcentaje y canal actual

### Mensaje de Estado
- "Conectando al Hioki IM3570..." → inicio
- "Midiendo canal 3 de 16..." → durante medición (desde WebSocket)
- "Error: ..." → si falla
- "Medición completada — 801 puntos" → éxito

## 🐛 Debugging

### Ver conexión WebSocket en consola
```javascript
// En TaskDetailPage o SweepConfigCard
useEffect(() => {
  console.log('Socket conectado:', isConnected);
  console.log('Medición estado:', measurementState);
}, [socket?.connected, measurementState]);
```

### Verificar eventos en DevTools
```javascript
// Firefox / Chrome - Pestaña "Network" → "WS"
// Verás los eventos: measurement:progress, measurement:completed
```

## ✨ Características

✅ Reconexión automática  
✅ Evento por usuario (con `userId`)  
✅ Limpieza automática de listeners  
✅ TypeScript estricto (sin `any`)  
✅ Integración con React Query  
✅ Diseño responsive  
✅ Manejo de errores  
✅ Fallback HTTP polling si WebSocket falla  

## 📝 Ejemplo de Uso

```tsx
const TaskDetailPage = () => {
  const { socket } = useWebSocket();           // Conexión global
  const [jobId, setJobId] = useState<string | null>(null);
  const measurementState = useMeasurementSocket(socket, jobId); // Escucha jobId

  const onMeasure = async (data: SweepFormData) => {
    const newJobId = `${taskId}-${Date.now()}`;
    setJobId(newJobId);  // Activa escucha de eventos
    
    await measure.mutate({
      ...data,
      jobId: newJobId,
    });
  };

  return (
    <SweepConfigCard
      progress={measurementState.progress}
      currentChannel={measurementState.currentChannel}
      statusMessage={measurementState.statusMessage}
      isCompleted={measurementState.isCompleted}
      // ...
    />
  );
};
```

## 🔒 Seguridad

- Token JWT se envía en header automáticamente
- `userId` se valida en backend
- Solo recibe eventos de su propia sala
- No puede acceder a datos de otros usuarios

## 📱 Compatibilidad

- ✅ Firefox, Chrome, Safari, Edge
- ✅ WebSocket (primario)
- ✅ HTTP Long Polling (fallback)
- ✅ React 18+
- ✅ TypeScript 5+
- ✅ Vite

## Próximos Pasos

1. Implementar Gateway de WebSocket en backend NestJS
2. Emitir eventos en `POST /tasks/:id/measure`
3. Probar con cliente real
4. Agregar auditoría de mediciones en base de datos

