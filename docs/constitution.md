# Constitución — Diario de Estudio

1. **Stack mínimo:** solo HTML, CSS y JavaScript puros, sin dependencias, frameworks ni build.
2. **La spec manda:** `AGENTS.md` define el comportamiento; todo cambio de comportamiento lo actualiza en el mismo commit.
3. **Lógica separada de la interfaz:** las funciones de fechas y rachas no tocan el DOM ni `localStorage`.
4. **Tests sin dependencias:** cada regla de dominio tiene una comprobación que se ejecuta abriendo un archivo en el navegador, sin `npm`.
5. **Datos protegidos:** las sesiones solo viven en `localStorage` y nunca se borran ni se sobrescriben sin acción explícita del usuario.
6. **Idioma:** textos de interfaz y documentación en español, identificadores del código en inglés.
