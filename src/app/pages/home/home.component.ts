import { Component, OnInit } from '@angular/core';
import { DateService } from '../../services/date.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { ProjectService } from '../../services/project.service';
import { MeetingService } from '../../services/meeting.service';
import { MessageService } from '../../services/message.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {

  isLoading: boolean = true;
  errorMessage: string = '';
  currentUserId: string = '';
  userData: any = {};
  userName: string = '';
  today = this.dateService.formatDateString(new Date());
  iColor = 0;
  proyectos: any[] = [];
  tareas: any[] = [];
  reuniones: any[] = [];
  mensajesNoLeidos: number = 0;
  
  constructor(
    private authService: AuthService,
    private projectService: ProjectService, 
    private meetingService: MeetingService,
    private messageService: MessageService, 
    private dateService: DateService
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.userData = user;
        this.currentUserId = user.Id;
        this.userName = this.userData.Nombre.split(" ", 1);
        
        this.loadTopActiveProjects();
        this.loadTopActiveTasks();
        this.loadUnreadMessagesCount();
        this.loadClosestMeetings();
      }
      
    });
  }

  loadTopActiveProjects() {
    this.projectService.getTopActiveProjects(3).subscribe({
      next: (proyectos: any) => {
        this.proyectos = proyectos.map((proyecto: any) => {
          proyecto.color = this.setBackgroundColor();
          return proyecto;
        });
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al obtener los proyectos', error);
      }
    });
  }

  loadTopActiveTasks() {
    this.projectService.getTopActiveTask(this.currentUserId, 3).subscribe({
      next: (tareas: any) => {
        this.tareas = tareas.map((tarea: any) => {
          tarea.color = this.setBackgroundColor();
          return tarea;
        });
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al obtener las tareas', error);
      }
    });
  }

  loadClosestMeetings() {
    this.meetingService.getClosestMeetings(3).subscribe({
      next: (reuniones: any) => {
        this.reuniones = reuniones.map((reunion: any) => {
          reunion.color = this.setBackgroundColor();
          return reunion;
        });
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al obtener las reuniones', error);
      }
    });
  }

  loadUnreadMessagesCount() {
    this.messageService.getUnreadMessagesCount().subscribe({
      next: (data: any) => {
        this.mensajesNoLeidos = data.unread_count;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error al obtener los mensajes no leídos', error);
      }
    });
  }
  
  setBackgroundColor(): string {
    const colors = [
      '#4a99da', // Azul
      '#ed7d2b', // Naranja
      //'#07cdae', // Verde
      '#985bc9', // Morado
      //'#f9c60f',  // Amarillo
      //'#f75573', // Rojo
    ];

    this.iColor = (this.iColor == 3) ? 0 : this.iColor;

    return colors[this.iColor++];
  }

  add() {
    // Tu lógica para añadir algo
    console.log('Function add() called');
  }

}
