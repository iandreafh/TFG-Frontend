import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// Import Angular Material
import { MatTabsModule } from '@angular/material/tabs';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDialogModule } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_FORMATS, DateAdapter } from '@angular/material/core';

// Routing
import { AppRoutingModule } from './app-routing.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from './services/jwt-interceptor.service';

// Components and pages
import { AppComponent } from './app.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { AddFormModalComponent } from './components/add-form-modal/add-form-modal.component';
import { EditFormModalComponent } from './components/edit-form-modal/edit-form-modal.component';
import { WelcomeComponent } from './pages/welcome/welcome.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { ScrollTopComponent } from './components/scroll-top/scroll-top.component';
import { LoginComponent } from './pages/login/login.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { RegisterComponent } from './pages/register/register.component';
import { HomeComponent } from './pages/home/home.component';
import { MenuComponent } from './components/menu/menu.component';
import { ProfileIconComponent } from './components/profile-icon/profile-icon.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { MyProjectsComponent } from './pages/my-projects/my-projects.component';
import { ProjectBoardComponent } from './pages/project-board/project-board.component';
import { ScheduleComponent } from './pages/schedule/schedule.component';
import { ChatsComponent } from './pages/chats/chats.component';

// Date service for custom date formats
import { DateService } from './services/date.service';
import { AdminPanelComponent } from './pages/admin-panel/admin-panel.component';

// Custom date formats
export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD/MM/YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@NgModule({
  declarations: [
    AppComponent,
    ConfirmDialogComponent,
    AddFormModalComponent,
    EditFormModalComponent,
    WelcomeComponent,
    NavbarComponent,
    FooterComponent,
    ScrollTopComponent,
    LoginComponent,
    ResetPasswordComponent,
    RegisterComponent,
    HomeComponent,
    MenuComponent,
    ProfileIconComponent,
    ProfileComponent,
    MyProjectsComponent,
    ProjectBoardComponent,
    ScheduleComponent,
    ChatsComponent,
    AdminPanelComponent,
  ],
  imports: [
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    BrowserModule,
    BrowserAnimationsModule,
    
    MatTabsModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatDialogModule,
    MatRadioModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: DateAdapter, useClass: DateService },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
