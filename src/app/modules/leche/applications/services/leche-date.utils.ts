/** Pure helper: formats a Date as DD/M/YYYY without locale API dependency. */
export function formatFecha(date: Date): string {
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

/** Pure helper: formats a Date as HH:mm without locale API dependency. */
export function formatHora(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

/** Pure helper: determines turno (shift) based on the hour of the day. */
export function getTurno(date: Date): string {
  return date.getHours() < 12 ? 'manana' : 'tarde';
}
