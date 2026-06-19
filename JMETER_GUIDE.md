# JMeter Load Testing Guide - CineLog

## Instalación de JMeter

JMeter es una herramienta Java para pruebas de carga. Necesitas:

### Requisitos
- Java 8+ instalado
- 2GB RAM disponible mínimo

### Instalación

#### Linux/Mac
```bash
# Descargar JMeter desde Apache
wget https://archive.apache.org/dist/jmeter/binaries/apache-jmeter-5.6.2.tgz
tar -xzf apache-jmeter-5.6.2.tgz
cd apache-jmeter-5.6.2

# Agregarlo al PATH
export PATH=$PATH:$(pwd)/bin
```

#### Windows
1. Descargar desde: https://jmeter.apache.org/download_jmeter.html
2. Extraer el ZIP
3. Agregar `\bin` a las variables de entorno del sistema
4. O ejecutar directamente: `jmeter\bin\jmeter.bat`

#### Docker (Alternativa)
```bash
docker run -it --rm -v $(pwd):/workspace apache/jmeter:latest
```

---

## Estructura de Pruebas

### Archivo JMeter (.jmx)
Ubicación: `perf/jmeter/cine-catalogo-load-test.jmx`

**3 Thread Groups (Escenarios paralelos):**

1. **Flujo Completo (50 usuarios)**
   - Login → Búsqueda → Detalle película → (Agregar a lista)
   - Ramp-up: 2.5 minutos
   - Duración: 5 minutos total
   - Think time: 2 segundos entre requests

2. **Solo Búsquedas (30 usuarios)**
   - Búsqueda de "Inception"
   - Búsqueda de "Breaking Bad"
   - Ramp-up: 2.5 minutos
   - Duración: 5 minutos
   - Think time: 1 segundo entre requests

3. **Health Checks (20 usuarios)**
   - `/api/health` (Backend)
   - `/` (Frontend root)
   - Ramp-up: 2.5 minutos
   - Duración: 5 minutos
   - Think time: 3 segundos entre requests

**Total: 100 usuarios simultáneos**

---

## Ejecutar las Pruebas

### Opción 1: Windows (PowerShell)
```powershell
# Asegúrate de que el dev server y backend estén corriendo
# Terminal 1:
npm run dev -- --host 127.0.0.1

# Terminal 2: Backend (según tu setup)
npm run dev:backend  # o node backend/index.js

# Terminal 3: Ejecutar JMeter
.\perf\jmeter\run-jmeter-load-test.ps1
```

### Opción 2: Linux/Mac (Bash)
```bash
# Terminal 1:
npm run dev -- --host 127.0.0.1

# Terminal 2:
npm run dev:backend

# Terminal 3:
chmod +x ./perf/jmeter/run-jmeter-load-test.sh
./perf/jmeter/run-jmeter-load-test.sh
```

### Opción 3: CLI Directo
```bash
jmeter -n \
  -t ./perf/jmeter/cine-catalogo-load-test.jmx \
  -l ./test-results/jmeter/results.jtl \
  -e -o ./test-results/jmeter/report \
  -j ./test-results/jmeter/jmeter.log
```

---

## Resultados y Métricas

### Archivos Generados
- **results.jtl** - Datos raw en formato XML (todos los requests)
- **report/index.html** - Dashboard interactivo HTML5
- **jmeter.log** - Log de ejecución

### Métricas Disponibles en el Reporte

#### 1. Response Times (Latencia)
- **Average** - Promedio de tiempo de respuesta
- **Min** - Menor tiempo registrado
- **Max** - Mayor tiempo registrado
- **p50 (Mediana)** - 50% de las requests son más rápidas
- **p90** - 90% de las requests son más rápidas (Importante para SLA)
- **p95** - 95% de las requests son más rápidas (Crítico para UX)
- **p99** - 99% de las requests son más rápidas

#### 2. Throughput
- **Requests/segundo** - Cuántas requests puede procesar el sistema
- **Datos/segundo** - Throughput en bytes

#### 3. Error Rate
- **% Error** - Porcentaje de requests fallidos
- **Error Count** - Número absoluto de fallos

#### 4. Statistics Table
- Por cada sampler (request), detalle completo de:
  - # Samples (total requests)
  - Average latency
  - Min/Max
  - Percentiles
  - Error rate
  - Throughput

#### 5. Graphs
- Response times over time (detecta degradación)
- Throughput over time
- Latency percentiles
- Response time distribution

---

## Comparativa: K6 vs JMeter

### K6 (Scripts actuales en `/perf/`)
**Ventajas:**
- Fácil de codificar (JavaScript)
- Mejor para pruebas complejas con lógica
- Excelente soporte para variables y correlaciones
- Métricas en tiempo real en CLI

**Desventajas:**
- Menos visual
- Requiere JavaScript
- Menos listos/presets visuales

### JMeter (Nuevo)
**Ventajas:**
- GUI visual e intuitiva
- No requiere programación
- Mejor para pruebas simples y rápidas
- Dashboard HTML muy completo
- Mejor para load testing clásico

**Desventajas:**
- Consume más RAM (Java)
- Menos flexible para lógica compleja
- Curva de aprendizaje GUI

**Recomendación:**
- **K6**: Para pruebas complejas, spike tests, soak tests
- **JMeter**: Para load testing simple, debugging visual, documentación de resultados

---

## Configuración Personalizada

### Cambiar número de usuarios
Edita el archivo `.jmx` o en la GUI:
1. Abre `cine-catalogo-load-test.jmx` con JMeter GUI:
   ```bash
   jmeter -t ./perf/jmeter/cine-catalogo-load-test.jmx
   ```
2. Haz clic en cada "Thread Group"
3. Cambia "Number of Threads"

### Cambiar URLs (si backend está en otra máquina)
Edita las variables al inicio del `.jmx`:
- `BACKEND_BASE_URL` → `http://tu-servidor:3001`
- `FRONTEND_BASE_URL` → `http://tu-servidor:5173`

### Agregar más requests
1. Abre el `.jmx` en JMeter GUI
2. Right-click en un Thread Group
3. Add → Sampler → HTTP Request
4. Configura URL, método, assertions
5. Guarda y ejecuta

---

## Interpretación de Resultados

### Ejemplo de Reporte Exitoso
```
Label              | # Samples | Average | Min | Max  | p95  | p99  | Error % | Throughput
================================================================================
01-Login-Backend   | 1000      | 245ms   | 120 | 890  | 450  | 650  | 0.0%    | 3.33/sec
02-Buscar-Backend  | 1000      | 340ms   | 150 | 1200 | 650  | 900  | 0.1%    | 3.33/sec
03-Detalle-Backend | 1000      | 180ms   | 90  | 550  | 320  | 450  | 0.0%    | 3.33/sec
TOTAL              | 3000      | 255ms   | 90  | 1200 | 450  | 800  | 0.03%   | 10.00/sec
```

**Análisis:**
- Error rate < 1% ✅ (Aceptable)
- p95 < 500ms ✅ (Buen tiempo de respuesta)
- Throughput 10/sec = 36,000 req/hora ✅

### Red Flags 🚨

| Métrica | Alerta |
|---------|--------|
| Error rate > 5% | Backend sobrecargado |
| p95 > 1000ms | Performance degradada |
| p99 >> p95 | Outliers/cuellos de botella |
| Throughput decayendo | Agotamiento de recursos |

---

## Scripts de Utilidad

### Limpiar resultados anteriores
```bash
rm -rf ./test-results/jmeter/report_*
```

### Comparar dos pruebas
```bash
# Genera reportes separados y compárelos manualmente
# JMeter genera HTML que puedes abrir lado a lado
```

### Ejecutar en batch
Crear `run-all-perf-tests.sh`:
```bash
#!/bin/bash
echo "Ejecutando pruebas K6 y JMeter..."
npm run perf:load
./perf/jmeter/run-jmeter-load-test.sh
npm run perf:stress
echo "Todas las pruebas completadas"
```

---

## Troubleshooting

### ❌ "jmeter: command not found"
```bash
# Asegúrate de que JMETER_HOME esté en PATH
export PATH=$PATH:/ruta/a/apache-jmeter-5.6.2/bin
```

### ❌ "Address already in use"
El puerto 5173 o 3001 está en uso:
```bash
# Buscar qué proceso usa el puerto
lsof -i :5173  # macOS/Linux
netstat -ano | findstr :5173  # Windows
```

### ❌ "Connection refused"
- Verifica que frontend esté corriendo: `npm run dev`
- Verifica que backend esté corriendo
- Verifica URLs en variables de JMeter

### ❌ "Out of Memory"
Aumenta la memoria disponible:
```bash
export JVM_ARGS="-Xmx4g -Xms4g"
jmeter -t test-plan.jmx
```

---

## Referencias

- [Apache JMeter Docs](https://jmeter.apache.org/usermanual/index.html)
- [Best Practices](https://jmeter.apache.org/usermanual/best-practices.html)
- [Functions Reference](https://jmeter.apache.org/usermanual/functions.html)

---

## Próximos Pasos

- ✅ Crear prueba básica (Ya hecho)
- ⏳ Agregar correlación (extraer tokens dinámicamente)
- ⏳ Agregar datos CSV (múltiples usuarios reales)
- ⏳ Integrar con CI/CD (Jenkins, GitHub Actions)
- ⏳ Alertas automáticas si performance degrada
