import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';  
import { DateService } from '../../services/date.service';
import { AuthService } from '../../services/auth.service';
import { ProjectService } from '../../services/project.service';
import { AddFormModalComponent } from '../../components/add-form-modal/add-form-modal.component';
import { EditFormModalComponent } from 'src/app/components/edit-form-modal/edit-form-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component'; 

const ALLOWED_FILE_TYPES = [
  { extension: '.pdf', mimeType: 'application/pdf' },
  { extension: '.txt', mimeType: 'text/plain' },
  { extension: '.doc', mimeType: 'application/msword' },
  { extension: '.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
  { extension: '.xls', mimeType: 'application/vnd.ms-excel' },
  { extension: '.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
  { extension: '.odt', mimeType: 'application/vnd.oasis.opendocument.text' },
  { extension: '.ods', mimeType: 'application/vnd.oasis.opendocument.spreadsheet' },
  { extension: '.odp', mimeType: 'application/vnd.oasis.opendocument.presentation' },
  { extension: '.jpg', mimeType: 'image/jpeg' },
  { extension: '.jpeg', mimeType: 'image/jpeg' },
  { extension: '.png', mimeType: 'image/png' }
];

@Component({
  selector: 'app-project-board',
  templateUrl: './project-board.component.html',
  styleUrls: ['./project-board.component.css']
})
export class ProjectBoardComponent implements OnInit, OnDestroy {

  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;

  isLoading: boolean = true;
  errorMessage: string = '';
  currentUserId: string = '';
  userData: any = {};

  proyecto: any;
  newMemberEmail: string = '';
  newMemberRole: string = 'lector';
  canEdit: boolean = false;
  canManageMembers: boolean = false;
  canDeleteProject: boolean = false;

  isEditable: boolean = false;
  showMyTasks: boolean = false;
  pageSize: number = 24;
  currentPage: number = 0;
  hasNextPage: boolean = true;

  tareas: any[] = [];
  tareasToDo: any[] = [];
  tareasProgress: any[] = [];
  tareasBlocked: any[] = [];
  tareasDone: any[] = [];

  isSidePanelVisible: boolean = false;
  comentarios: any[] = [];
  nuevoComentario: string = '';
  archivos: File[] = [];
  private comentariosInterval: any;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private dateService: DateService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    const projectId = this.route.snapshot.paramMap.get('id');
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.userData = user;
        this.currentUserId = user.Id;
        
        if (projectId) {
          this.loadProjectData(projectId); // Carga datos del proyecto
          this.startComentariosAutoRefresh(projectId); // Inicia auto-refresco de comentarios
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.comentariosInterval) {
      clearInterval(this.comentariosInterval); // Limpia el intervalo de refresco al destruir el componente
    }
  }

  loadProjectData(id: string): void {
    this.projectService.getProjectById(id).subscribe({
        next: (data) => {
            this.proyecto = data;
            this.proyecto.Created_at = this.dateService.formatDateNumeric(this.proyecto.Created_at);
            this.proyecto.Updated_at = this.dateService.formatDateNumeric(this.proyecto.Updated_at);

            this.proyecto.NombreCreador = this.proyecto.Miembros.find((m: any) => m.Idusuario === data.Idcreador);
            this.loadProjectTasks(id); // Carga las tareas del proyecto
            this.loadComentarios(id); // Carga los comentarios
            
            const currentMember = this.proyecto.Miembros.find((m: any) => m.Idusuario === this.currentUserId);
            if (currentMember) {
              this.canEdit = currentMember.Permisos === 'editor' || currentMember.Permisos === 'gestor';
              this.canManageMembers = currentMember.Permisos === 'gestor';
              this.canDeleteProject = currentMember.Permisos === 'gestor';
            }
            this.isLoading = false;
        },
        error: (error) => {
            if (error.error) {
                this.proyecto = null;
                console.log(error.error.error);
                this.errorMessage = error.error.error;
            }
            this.isLoading = false;
        }
    });
  }

  loadProjectTasks(id: string): void {
    const idUsuario = this.showMyTasks ? this.currentUserId : undefined;
  
    this.projectService.getProjectTasks(id, this.currentPage * this.pageSize, this.pageSize + 1, idUsuario).subscribe({
      next: (tareas) => {
        if (tareas.length > this.pageSize) {
          this.hasNextPage = true;
          tareas.pop(); // Remover la última tarea para mostrar solo la cantidad establecida
        } else {
          this.hasNextPage = false;
        }
  
        this.tareas = tareas.map((tarea: any) => {
          const miembro = this.proyecto.Miembros.find((m: any) => m.Idusuario === tarea.Idusuario);
          return {
            ...tarea,
            NombreUsuario: miembro ? miembro.Nombre : 'Usuario desconocido',
            FotoUsuario: miembro ? miembro.Foto : ''
          };
        });
  
        this.tareasToDo = this.tareas.filter((tarea: any) => tarea.Estado === 'To do');
        this.tareasProgress = this.tareas.filter((tarea: any) => tarea.Estado === 'In progress');
        this.tareasBlocked = this.tareas.filter((tarea: any) => tarea.Estado === 'Blocked');
        this.tareasDone = this.tareas.filter((tarea: any) => tarea.Estado === 'Done');
      },
      error: (error) => {
        console.error('Error al cargar tareas:', error);
      }
    });
  }
  
  nextPage() {
    if (this.hasNextPage) {
      this.currentPage++;
      this.loadProjectTasks(this.proyecto.Id);
    }
  }
  
  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadProjectTasks(this.proyecto.Id);
    }
  }

  toggleMyTasks(): void {
    this.showMyTasks = !this.showMyTasks;
    this.currentPage = 0;  // Resetear a la primera página
    this.loadProjectTasks(this.proyecto.Id);
  }

  toggleSidePanel() {
    this.isSidePanelVisible = !this.isSidePanelVisible;
  }

  startComentariosAutoRefresh(projectId: string): void {
    this.comentariosInterval = setInterval(() => {
      this.loadComentarios(projectId);
    }, 30000); // 30000 ms = 30 segundos
  }

  triggerFileInput(): void {
    if (this.fileInput) {
      this.fileInput.nativeElement.click();
    } else {
      console.error('File input is not defined');
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);
      const validFiles: File[] = [];
      const invalidFiles: string[] = [];
  
      files.forEach(file => {
        const fileType = file.type;
        const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  
        const isValidFile = ALLOWED_FILE_TYPES.some(type => 
          type.mimeType === fileType && type.extension === fileExtension
        );
  
        if (isValidFile) {
          validFiles.push(file);
        } else {
          invalidFiles.push(file.name);
        }
      });
  
      if (invalidFiles.length > 0) {
        alert(`Los siguientes archivos no son válidos y no serán subidos:\n${invalidFiles.join('\n')}`);
      }
  
      this.archivos = validFiles;
      console.log('Archivos válidos seleccionados:', this.archivos);
    }
  }

  loadComentarios(projectId: string) {
    this.projectService.getProjectComments(projectId).subscribe(comentarios => {
      this.comentarios = comentarios.map(comentario => {
        const miembro = this.proyecto.Miembros.find((m: any) => m.Idusuario === comentario.Idusuario);
        return {
          ...comentario,
          Created_at: this.dateService.formatDateNumeric(comentario.Created_at),
          NombreUsuario: miembro ? miembro.Nombre : 'Usuario desconocido'
        };
      });
    });
  }

  agregarComentario() {
    if (this.nuevoComentario.trim() !== '') {
      const formData = new FormData();
      formData.append('Contenido', this.nuevoComentario);  // Agregar el comentario al FormData
  
      this.archivos.forEach((archivo) => {
        formData.append('Archivos', archivo, archivo.name);
      });
  
      this.projectService.createComment(this.proyecto.Id, formData).subscribe({
        next: (response: any) => {
          const comentarioConNombre = {
            ...response,
            NombreUsuario: this.userData.Nombre
          };
          this.comentarios.push(comentarioConNombre);
          this.nuevoComentario = '';
          this.archivos = [];
        },
        error: (error: any) => {
          console.error('Error al agregar comentario:', error);
        }
      });
    }
  }

  addTask() {
    const dialogRef = this.dialog.open(AddFormModalComponent, {
      width: '550px',
      data: {
        title: 'Nueva tarea',
        fields: [
          { label: 'Título', name: 'Titulo', type: 'text', required: true },
          { label: 'Descripción', name: 'Descripcion', type: 'textarea', required: false, maxLength: 255 },
          { label: 'Prioridad *', name: 'Prioridad', type: 'radio-buttons', required: true, options: [
            { value: 1, label: 'Baja' },
            { value: 2, label: 'Media' },
            { value: 3, label: 'Alta' }
          ]},
          { label: 'Estado *', name: 'Estado', type: 'radio-buttons', required: true, options: [
            { value: 'To do', label: 'To do' },
            { value: 'In progress', label: 'In progress' },
            { value: 'Blocked', label: 'Blocked' },
            { value: 'Done', label: 'Done' }
          ]},
          { label: 'Fecha inicio', name: 'Fechainicio', type: 'date', required: false },
          { label: 'Fecha fin', name: 'Fechafin', type: 'date', required: false },
          { label: 'Usuario asignado', name: 'Idusuario', type: 'select', required: false, 
            options: this.proyecto.Miembros.filter((miembro: any) => miembro.Check_activo)
              .map((miembro: any) => ({ value: miembro.Idusuario, label: miembro.Nombre })) }
        ]
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.projectService.createTask(this.proyecto.Id, result).subscribe({
          next: (response: any) => {
            this.loadProjectTasks(this.proyecto.Id);
          },
          error: (error: any) => {
            console.error('Error al crear el proyecto:', error);
          }
        });
      }
    });
  }

  editOrDeleteTask(taskId: string) {
    const projectId = this.proyecto.Id;
    this.projectService.getTaskById(projectId, taskId).subscribe({
      next: (task) => {
        const dialogRef = this.dialog.open(EditFormModalComponent, {
          width: '550px',
          data: {
            title: 'Editar tarea',
            fields: [
              { label: 'Título', name: 'Titulo', type: 'text', required: true },
              { label: 'Descripción', name: 'Descripcion', type: 'textarea', required: false, maxLength: 150 },
              { label: 'Prioridad', name: 'Prioridad', type: 'radio-buttons', required: true, options: [
                { value: 1, label: 'Baja' },
                { value: 2, label: 'Media' },
                { value: 3, label: 'Alta' }
              ]},
              { label: 'Estado', name: 'Estado', type: 'radio-buttons', required: true, options: [
                { value: 'To do', label: 'To do' },
                { value: 'In progress', label: 'In progress' },
                { value: 'Blocked', label: 'Blocked' },
                { value: 'Done', label: 'Done' }
              ]},
              { label: 'Fecha inicio', name: 'Fechainicio', type: 'date', required: false },
              { label: 'Fecha fin', name: 'Fechafin', type: 'date', required: false },
              { label: 'Usuario asignado', name: 'Idusuario', type: 'select', required: false, 
                options: this.proyecto.Miembros.filter((miembro: any) => miembro.Check_activo)
                  .map((miembro: any) => ({ value: miembro.Idusuario, label: miembro.Nombre })) }
            ],
            task: task,
            canEdit: this.canEdit,
            isCreator: this.currentUserId === task.Idcreador
          }
        });
        
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            if (result.deleted) {
              this.projectService.deleteTask(projectId, taskId).subscribe({
                next: () => {
                  this.loadProjectTasks(this.proyecto.Id);
                },
                error: (error) => {
                  console.error('Error al eliminar la tarea:', error);
                }
              });
            } else {
              this.projectService.updateTask(projectId, taskId, result).subscribe({
                next: () => {
                  this.loadProjectTasks(this.proyecto.Id);
                },
                error: (error) => {
                  console.error('Error al actualizar la tarea:', error);
                }
              });
            }
          }
        });
      },
      error: (error) => {
        console.error('Error al cargar los datos de la tarea:', error);
      }
    });
  }

  editProject() {
    if (this.canEdit) {
      this.isEditable = true;
    } else {
      console.error('No tienes permisos para editar este proyecto.');
    }
  }

  cancelEdit() {
    this.isEditable = false;
    this.errorMessage = '';
    // Recargar datos para descartar cambios no guardados
    this.loadProjectData(this.proyecto.Id);
  }

  onPermissionChange(miembro: any) {
    const isCreator = miembro.Idusuario === this.proyecto.Idcreador;
    const currentGestorCount = this.proyecto.Miembros.filter((m: any) => m.Permisos === 'gestor').length;
  
    // Si intenta cambiar el último gestor a un rol inferior, cancelar la acción
    if (currentGestorCount === 1 && miembro.Permisos === 'gestor') {
      const newRole = miembro.Permisos;
      if (newRole !== 'gestor') {
        this.errorMessage = 'Debe haber al menos un gestor.';
        miembro.Permisos = 'gestor';  // Revertir cambio
      }
    }
  }

  addNewMember() {
    if (this.newMemberEmail.trim() !== '') {
      const isGestor = this.newMemberRole === 'gestor';
      const currentGestorCount = this.proyecto.Miembros.filter((m: any) => m.Permisos === 'gestor').length;
  
      if (!isGestor && currentGestorCount === 0) {
        this.errorMessage = 'Debe haber al menos un gestor. Asigne el rol de gestor a un miembro.';
        return;
      }
  
      this.proyecto.Miembros.push({
        Email: this.newMemberEmail,
        Permisos: this.newMemberRole
      });
      this.newMemberEmail = '';
      this.newMemberRole = 'lector';
    }
  }

  saveProject() {
    const gestorCount = this.proyecto.Miembros.filter((m: any) => m.Permisos === 'gestor').length;
  
    if (gestorCount === 0) {
      this.errorMessage = 'Debe haber al menos un gestor en el proyecto.';
      return;
    }
  
    if (this.canEdit) {
      this.projectService.updateProject(this.proyecto.Id, this.proyecto).subscribe({
        next: (response) => {
          this.isEditable = false;
          this.errorMessage = '';
          this.loadProjectData(this.proyecto.Id);
        },
        error: (error) => {
          this.errorMessage = error.error.error;
          console.error('Error al actualizar el proyecto:', error);
        }
      });
    } else {
      console.error('No tienes permisos para guardar cambios en este proyecto.');
    }
  }

  deleteProject() {
    if (this.canDeleteProject) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: { title: 'Eliminar proyecto', message: '¿Estás seguro de que quieres eliminar este proyecto?' }
      });

      dialogRef.afterClosed().subscribe({
        next: (result) => {
          if (result) {
            this.projectService.deleteProject(this.proyecto.Id).subscribe({
              next: () => {
                this.router.navigate(['/my-projects']);
              },
              error: (error) => {
                console.error('Error al eliminar el proyecto', error);
              }
            });
          }
        },
        error: (error) => {
          console.error('Error al cerrar el diálogo', error);
        }
      });
    } else {
      console.error('No tienes permisos para eliminar este proyecto.');
    }
  }

}
