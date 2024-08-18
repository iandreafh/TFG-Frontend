import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DateService } from '../../services/date.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

interface FormField {
  label: string;
  name: string;
  type: string;
  required: boolean;
  options?: { value: string | number, label: string }[];
  participants?: any[]; // Para gestionar los participantes en el HTML
}

@Component({
  selector: 'app-edit-form-modal',
  templateUrl: './edit-form-modal.component.html',
  styleUrls: ['./edit-form-modal.component.css']
})
export class EditFormModalComponent implements OnInit {
  form: FormGroup;
  isCreator: boolean = false;  // Determina si el usuario es el creador de la reunión o tarea

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditFormModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string, fields: FormField[], task?: any, meeting?: any, canEdit?: boolean, isCreator?: boolean },
    private dateService: DateService,
    private dialog: MatDialog
  ) {
    this.form = this.fb.group({});
    this.isCreator = data.isCreator || false; // Asigna si el usuario es el creador de la reunión o tarea
    console.log(data); // Muestra los datos en la consola para depuración
  }

  ngOnInit(): void {
    // Inicializa los controles del formulario para cada campo especificado en data.fields
    this.data.fields.forEach(field => {
      const isRequired = field.required ?? false; // Verifica si el campo es obligatorio
      const validators = isRequired ? [Validators.required] : []; // Añade validaciones si es necesario
      
      // Obtiene el valor correspondiente de la tarea o reunión, si existe
      let value = this.data.task?.[field.name] || this.data.meeting?.[field.name] || '';

      // Si es una reunión y el campo es 'Respuesta', carga la respuesta del usuario
      if (this.data.meeting && field.name === 'Respuesta') {
        value = this.data.meeting.RespuestaUsuario || '';
      }
      
      this.form.addControl(field.name, this.fb.control(value, validators)); // Agrega el control al formulario

      // Deshabilita el campo si pertenece a una reunión y no es el campo de respuesta
      if (this.data.meeting && field.name !== 'Respuesta') {
        this.form.controls[field.name].disable();
      }

      // Deshabilita todos los campos si canEdit es falso (para tareas)
      if (!this.data.canEdit && !this.data.meeting) {
        this.form.controls[field.name].disable();
      }
    });
  }

  save() {
    if (this.form.valid) {
      let formValues = this.form.value;

      // Filtra los valores del formulario, eliminando campos vacíos que no son obligatorios,
      // pero manteniendo aquellos que antes tenían datos y ahora están vacíos.
      formValues = Object.keys(formValues).reduce((filteredValues: { [key: string]: any }, key: string) => {
        const field = this.data.fields.find(f => f.name === key);
        const originalValue = this.data.task?.[key] || this.data.meeting?.[key]; // Valor original de la tarea o reunión

        if (field) {
          // Si el campo es obligatorio o ha cambiado, se incluye en el envío
          if (
            field.required || 
            formValues[key] !== originalValue || 
            (originalValue !== undefined && originalValue !== '' && formValues[key] === '')
          ) {
            // Si es un campo de fecha, verifica si ha cambiado para actualizarlo
            if (field.type === 'date') {
              if (formValues[key] === '' || formValues[key] === null) {
                if (originalValue) {
                  filteredValues[key] = null; // Asigna null si estaba lleno y ahora está vacío
                } 
              } else if (new Date(formValues[key]).getTime() !== new Date(originalValue).getTime()) {
                filteredValues[key] = this.dateService.format(new Date(formValues[key]), {});
              }
            } else {
              filteredValues[key] = formValues[key];
            }
          }
        }
        
        return filteredValues;
      }, {});

      // Cierra el modal y devuelve los valores filtrados al componente que lo abrió
      this.dialogRef.close(formValues);
    }
  }

  close() {
    // Cierra el modal sin guardar cambios
    this.dialogRef.close();
  }

  confirmDelete() {
    // Abre un diálogo de confirmación para eliminar la reunión o tarea
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: this.data.meeting ? 'Cancelar reunión' : 'Eliminar tarea', message: `¿Estás seguro de que quieres eliminar esta ${this.data.meeting ? 'reunión' : 'tarea'}?` }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Si el usuario confirma, cierra el modal con la indicación de que se ha eliminado
        this.dialogRef.close({ deleted: true });
      }
    });
  }
}
