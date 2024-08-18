import { Component, Inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DateService } from '../../services/date.service';

interface FormField {
  label: string;
  name: string;
  type: string;
  required: boolean;
  options?: { value: string, label: string }[];
}

@Component({
  selector: 'app-add-form-modal',
  templateUrl: './add-form-modal.component.html',
  styleUrls: ['./add-form-modal.component.css']
})
export class AddFormModalComponent implements OnInit {
  form: FormGroup;
  hidePassword = true; // Control de visibilidad de la contraseña
  avatars: string[] = [
    'assets/profile_uploads/profile1.png',
    'assets/profile_uploads/profile2.png',
    'assets/profile_uploads/profile3.png',
    'assets/profile_uploads/profile4.png',
    'assets/profile_uploads/profile5.png',
    'assets/profile_uploads/profile6.png',
    'assets/profile_uploads/profile7.png'
  ];
  selectedAvatar: string | null = null; // Avatar seleccionado
  selectedFile: File | null = null; // Archivo seleccionado
  fileName: string = 'Subir archivo .png o .jpg'; // Texto por defecto para el nombre del archivo

  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddFormModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string, fields: FormField[] },
    private dateService: DateService
  ) {
    this.form = this.fb.group({});
  }

  ngOnInit(): void {
    // Inicialización del formulario dinámico
    this.data.fields.forEach(field => {
      const isRequired = field.required ?? false;
      let validators = isRequired ? [Validators.required] : [];

      if (field.type === 'email') {
        validators.push(Validators.email); // Agregar validador de email si es necesario
      }

      // Agregar control al formulario
      this.form.addControl(field.name, this.fb.control('', validators));
    });
  }

  // Guardar el formulario si es válido
  save() {
    if (this.form.valid) {
      let formValues = this.form.value;

      // Filtra los valores del formulario eliminando campos vacíos no obligatorios
      formValues = Object.keys(formValues).reduce((filteredValues: { [key: string]: any }, key: string) => {
        const field = this.data.fields.find(f => f.name === key);
        if (formValues[key] !== '' || (field && field.required)) {
          filteredValues[key] = formValues[key];
        }
        return filteredValues;
      }, {});

      // Formatear los campos de fecha
      this.data.fields.forEach(field => {
        if (field.type === 'date') {
          if (formValues[field.name] && formValues[field.name] !== '') {
            formValues[field.name] = this.dateService.format(new Date(formValues[field.name]), {});
          } else {
            formValues[field.name] = null;
          }
        }
      });

      // Añadir el avatar seleccionado o el archivo subido a formValues
      if (this.selectedAvatar) {
        formValues['avatar'] = this.selectedAvatar.split('/').pop(); // Solo el nombre del archivo
      }

      if (this.selectedFile) {
        formValues['foto'] = this.selectedFile; // Enviar el archivo completo para procesamiento posterior
      }

      // Procesar lista de correos electrónicos
      if (formValues['Participantes']) {
        formValues['Participantes'] = formValues['Participantes']
          .split(',')
          .map((email: string) => email.trim());
      }
      
      this.dialogRef.close(formValues); // Cerrar el diálogo y devolver los valores del formulario
    }
  }

  // Cerrar el formulario sin guardar cambios
  close() {
    this.dialogRef.close();
  }

  // Cambiar la visibilidad de la contraseña
  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  // Seleccionar un avatar de la lista
  selectAvatar(avatar: string): void {
    this.selectedAvatar = avatar;
    this.selectedFile = null; // Si se selecciona un avatar, se deselecciona el archivo subido
    this.fileName = 'Subir archivo .png o .jpg'; // Restablecer el texto del archivo
  }

  // Manejar la selección de archivo
  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFile = file;
      this.selectedAvatar = null; // Si se selecciona un archivo, se deselecciona el avatar
      this.fileName = file.name; // Muestra el nombre del archivo
    }
  }

  // Disparar el evento de selección de archivo
  triggerFileInput(): void {
    if (this.fileInput) {
      this.fileInput.nativeElement.click();
    } else {
      console.error('File input is not defined');
    }
  }
}
