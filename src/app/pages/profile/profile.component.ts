import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { AuthService } from 'src/app/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;

  isEditable = false;
  showPasswords = false;
  fileName: string = 'Subir archivo .png o .jpg'; // Texto por defecto
  foto: File | null = null;
  avatars: string[] = [
    'assets/profile_uploads/profile1.png',
    'assets/profile_uploads/profile2.png',
    'assets/profile_uploads/profile3.png',
    'assets/profile_uploads/profile4.png',
    'assets/profile_uploads/profile5.png',
    'assets/profile_uploads/profile6.png',
    'assets/profile_uploads/profile7.png'
  ];
  selectedAvatar: string | null = null;

  alertas: boolean = false;
  errorMessage: string = '';
  currentUserId: string = '';
  userData: any = {};
  originalUserData: any = {};
  actualPassword: string = '';
  newPassword: string = '';

  constructor(
    private userService: UserService, 
    private authService: AuthService, 
    private router: Router, 
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.userData = user;
        this.originalUserData = { ...user }; // Guardar una copia de los datos originales
        this.currentUserId = user.Id;
      }
    });
    this.router.routeReuseStrategy.shouldReuseRoute = () => { return false; };
  }

  selectAvatar(avatar: string): void {
    this.selectedAvatar = avatar;
    this.foto = null; // Si selecciona un avatar tras subir la foto, se elimina la foto y se selecciona el avatar
    this.fileName = 'Subir archivo .png o .jpg'; // Texto por defecto
  }
  
  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.foto = file;
      this.fileName = file.name; // Muestra el nombre del archivo
    }
  }

  triggerFileInput(): void {
    if (this.fileInput) {
      this.fileInput.nativeElement.click();
    } else {
      console.error('File input is not defined');
    }
  }

  validateEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  editProfile() {
    this.isEditable = true;
  }

  // Controla la visualización del formulario para cambiar contraseña
  showChangePassword() {
    this.showPasswords = !this.showPasswords;
    if (!this.showPasswords) {
      this.actualPassword = '';
      this.newPassword = '';
      if (this.errorMessage == "Debe completar todos los campos de contraseña si desea cambiarla."
        || this.errorMessage == "La contraseña debe tener entre 6 y 12 caracteres, con letras y números.") {
        this.errorMessage = '';
      }
    }
  }

  // Guarda el perfil actualizado
  saveProfile() {
    if (!this.userData.Nombre || !this.userData.Email) {
      this.errorMessage = "Debe completar todos los campos obligatorios.";
      return;
    }

    if (!this.validateEmail(this.userData.Email)) {
      this.errorMessage = "Debe proporcionar un correo electrónico válido.";
      return;
    }

    if (this.actualPassword || this.newPassword) {
      if (!this.actualPassword || !this.newPassword) {
        this.errorMessage = "Debe completar todos los campos de contraseña si desea cambiarla.";
        return;
      }
      const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,12}$/;
      if (!passwordPattern.test(this.newPassword)) {
        this.errorMessage = "La contraseña debe tener entre 6 y 12 caracteres, con letras y números.";
        return;
      }
    }

    const formData = new FormData();
    formData.append('Nombre', this.userData.Nombre);
    formData.append('Email', this.userData.Email);
    formData.append('Alertas', this.alertas.toString());
    if (this.actualPassword) {
      formData.append('actualPassword', this.actualPassword);
    }
    if (this.newPassword) {
      formData.append('newPassword', this.newPassword);
    }
    if (this.foto) {
      formData.append('Foto', this.foto);
    } else if (this.selectedAvatar) {
      let avatarName = this.selectedAvatar.split('/').pop();
      if (avatarName) {
        formData.append('avatar', avatarName);
      }
    }

    this.userService.updateUser(this.currentUserId, formData).subscribe({
      next: () => {
        this.isEditable = false;
        this.errorMessage = '';
        location.reload(); // Recargar página para aplicar cambios
      },
      error: (error: HttpErrorResponse) => {
        if (error.error && (error.error.error || error.error.message)) {
          this.errorMessage = error.error.message ? error.error.message : error.error.error;
        } else {
          this.errorMessage = 'Error al actualizar el perfil';
        }
      }
    });
  }

  cancelEdit() {
    this.isEditable = false;
    this.showPasswords = false;
    this.userData = { ...this.originalUserData }; // Restaurar datos originales
    this.actualPassword = '';
    this.newPassword = '';
    this.foto = null;
    this.selectedAvatar = null;
    this.fileName = 'Subir archivo .png o .jpg'; // Texto por defecto
  }

  deleteProfile() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Dar de baja el perfil', message: '¿Estás seguro de que quieres hacer esto?' }
    });
  
    dialogRef.afterClosed().subscribe({
      next: (result) => {
        if (result) {
          this.userService.deleteUser(this.currentUserId).subscribe({
            next: () => {
              this.authService.logout();
            },
            error: (error) => {
              console.error('Error al eliminar perfil', error);
            }
          });
        }
      },
      error: (error) => {
        console.error('Error al cerrar el diálogo', error);
      }
    });
  }

}
