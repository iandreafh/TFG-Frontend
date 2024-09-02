import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';

@Injectable({
  providedIn: 'root'
})
export class DateService extends NativeDateAdapter {
  constructor() {
    // Configura el adaptador de fecha para el idioma español (es-ES)
    super('es-ES');
  }

  // Sobrescribe el método de formato de fecha predeterminado para devolverla en el formato 'dd/MM/yyyy'
  override format(date: Date, displayFormat: object): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Formatea una fecha en formato ISO a una cadena numérica 'yyyy-MM-dd HH:mm'
  formatDateNumeric(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);
    return `${year}-${month}-${day} ${hours}:${minutes}h`;
  }

  // Devuelve la fecha en un formato de cadena más legible: 'Día, dd de Mes de yyyy'
  formatDateString(date: Date): string {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const monthName = months[date.getMonth()];
    const year = date.getFullYear();

    return `${dayName}, ${day} de ${monthName} de ${year}`;
  }
  
  convertToTimestamp(datePart: string, timePart?: string): string {

    // Separar día, mes, año
    const [day, month, year] = datePart.split('/').map(Number);
    let date = null;
    if (timePart) {
      // Crear un objeto DateTime si manda la hora
      const [hours, minutes, seconds] = timePart.split(':').map(Number);
      date = new Date(Date.UTC(year, month - 1, day, hours || 0, minutes || 0, seconds || 0));
    } else {
      date = new Date(Date.UTC(year, month - 1, day)); // Crear la fecha en UTC, meses en JS son de 0 a 11
    }
  
    // Formatear la fecha a 'YYYY-MM-DD HH:mm:ss'
    const formattedDate = date.toISOString().slice(0, 19).replace('T', ' ');
  
    return formattedDate;
  }
}
