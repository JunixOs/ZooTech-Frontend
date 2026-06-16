# Git Workflow

## Branch Naming

```
{NOMBRE}_{APELLIDO}/{tipo}/{descripcion-corta}
```

| Tipo | Uso |
|---|---|
| `feature` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `refactor` | Refactorización sin cambio de comportamiento |
| `docs` | Solo documentación |
| `chore` | Mantenimiento, dependencias, config |

### Ejemplos

```
PAUL_TARAZONA/feature/triaje-list
JUAN_RAMOS/fix/auth-redirect
AKEMI_ZAMBRANO/refactor/sanidad-facade
SEBASTHIAN_RAMIREZ/docs/arquitectura
```

## Commits

Formato: `tipo(scope): descripción`

| Tipo | Cuándo usar |
|---|---|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `refactor` | Cambio de código sin cambiar comportamiento |
| `docs` | Solo documentación |
| `style` | Formato, espacios, sin cambio de código |
| `test` | Agregar o corregir tests |
| `chore` | Build, dependencias, config |

### Ejemplos

```
feat(sanidad): agregar lista de triajes
fix(auth): corregir redirect después de login
docs(architecture): agregar documentación de capas
style(shared): formatear button component con prettier
test(sanidad): agregar tests de triaje-list
chore(deps): actualizar Angular a 21.2
```

### Reglas

- **Imperativo**: "agregar" no "agregado" ni "agregando"
- **Minúsculas**: todo en minúsculas
- **Sin punto** al final
- **Scope opcional**: usa el módulo o capa afectada

## Pull Requests

### Antes de crear un PR

1. Tu branch está al día con `develop`
2. Los tests pasan: `pnpm test`
3. El build funciona: `pnpm build`
4. Código formateado: `pnpm exec prettier --write .`
5. No hay `console.log` ni código comentado

### Título del PR

```
feat(sanidad): Implementar lista de triajes
```

### Descripción del PR

```markdown
## Qué hace

Describe qué cambia y por qué.

## Cambios

- Agregar TriajeList component
- Agregar TriajeContainer con estado
- Agregar ruta /sanidad/triaje

## Screenshots

Si hay cambios visuales, incluir captura.

## Tests

- [ ] Tests unitarios pasan
- [ ] Build funciona
```

## Branches Principales

| Branch | Propósito |
|---|---|
| `main` | Producción — solo merges desde develop |
| `develop` | Integración — aquí se mergean las features |
| `{user}/feature/*` | Desarrollo de features individuales |

## Flujo

```
1. Crear branch desde develop:
   git checkout develop
   git pull origin develop
   git checkout -b TU_NOMBRE/feature/descripcion

2. Trabajar y commitear:
   git add .
   git commit -m "feat(modulo): descripción"

3. Push y PR a develop:
   git push origin TU_NOMBRE/feature/descripcion
   # Crear PR en GitHub → develop

4. Después del merge:
   git checkout develop
   git pull origin develop
   git branch -d TU_NOMBRE/feature/descripcion
```

## No Hacer

- ❌ No commitear a `main` o `develop` directamente
- ❌ No hacer force push a branches compartidos
- ❌ No commitear `node_modules/`, `dist/`, `.angular/`
- ❌ No commitear archivos `.env` o secretos
- ❌ No dejar branches mergeadas sin borrar
