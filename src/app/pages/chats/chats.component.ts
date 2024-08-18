import { Component, OnInit, AfterViewChecked, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog'; // Importar MatDialog para abrir modals
import { MessageService } from '../../services/message.service';
import { AuthService } from '../../services/auth.service';
import { DateService } from '../../services/date.service';
import { AddFormModalComponent } from '../../components/add-form-modal/add-form-modal.component';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.css']
})
export class ChatsComponent implements OnInit, OnDestroy, AfterViewChecked {

  errorMessage: string = '';
  chats: any[] = [];
  selectedChat: any = null;
  messages: any[] = [];
  newMessageSubject: string = '';
  newMessageContent: string = '';
  isLoading: boolean = true;
  currentUserId: string = '';
  today: string = '';
  private chatsInterval: any;

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  constructor(
    private messageService: MessageService,
    private authService: AuthService,
    public dateService: DateService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.currentUserId = user.Id;
        this.today = this.dateService.formatDateString(new Date());
        this.startChatsAutoRefresh();
      }
    });
  }

  // Limpiar el intervalo al destruir el componente
  ngOnDestroy(): void {
    if (this.chatsInterval) {
      clearInterval(this.chatsInterval);
    }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    if (this.messagesContainer) {
      try {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      } catch (err) {
        console.error('Error scrolling to bottom:', err);
      }
    }
  }
  
  // Método para iniciar la recarga automática de comentarios
  startChatsAutoRefresh(): void {
    this.loadChats(); // Cargar los chats al iniciar
    this.chatsInterval = setInterval(() => {
      this.loadChats();
    }, 30000); // 30000 ms = 30 segundos
  }

  loadChats() {
    this.messageService.getChats().subscribe({
      next: (chats: any) => {
        this.chats = chats.map((chat: any) => ({
          ...chat,
          UltimoMensaje: this.dateService.formatDateNumeric(chat.UltimoMensaje)
        }));
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al obtener los chats', error);
        this.isLoading = false;
      }
    });
  }

  selectChat(chat: any) {
    this.selectedChat = chat;
    this.loadChatMessages(chat.Idusuario);
    this.loadChats();
  }

  loadChatMessages(idUsuario: number) {
    this.messageService.getChatMessages(idUsuario).subscribe({
      next: (messages: any) => {
        this.messages = messages.map((message: any) => ({
          ...message,
          Created_at: this.dateService.formatDateNumeric(message.Created_at),
          check_leido: message.check_leido // Añadido para mostrar el ícono de doble check
        }));
        this.scrollToBottom(); // Scroll down after loading messages
      },
      error: (error: any) => {
        console.error('Error al obtener los mensajes del chat', error);
      }
    });
  }

  sendMessage() {
    if (this.newMessageSubject && this.newMessageContent) {
      const messageData = {
        EmailReceptor: this.selectedChat.Email,
        Asunto: this.newMessageSubject,
        Contenido: this.newMessageContent
      };

      this.messageService.createMessage(messageData).subscribe({
        next: (response) => {
          this.loadChatMessages(this.selectedChat.Idusuario);
          this.newMessageSubject = '';
          this.newMessageContent = '';
        },
        error: (error) => {
          console.error('Error al enviar el mensaje:', error);
        }
      });
    }
  }

  newChat() {
    const dialogRef = this.dialog.open(AddFormModalComponent, {
      width: '600px',
      data: {
        title: 'Nuevo chat',
        fields: [
          { label: 'Correo destinatario', name: 'EmailReceptor', type: 'email', required: true },
          { label: 'Asunto', name: 'Asunto', type: 'text', required: true },
          { label: 'Mensaje', name: 'Contenido', type: 'longTextarea', required: true }
        ]
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.messageService.createMessage(result).subscribe({
          next: (response: any) => {
            this.errorMessage = '';
            this.loadChats(); // Recarga los chats después de crear uno nuevo
          },
          error: (error: any) => {
            console.error('Error al crear el nuevo chat:', error);
            this.errorMessage = error.error.error
            setTimeout(() => {this.errorMessage = ''}, 5000);
          }
        });
      }
    });
  }

}
