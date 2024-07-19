import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;

  ngOnInit() {}

  constructor(private authService: AuthService, private userService: UserService, private router: Router) {}

  hide = true;
  errorMessage: string = '';
  fileName: string = 'Subir archivo .png o .jpg'; // Texto por defecto

  userData: {[key: string]: string} = {
    nombre: '',
    email: '',
    password: '',
    passwordCheck: ''
  };

  alertas: boolean = true; // Activado por defecto
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

  selectAvatar(avatar: string): void {
    this.selectedAvatar = avatar;
    this.foto = null; // Si selecciona un avatar tras subir la foto, se elimina la foto y se selecciona el avatar
    this.fileName = 'Subir archivo .png o .jpg'; // Texto por defecto
  }

  validateEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  register() {
    // Lista de campos requeridos
    const camposRequeridos = ['nombre', 'email', 'password', 'passwordCheck'];

    // Compruebo que se hayan rellenado todos
    for (const campo of camposRequeridos) {
      if (!this.userData[campo] || this.userData[campo].trim() === '') {
        this.errorMessage = "Debe completar todos los campos obligatorios.";
        return; // Terminar ejecución
      }
    }

    // Validar correo electrónico
    if (!this.validateEmail(this.userData['email'])) {
      this.errorMessage = "Debe proporcionar un correo electrónico válido.";
      return; // Terminar ejecución
    }

    // Comprobar si las contraseñas coinciden
    if (this.userData['password'] !== this.userData['passwordCheck']) {
      this.errorMessage = "Las contraseñas no coinciden.";
      return; // Terminar ejecución
    }

    // Validar contraseña
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,12}$/;
    if (!passwordPattern.test(this.userData['password'])) {
      this.errorMessage = "La contraseña debe tener entre 6 y 12 caracteres, con letras y números.";
      return; // Terminar ejecución
    }

    // Validar que se haya subido una foto o seleccionado un avatar
    if (!this.foto && !this.selectedAvatar) {
      this.errorMessage = "Debe escoger un avatar o subir una foto de perfil.";
      return; // Terminar ejecución
    }

    // Generar el FormData para enviar a la API
    const formData = new FormData();
    formData.append('Email', this.userData['email']);
    formData.append('Password', this.userData['password']);
    formData.append('Nombre', this.userData['nombre']);
    formData.append('Alertas', this.alertas.toString());

    if (this.foto) {
      formData.append('Foto', this.foto);
    } else if (this.selectedAvatar) {
      let avatarName = this.selectedAvatar.split('/').pop();
      if (avatarName) {
        formData.append('avatar', avatarName);
      }
    }

    // Enviar el FormData a la API
    this.userService.createUser(formData).subscribe({
      next: (response) => {
        this.errorMessage = '';
        console.log(response);
        // Una vez registrado, puede hacer login
        window.location.href = "/login";
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
        if (error.error && (error.error.error || error.error.message)) {
          this.errorMessage = error.error.message ? error.error.message : error.error.error;
        } else {
          this.errorMessage = 'Ocurrió un problema al intentar registrar el usuario.';
        }
      }
    });
  }
}
