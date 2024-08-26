import { Component, OnInit } from '@angular/core';
import { DateService } from '../../services/date.service';
import { AuthService } from '../../services/auth.service';
import { ProjectService } from '../../services/project.service';
import { MeetingService } from '../../services/meeting.service';
import { MatDialog } from '@angular/material/dialog'; 
import { AddFormModalComponent } from '../../components/add-form-modal/add-form-modal.component';
import { EditFormModalComponent } from '../../components/edit-form-modal/edit-form-modal.component';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent implements OnInit {

  isLoading: boolean = true;  // Indica si el contenido está cargando
  errorMessage: string = '';
  currentUserId: string = '';
  userData: any = {};
  userName: string = '';
  today = this.dateService.formatDateString(new Date()); // Formatea la fecha de hoy
  iColor = 0; // Índice para el color de las tarjetas
  proyectos: any[] = [];
  tareas: any[] = [];  // Almacena las tareas cargadas
  reuniones: any[] = [];  // Almacena las reuniones cargadas
  mensajesNoLeidos: number = 0;

  showClosestMeetings: boolean = true;  // Controla el estado del filtro de reuniones

  // Variables de paginación para tareas
  taskPage: number = 0;
  taskLimit: number = 5;
  taskPageStart: number = 0;
  taskHasNextPage: boolean = false;

  // Variables de paginación para reuniones
  meetingPage: number = 0;
  meetingLimit: number = 5;
  meetingPageStart: number = 0;
  meetingHasNextPage: boolean = false;
  
  constructor(
    private authService: AuthService,
    private projectService: ProjectService, 
    private meetingService: MeetingService, 
    private dateService: DateService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.userData = user;
        this.currentUserId = user.Id;
        this.userName = this.userData.Nombre.split(" ", 1);
        
        this.loadTopActiveTasks();  // Cargar tareas activas
        this.loadMeetings();  // Cargar reuniones
      }
    });
  }

  // Cargar las tareas activas para el usuario actual
  loadTopActiveTasks() {
    this.projectService.getTopActiveTask(this.currentUserId, this.taskLimit + 1, this.taskPageStart).subscribe({
      next: (tareas: any) => {
        if (tareas.length > this.taskLimit) {
          this.taskHasNextPage = true;
          tareas.pop(); // Eliminar la tarea extra para el cálculo de la paginación
        } else {
          this.taskHasNextPage = false;
        }

        this.tareas = tareas.map((tarea: any) => {
          tarea.color = this.setBackgroundColor(); // Asigna un color a la tarea
          return tarea;
        });
        this.isLoading = false; // Indica que la carga ha terminado
      },
      error: (error: any) => {
        console.error('Error al obtener las tareas', error);
        if (this.taskPage > 0) {
          this.prevPage('tareas', true);
        }
      }
    });
  }

  // Cargar reuniones según el estado del filtro
  loadMeetings() {
    this.isLoading = true;

    const meetingRequest = this.showClosestMeetings 
      ? this.meetingService.getClosestMeetings(this.meetingLimit + 1, this.meetingPageStart)
      : this.meetingService.getAllMeetings(this.meetingLimit + 1, this.meetingPageStart);

    meetingRequest.subscribe({
      next: (reuniones: any) => {
        if (reuniones.length > this.meetingLimit) {
          this.meetingHasNextPage = true;
          reuniones.pop(); // Eliminar la reunión extra para el cálculo de la paginación
        } else {
          this.meetingHasNextPage = false;
        }

        this.reuniones = reuniones.map((reunion: any) => {
          reunion.color = this.setBackgroundColor();
          reunion.Fechahora = this.dateService.formatDateNumeric(reunion.Fechahora);

          const participacion = reunion.Participantes.find((p: any) => p.Idusuario === parseInt(this.currentUserId));
          reunion.RespuestaUsuario = participacion ? participacion.Respuesta : 'PENDIENTE';

          return reunion;
        });
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al obtener las reuniones', error);
        if (this.meetingPage > 0) {
          this.prevPage('reuniones', true);
        }
      }
    });
  }

  // Alterna el estado del filtro para mostrar reuniones cercanas
  toggleClosestMeetings() {
    this.showClosestMeetings = !this.showClosestMeetings;
    this.meetingPage = 0;
    this.meetingPageStart = 0;
    this.loadMeetings();
  }

  // Asigna un color de fondo a las tareas/reuniones de manera cíclica
  setBackgroundColor(): string {
    const colors = [
      '#4a99da', 
      '#ed7d2b', 
      '#985bc9', 
    ];

    this.iColor = (this.iColor == 3) ? 0 : this.iColor;
    return colors[this.iColor++];
  }

  // Avanza a la siguiente página de tareas o reuniones
  nextPage(type: string) {
    if (type === 'tareas' && this.taskHasNextPage) {
      this.taskPage++;
      this.taskPageStart = this.taskPage * this.taskLimit;
      this.loadTopActiveTasks();
    } else if (type === 'reuniones' && this.meetingHasNextPage) {
      this.meetingPage++;
      this.meetingPageStart = this.meetingPage * this.meetingLimit;
      this.loadMeetings();
    }
  }

  // Retrocede a la página anterior de tareas o reuniones
  prevPage(type: string, fromError: boolean = false) {
    if (type === 'tareas' && this.taskPage > 0) {
      this.taskPage--;
      this.taskPageStart = this.taskPage * this.taskLimit;
      this.loadTopActiveTasks();
    } else if (type === 'reuniones' && this.meetingPage > 0) {
      this.meetingPage--;
      this.meetingPageStart = this.meetingPage * this.meetingLimit;
      this.loadMeetings();
    }
  }

  // Abre un modal para crear una nueva reunión
  newMeeting() {
    const dialogRef = this.dialog.open(AddFormModalComponent, {
      width: '600px',
      data: {
        title: 'Convocar nueva reunión',
        fields: [
          { label: 'Título', name: 'Titulo', type: 'text', required: true },
          { label: 'Descripción', name: 'Descripcion', type: 'textarea', required: false },
          { label: 'Modalidad*', name: 'Modalidad', type: 'radio-buttons', required: true, options: [
            { value: 'Presencial', label: 'Presencial' },
            { value: 'Virtual', label: 'Virtual' },
            { value: 'Híbrida', label: 'Híbrida' }
          ]},
          { label: 'Fecha', name: 'Fecha', type: 'date', required: true },
          { label: 'Hora', name: 'Hora', type: 'time', required: true },
          { label: 'Duración (minutos)', name: 'Duracion', type: 'number', required: true },
          { label: 'Participantes', name: 'Participantes', type: 'email-list', required: true }
        ]
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const dateTime = this.dateService.convertToTimestamp(result.Fecha, result.Hora);
        result.FechaHora = dateTime;
        delete result.Fecha;
        delete result.Hora;
  
        this.meetingService.createMeeting(result).subscribe({
          next: (response: any) => {
            this.loadMeetings();
          },
          error: (error: any) => {
            console.error('Error al convocar la nueva reunión: ', error);
            this.errorMessage = error.error.error;
            setTimeout(() => this.errorMessage = '', 8000);
          }
        });
      }
    });
  }

  // Abre un modal para editar una reunión existente
  editMeeting(reunion: any) {
    const dialogRef = this.dialog.open(EditFormModalComponent, {
        width: '600px',
        data: {
            title: 'Detalles de la reunión',
            fields: [
                { label: 'Título', name: 'Titulo', type: 'text', required: true },
                { label: 'Descripción', name: 'Descripcion', type: 'textarea', required: false },
                { label: 'Modalidad', name: 'Modalidad', type: 'text', required: true },
                { label: 'Fecha y hora', name: 'FechaHora', type: 'convocatoria', required: true },
                { label: 'Duración (minutos)', name: 'Duracion', type: 'number', required: true },
                { label: 'Respuesta', name: 'Respuesta', type: 'radio-buttons', required: true, options: [
                    { value: 'ACEPTADA', label: 'Aceptada' },
                    { value: 'PENDIENTE', label: 'Pendiente' },
                    { value: 'RECHAZADA', label: 'Rechazada' }
                ]},
                { label: 'Participantes', name: 'Participantes', type: 'participants-list', required: false, participants: reunion.Participantes },
            ],
            meeting: reunion,
            canEdit: this.currentUserId === reunion.Idcreador,
            isCreator: this.currentUserId === reunion.Idcreador
        }
    });

    dialogRef.afterClosed().subscribe(result => {
        if (result) {
            if (result.deleted) {
                this.meetingService.deleteMeetingPermanently(reunion.Id).subscribe(() => {
                    this.loadMeetings();
                });
            } else {
                this.meetingService.answerMeeting(reunion.Id, result).subscribe(() => {
                    this.loadMeetings();
                });
            }
        }
    });
  }
  
  // Combina la fecha y la hora en un solo string de fecha y hora
  combineDateAndTime(date: string, time: string): string {
    const dateTimeString = `${date} ${time}`;
    return dateTimeString;
  }
  
}
