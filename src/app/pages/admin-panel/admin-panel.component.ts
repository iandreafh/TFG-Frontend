import { Component, OnInit } from '@angular/core';
import { DateService } from '../../services/date.service';
import { MatDialog } from '@angular/material/dialog';
import { AddFormModalComponent } from '../../components/add-form-modal/add-form-modal.component';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { ProjectService } from '../../services/project.service';
import { MessageService } from '../../services/message.service';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent implements OnInit {

  isLoading: boolean = true;
  errorMessage: string = '';
  userData: any = {};
  usuarios: any[] = [];
  proyectos: any[] = [];

  // Columnas para usuarios y proyectos
  userColumns = [
    { name: 'Nombre', label: 'Nombre' },
    { name: 'Email', label: 'Email' },
    { name: 'Alertas', label: 'Alertas' },
    { name: 'Created_at', label: 'Registro' },
    { name: 'Updated_at', label: 'Actualizado' },
    { name: 'Rol', label: 'Rol' },
    { name: 'Check_activo', label: 'Activo' }
  ];

  projectColumns = [
    { name: 'Titulo', label: 'Título' },
    { name: 'Created_at', label: 'Creado' },
    { name: 'Updated_at', label: 'Actualizado' },
    { name: 'Check_activo', label: 'Activo' }
  ];

  // Paginación y ordenación
  userPage: number = 0;
  userLimit: number = 10;
  userHasNextPage: boolean = true;

  projectPage: number = 0;
  projectLimit: number = 10;
  projectHasNextPage: boolean = true;

  userSortBy: string = '';
  projectSortBy: string = '';

  sortDirection: 'asc' | 'desc' = 'desc';

  constructor(
    private authService: AuthService,
    private userService: UserService, 
    private projectService: ProjectService, 
    private messageService: MessageService, 
    private dateService: DateService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    // Obtener el usuario actual y cargar los datos iniciales si está autenticado
    this.authService.getCurrentUser().subscribe(user => {
        if (user) {
            this.userData = user;

            // Cargar la lista de todos los usuarios y proyectos
            this.loadAllUsers();
            this.loadAllProjects();
        }
    });
}

  sendGlobalMessage() {
    const dialogRef = this.dialog.open(AddFormModalComponent, {
      width: '600px',
      data: {
        title: 'Nuevo comunicado',
        fields: [
          { label: 'Asunto', name: 'Asunto', type: 'text', required: true },
          { label: 'Mensaje', name: 'Contenido', type: 'longTextarea', required: true }
        ]
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const messageData = {
          ...result,
          comunicado: true
        };

        this.messageService.createGlobalMessage(messageData).subscribe({
          next: () => {
            this.errorMessage = '';
          },
          error: (error: any) => {
            console.error('Error al enviar el nuevo comunicado:', error);
            this.errorMessage = error.error.error;
            setTimeout(() => { this.errorMessage = ''; }, 5000);
          }
        });
      }
    });
  }
  
  registerAdmin() {
    const dialogRef = this.dialog.open(AddFormModalComponent, {
      width: '600px',
      data: {
        title: 'Registrar nuevo administrador',
        fields: [
          { label: 'Nombre', name: 'Nombre', type: 'text', required: true },
          { label: 'Email', name: 'Email', type: 'email', required: true },
          { label: 'Contraseña', name: 'Password', type: 'password', required: true },
          { label: 'Repite la contraseña', name: 'PasswordCheck', type: 'password', required: true },
          { label: 'Selecciona un avatar', name: 'avatar', type: 'avatar-radio-buttons', required: false, options: this.getAvatarOptions() },
          { label: 'O sube tu propia foto', name: 'Foto', type: 'file', required: false }
        ]
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.Password !== result.PasswordCheck) {
          this.errorMessage = "Las contraseñas no coinciden.";
          return;
        }

        const formData = new FormData();
        formData.append('Email', result.Email);
        formData.append('Password', result.Password);
        formData.append('Nombre', result.Nombre);
        formData.append('Rol', 'admin');

        if (result.Foto) {
          formData.append('Foto', result.Foto);
        } else if (result.avatar) {
          formData.append('avatar', result.avatar);
        }

        this.userService.createUser(formData).subscribe({
          next: () => {
            this.errorMessage = '';
            this.loadAllUsers();
          },
          error: (error: any) => {
            console.error('Error al crear el nuevo usuario administrador:', error);
            this.errorMessage = error.error.error;
            setTimeout(() => { this.errorMessage = ''; }, 5000);
          }
        });
      }
    });
  }

  getAvatarOptions() {
    return [
      { value: 'profile1.png', label: 'Avatar 1' },
      { value: 'profile2.png', label: 'Avatar 2' },
      { value: 'profile3.png', label: 'Avatar 3' },
      { value: 'profile4.png', label: 'Avatar 4' },
      { value: 'profile5.png', label: 'Avatar 5' },
      { value: 'profile6.png', label: 'Avatar 6' },
      { value: 'profile7.png', label: 'Avatar 7' }
    ];
  }

  sortBy(item: string, column: string) {
    this.sortDirection = (this.userSortBy === column || this.projectSortBy === column) && this.sortDirection === 'asc' ? 'desc' : 'asc';

    if (item === 'usuarios') {
      this.userSortBy = column;
      this.loadAllUsers();
    } else if (item === 'proyectos') {
      this.projectSortBy = column;
      this.loadAllProjects();
    }
  }
  
  loadAllUsers() {
    // Obtener la lista de usuarios con paginación y ordenación
    this.userService.getAllUsers(this.userPage * this.userLimit, this.userLimit + 1, this.userSortBy, this.sortDirection).subscribe({
      next: (usuarios: any) => {
        this.userHasNextPage = usuarios.length > this.userLimit;
        if (this.userHasNextPage) usuarios.pop(); // Eliminar el último elemento utilizado para la verificación de la siguiente página
        // Formatear fechas de creación y actualización
        this.usuarios = usuarios.map((usuario: any) => ({
          ...usuario,
          Created_at: this.dateService.formatDateNumeric(usuario.Created_at),
          Updated_at: this.dateService.formatDateNumeric(usuario.Updated_at),
        }));
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al obtener los usuarios', error);
      }
    });
  }

  loadAllProjects() {
    this.projectService.getAllProjects(this.projectPage * this.projectLimit, this.projectLimit + 1, this.projectSortBy, this.sortDirection).subscribe({
      next: (proyectos: any) => {
        this.projectHasNextPage = proyectos.length > this.projectLimit;
        if (this.projectHasNextPage) proyectos.pop();
        this.proyectos = proyectos.map((proyecto: any) => ({
          ...proyecto,
          Created_at: this.dateService.formatDateNumeric(proyecto.Created_at),
          Updated_at: this.dateService.formatDateNumeric(proyecto.Updated_at),
        }));
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al obtener los proyectos', error);
      }
    });
  }

  deleteUser(id: string) {
    // Buscar el usuario a eliminar y mostrar un diálogo de confirmación
    const usuario = this.usuarios.find(u => u.Id === id);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { 
        title: 'Eliminar usuario', 
        message: `¿Está seguro de que desea eliminar permanentemente el perfil de ${usuario.Nombre}?` 
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Si el usuario confirma, proceder con la eliminación
        this.userService.deleteUserPermanently(id).subscribe({
          next: () => this.loadAllUsers(),
          error: (error) => console.error('Error al eliminar usuario', error)
        });
      }
    });
  }

  deleteProject(id: string) {
    const proyecto = this.proyectos.find(p => p.Id === id);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { 
        title: 'Eliminar proyecto', 
        message: `¿Está seguro de que desea eliminar permanentemente el proyecto ${proyecto.Titulo}?` 
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.projectService.deleteProjectPermanently(id).subscribe({
          next: () => this.loadAllProjects(),
          error: (error: any) => console.error('Error al eliminar el proyecto', error)
        });
      }
    });
  }

  nextPage(type: string) {
    if (type === 'usuarios' && this.userHasNextPage) {
      this.userPage++;
      this.loadAllUsers();
    } else if (type === 'proyectos' && this.projectHasNextPage) {
      this.projectPage++;
      this.loadAllProjects();
    }
  }

  prevPage(type: string) {
    if (type === 'usuarios' && this.userPage > 0) {
      this.userPage--;
      this.loadAllUsers();
    } else if (type === 'proyectos' && this.projectPage > 0) {
      this.projectPage--;
      this.loadAllProjects();
    }
  }
}
