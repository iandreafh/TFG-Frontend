import { Component, OnInit } from '@angular/core';
import { DateService } from '../../services/date.service';
import { AuthService } from '../../services/auth.service';
import { ProjectService } from '../../services/project.service';
import { AddFormModalComponent } from '../../components/add-form-modal/add-form-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-my-projects',
  templateUrl: './my-projects.component.html',
  styleUrls: ['./my-projects.component.css']
})
export class MyProjectsComponent implements OnInit {

  errorMessage: string = '';
  currentUserId: string = '';
  userData: any = {};
  today = this.dateService.formatDateString(new Date()); // Obtiene la fecha actual formateada
  iColor = 0; // Índice para la selección de color
  proyectosActivos: any[] = [];
  proyectosInactivos: any[] = [];
  
  constructor(
    private authService: AuthService, 
    private projectService: ProjectService, 
    private dateService: DateService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.userData = user;
        this.currentUserId = user.Id;
        this.loadMyProjects(); // Cargar los proyectos del usuario actual
      }
    });
  }

  loadMyProjects() {
    this.projectService.getMyProjects().subscribe({
      next: (proyectos: any) => {
        // Filtrar proyectos activos e inactivos y asignarles un color
        this.proyectosActivos = proyectos.filter((proyecto: any) => proyecto.Check_activo).map((proyecto: any) => {
          proyecto.color = this.setBackgroundColor();
          return proyecto;
        });
        this.proyectosInactivos = proyectos.filter((proyecto: any) => !proyecto.Check_activo).map((proyecto: any) => {
          proyecto.color = this.setBackgroundColor();
          return proyecto;
        });
      },
      error: (error: any) => {
        console.error('Error al obtener los proyectos', error);
      }
    });
  }

  // Asigna un color de fondo a los proyectos de manera cíclica
  setBackgroundColor(): string {
    const colors = [
      '#f75573', // Rojo
      '#4a99da', // Azul
      '#ed7d2b', // Naranja
      '#07cdae', // Verde
      '#985bc9', // Morado
      '#f9c60f'  // Amarillo
    ];

    this.iColor = (this.iColor == 5) ? 0 : this.iColor + 1;

    return colors[this.iColor];
  }

  // Abre el modal para añadir un nuevo proyecto
  openFormModal() {
    const dialogRef = this.dialog.open(AddFormModalComponent, {
      width: '500px',
      data: {
        title: 'Nuevo proyecto',
        fields: [
          { label: 'Título', name: 'Titulo', type: 'text', required: true },
          { label: 'Descripción', name: 'Descripcion', type: 'textarea', required: false }
        ]
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.projectService.createProject(result).subscribe({
          next: (response: any) => {
            this.loadMyProjects(); // Recargar los proyectos después de crear uno nuevo
          },
          error: (error: any) => {
            console.error('Error al crear el proyecto:', error);
          }
        });
      }
    });
  }

  addProject() {
    this.openFormModal();
  }

  // Maneja el clic en proyectos inactivos
  handleInactiveProjectClick(proyecto: any) {
    if (proyecto.Check_activo) return;

    const currentMember = proyecto.Miembros.find((m: any) => m.Idusuario === this.currentUserId);
    const canManage = currentMember && (currentMember.Permisos === 'gestor');

    if (canManage) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: { title: 'Reactivar proyecto', message: `¿Deseas reactivar el proyecto "${proyecto.Titulo}"?` }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.projectService.updateProject(proyecto.Id, { Check_Activo: true }).subscribe({
            next: () => {
              this.loadMyProjects(); // Recargar proyectos después de la reactivación
            },
            error: (error: any) => {
              console.error('Error al reactivar el proyecto', error);
            }
          });
        }
      });
    } else {
      this.errorMessage = 'No tienes permisos para reactivar este proyecto';
      setTimeout(() => this.errorMessage = '', 3000); // Limpiar mensaje de error después de 3 segundos
    }
  }
}
