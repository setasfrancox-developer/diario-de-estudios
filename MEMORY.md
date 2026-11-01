# MEMORY.md — Diario de Estudio
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no
aporte.
## Estado actual
- v1 funcionando: registrar sesiones (fecha, tema, minutos), racha actual, mejor racha y lista de sesiones.
- Datos en localStorage.
- Conectado a GitHub (privado): origin → setasfrancox-developer/diario-de-estudios, rama main.
## Decisiones (y por qué)
- Sin backend ni dependencias: cualquiera debe poder abrirlo con doble clic.
- Fecha editable en el formulario: permite registrar días pasados y ver la racha crecer.
- Mejor racha calculada siempre desde las sesiones (no guardada aparte): evita desincronización.
- No se permiten fechas futuras (max en el input + guarda en el submit): una sesión futura inflaba la mejor racha sin contar en la actual.
- Constitución aprobada en `docs/constitution.md` (6 principios): guía de lo innegociable del proyecto.
- Etiqueta de racha en singular cuando vale 1 ("día seguido"), igual que la mejor racha.
## Aprendizajes y errores a evitar
- (vacío por ahora)
## Próximos pasos
- (vacío por ahora)