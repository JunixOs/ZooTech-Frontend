export class DateUtils {
  static formatDate(date: Date, locale: string = 'es-ES'): string {
    return new Intl.DateTimeFormat(locale).format(date);
  }
}
