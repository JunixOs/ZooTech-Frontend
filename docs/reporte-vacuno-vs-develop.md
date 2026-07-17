# Reporte: Rama VACUNO vs develop

**Fecha:** 2026-07-06
**Autor:** Revisión técnica previa a integración de VACUNO en develop
**Alcance:** Comparación de la rama `VACUNO` (commit `87509b5`, previo a cualquier merge) contra `develop`, a raíz de un intento de integración que reveló 10 conflictos de merge y varios problemas estructurales.

Cada hallazgo de este reporte fue verificado directamente sobre el repositorio (historial de git, contenido de archivos, builds y ejecución de tests), no son apreciaciones subjetivas.

---

## Resumen ejecutivo

La rama VACUNO acumuló **1.5 meses de trabajo (20 commits) sin reintegrar develop** más que una vez a mitad de camino. Esa falta de cadencia de integración es la causa raíz de casi todos los problemas de este reporte: duplicación de lógica compartida, refactors que colisionan, pipeline de CI/CD desactualizado y un lockfile fuera de sincronía. Además, se detectó una **suite de tests completamente rota desde antes de cualquier intento de merge**, que nadie del equipo había detectado.

Ninguno de estos puntos bloquea el valor funcional del módulo (vacunos + fecundación), pero todos deben resolverse antes de aprobar la integración a develop.

---

## 1. Divergencia larga sin reintegrar develop

**Hallazgo:** 20 commits propios en VACUNO entre el 21 de mayo y el 6 de julio de 2026, con un único merge intermedio de develop (`fc6af5f Merge develop and fix UI discrepancies`). Después de ese punto, la rama nunca volvió a traer los cambios de develop, mientras este último absorbía refactors grandes en otros módulos (celo, leche, sanidad) y agregaba componentes compartidos nuevos.

**Impacto:** Al intentar el merge final aparecieron **10 conflictos**, varios de ellos no resolubles con un simple "elegir un lado" porque ambas ramas habían reescrito la misma pieza de forma independiente.

**Recomendación:** Mergear o rebasear develop en las ramas de feature activas con una cadencia regular (semanal como máximo), no acumular semanas de trabajo divergente.

---

## 2. Duplicación de una abstracción compartida ya existente

**Hallazgo:** `src/app/shared/utils/server-table-state.ts` ya existía en develop, exportando `createServerTableState` (implementado con RxJS + debounce, usado en producción por el módulo `celo`). VACUNO creó **una segunda implementación con el mismo nombre de archivo y de función**, pero con una API completamente distinta (`setSearch/buildQuery/applyPage` en vez de un callback `fetchPage`).

**Impacto:** De haberse mergeado sin intervención manual, la versión de VACUNO habría sobrescrito silenciosamente la de develop, rompiendo el módulo `celo` en producción.

**Recomendación:** Antes de crear un helper nuevo en `shared/utils` o `shared/components`, revisar si ya existe algo equivalente en develop. Si dos personas necesitan resolver el mismo problema (paginación server-side, en este caso), coordinarlo en vez de duplicarlo.

---

## 3. Refactor de nombres desincronizado entre ramas

**Hallazgo:** develop ya había renombrado la clase `VacunosApiService` → `VacunoService`, y sus métodos `listarVacunos/registrarVacuno/actualizarVacuno` → `getAll/create/updateById`. VACUNO nunca se enteró de ese refactor y siguió usando los nombres viejos. Además, VACUNO extrajo los DTOs a un archivo separado (`infrastructure/dtos/vacunos.dtos.ts`), mientras que en develop siguen declarados inline dentro de `vacunos.api.service.ts`.

**Impacto:** Conflicto de merge en `vacunos.facade.ts` y `vacunos.api.service.ts` que no era resoluble por líneas — dos estructuras de archivo distintas para el mismo servicio, requirió reconciliar manualmente nombres de develop con implementación de VACUNO.

**Recomendación:** Mismo origen que el punto 1: solo pasa cuando dos ramas refactorizan lo mismo en paralelo sin visibilidad mutua. Reintegrar develop seguido habría expuesto este choque mucho antes y con menos costo.

---

## 4. Pipeline de CI/CD desactualizado

**Hallazgo:** `azure-pipelines.yml` de VACUNO **no incluye el paso "Deploy to IIS"** que sí existe en develop. En su lugar, corre un paso duplicado y obsoleto de tests + análisis de Sonar sin ningún deploy real.

**Impacto:** Si este archivo se hubiera mergeado sin revisión manual, el deploy automático a producción se habría perdido silenciosamente en la próxima ejecución del pipeline sobre develop.

**Recomendación:** Cuando el equipo de plataforma/DevOps actualiza el pipeline compartido, notificar o forzar la actualización en las ramas de feature activas, no dejar que se descubra recién en el merge.

---

## 5. Lockfile desincronizado del package.json

**Hallazgo:** `pnpm-lock.yaml` en VACUNO no contenía entradas para `html2canvas` ni `jspdf`, a pesar de que ambas ya estaban declaradas en `package.json`. Intentar instalar con `pnpm install --frozen-lockfile` (el modo estricto que usa cualquier pipeline de CI serio) falla directamente con `ERR_PNPM_OUTDATED_LOCKFILE`.

**Impacto:** Riesgo de instalaciones no reproducibles; cualquier pipeline que use instalación estricta fallaría antes de llegar a build o test.

**Recomendación:** Después de agregar o modificar dependencias en `package.json`, siempre correr `pnpm install` y commitear el `pnpm-lock.yaml` resultante. No editar el lockfile a mano ni asumir que "ya va a resolver solo".

---

## 6. Suite de tests rota desde antes del merge — nadie la corrió

**Hallazgo:** El comando real que usa la pipeline (`pnpm run test:ci` → `vitest run --coverage`) fallaba con **125 de 163 tests** en VACUNO, confirmado aislando el commit `87509b5` en un workspace limpio, **antes de que se tocara nada del merge**. Causa raíz: `test:ci` invoca `vitest` directamente, sin pasar por el builder `@angular/build:unit-test` de Angular, y `src/test-setup.ts` nunca llamaba explícitamente a `setupTestBed()` / `TestBed.initTestEnvironment()`. Esto rompía absolutamente **todos** los specs de Angular en el proceso, incluyendo componentes sin ninguna relación con el módulo vacuno (ej. `sidebar-nav-item.spec.ts`, `paginator.component.spec.ts`).

**Impacto:** El equipo estuvo semanas trabajando sobre una rama con la suite de tests 100% inutilizable vía el comando de CI, sin que nadie lo detectara.

**Recomendación:** Correr `pnpm run test:ci` (el comando exacto de la pipeline, no solo `ng test` en local) como parte del checklist antes de abrir o actualizar una PR. Este bug puntual ya se corrigió en un commit aparte (agregando la llamada explícita a `setupTestBed()` en `test-setup.ts`), pero el punto de fondo es de proceso: la suite de tests no se estaba validando con el comando real de CI.

---

## 7. Código de práctica/aprendizaje commiteado al repositorio

**Hallazgo:** `src/app/modules/practica/presentation/hola-mundo/hola-mundo.component.ts` y `src/app/modules/practica/presentation/practica-uno/practica-uno.component.ts` — dos archivos de **0 bytes**, sin ruta asociada, sin ningún uso, introducidos en el commit `5c5daeb Mejora del modulo vacuno, corrigiendo inconsistencias`.

**Impacto:** Ninguno funcional (no están enrutados), pero es basura de scratch/aprendizaje que no debería haber pasado un commit, menos aún llegar a una PR.

**Recomendación:** Revisar el `git status`/diff completo antes de cada commit. Configurar o reforzar el hábito de no commitear archivos de práctica personal en el repositorio del equipo.

---

## 8. Cobertura de tests nula en los módulos nuevos

**Hallazgo:** Ni `vacunos` ni `reproduccion/fecundacion` tienen un solo archivo `.spec.ts`. Esto también es cierto hoy en develop para esos mismos módulos, por lo que no es una regresión exclusiva de VACUNO, pero al ser el módulo que aporta la mayor cantidad de lógica nueva (facades, servicios HTTP, mappers de genealogía), es el que más lo necesita.

**Recomendación:** Exigir cobertura mínima de tests unitarios (facade + servicio HTTP como mínimo) como criterio de aceptación para módulos nuevos, antes de aprobar la PR.

---

## Checklist para el equipo de VACUNO antes de reintentar la integración

- [ ] Eliminar `src/app/modules/practica/` completo.
- [ ] Correr `pnpm install` y commitear el `pnpm-lock.yaml` actualizado.
- [ ] Correr `pnpm run test:ci` localmente y confirmar que pasa 100% antes de abrir la PR.
- [ ] Rebasear/mergear `develop` en `VACUNO` para traer el pipeline actualizado (`azure-pipelines.yml`) y los refactors de nombres (`VacunoService`, `getAll/create/updateById`).
- [ ] Revisar si `server-table-state.ts` de develop ya cubre la necesidad de paginación server-side antes de mantener una segunda implementación propia.
- [ ] Agregar al menos tests básicos de facade y servicio HTTP para `vacunos` y `fecundacion`.
