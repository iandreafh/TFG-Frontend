import { Component, OnInit, Renderer2 } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { AuthService } from 'src/app/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

interface Project {
  title: string;
  description: string;
  members: string;
  lastUpdate: string;
  color: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  errorMessage: string = '';
  currentUserId: string = '';
  userData: any = {};
  userName: string = '';
  today = this.formatDate(new Date());
  iColor = 0;
  
  constructor(private userService: UserService, private authService: AuthService, private renderer: Renderer2) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.userData = user;
        this.currentUserId = user.Id; // Assuming ID is available in the user object
        this.userName = this.userData.Nombre.split(" ", 1);
      }
      this.setRandomBackgroundColor();
    });
  }

    
  setRandomBackgroundColor(): string {
    const colors = [
      '#f75573', // Rojo
      '#ed7d2b', // Naranja
      '#4a99da', // Azul
      '#07cdae', // Verde
      '#985bc9', // Morado
      '#f9c60f'  // Amarillo
    ];

    this.iColor = (this.iColor == 5) ? 0 : this.iColor+1;

    return colors[this.iColor];
  }


  formatDate(date: Date): string {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const monthName = months[date.getMonth()];
    const year = date.getFullYear();

    return `${dayName}, ${day} de ${monthName} de ${year}`;
  }

  projects: Project[] = [
    {
      title: 'Boda M&Q',
      description: 'Organización de la boda de María y Quique.',
      members: 'María Varo, Quique Ruix',
      lastUpdate: 'Hace 3 horas',
      color: this.setRandomBackgroundColor()
    },
    {
      title: 'Sistemas Operativos',
      description: 'Trabajo de Sistemas Operativos, asignatura de 2º Curso de GIIISI.',
      members: 'Pablo Casas Gómez',
      lastUpdate: 'Hace 2 días',
      color: this.setRandomBackgroundColor()
    },
    {
      title: 'DELEEPS',
      description: 'Proyecto de organización para la Delegación de Estudiantes de la Escuela Politécnica Superior.',
      members: 'Pedro J. Lázaro, Natalia Berméjo y 5 más',
      lastUpdate: 'Hace 1 semana',
      color: this.setRandomBackgroundColor()
    },
    {
      title: 'RITSI',
      description: 'Breve descripción del contenido del proyecto, información útil que distinga el proyecto de otros.',
      members: 'Javier Salvatierra, Nuria Mir y 28 más',
      lastUpdate: 'Hace 1 mes',
      color: this.setRandomBackgroundColor()
    },
    {
      title: 'RITSI',
      description: 'Breve descripción del contenido del proyecto, información útil que distinga el proyecto de otros.',
      members: 'Javier Salvatierra, Nuria Mir y 28 más',
      lastUpdate: 'Hace 1 mes',
      color: this.setRandomBackgroundColor()
    },
    {
      title: 'RITSI',
      description: 'Breve descripción del contenido del proyecto, información útil que distinga el proyecto de otros.',
      members: 'Javier Salvatierra, Nuria Mir y 28 más',
      lastUpdate: 'Hace 1 mes',
      color: this.setRandomBackgroundColor()
    },
    {
      title: 'RITSI',
      description: 'Breve descripción del contenido del proyecto, información útil que distinga el proyecto de otros.',
      members: 'Javier Salvatierra, Nuria Mir y 28 más',
      lastUpdate: 'Hace 1 mes',
      color: this.setRandomBackgroundColor()
    }
    // Puedes seguir añadiendo más proyectos siguiendo la estructura
  ];


  add() {
    // Tu lógica para añadir algo
    console.log('Function add() called');
  }

}
