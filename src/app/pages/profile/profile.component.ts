import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { AuthService } from 'src/app/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;

  isEditable = false;
  fileName: string = 'Subir archivo .png o .jpg'; // Texto por defecto
  foto: File | null = null;
  alertas: boolean = false;
  errorMessage: string = '';
  currentUserId: string = '';
  userData: any = {};
  actualPassword: string = '';
  newPassword: string = '';
  newPasswordCheck: string = '';

  constructor(private userService: UserService, private authService: AuthService) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.userData = user;
        this.currentUserId = user.Id; // Assuming ID is available in the user object
      }
    });
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

  saveProfile() {
    // Validar campos requeridos
    if (!this.userData.Nombre || !this.userData.Email) {
      this.errorMessage = "Debe completar todos los campos obligatorios.";
      return;
    }

    // Validar correo electrónico
    if (!this.validateEmail(this.userData.Email)) {
      this.errorMessage = "Debe proporcionar un correo electrónico válido.";
      return; // Terminar ejecución
    }

    // Validar contraseñas si se ha introducido alguna
    if (this.actualPassword || this.newPassword || this.newPasswordCheck) {
      if (!this.actualPassword || !this.newPassword || !this.newPasswordCheck) {
        this.errorMessage = "Debe completar todos los campos de contraseña si desea cambiarla.";
        return;
      }
      if (this.newPassword !== this.newPasswordCheck) {
        this.errorMessage = "Las contraseñas nuevas no coinciden.";
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
      formData.append('newPasswordCheck', this.newPasswordCheck);
    }
    if (this.foto) {
      formData.append('Foto', this.foto);
    }

    this.userService.updateUser(this.currentUserId, formData).subscribe({
      next: () => {
        this.isEditable = false;
        this.errorMessage = '';
        location.reload();
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
    location.reload();
  }

  deleteProfile() {
    this.userService.deleteUser(this.currentUserId).subscribe(() => {
      this.authService.logout();
    }, error => {
      console.error('Error al eliminar perfil', error);
    });
  }

}
