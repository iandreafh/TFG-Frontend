import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {
  currentSlideIndex = 0;
  isAnimating = false;

  slides = [
    {
      image: 'https://blog.vantagecircle.com/content/images/2023/07/Host-Activities-During-Working-Hours.png',
      title: 'Crea y gestiona equipos',
      content: 'Invita a tus compañeros de trabajo, amigos o familiares a formar parte de tu equipo. \
      Asigna roles, permisos y responsabilidades a cada miembro. Comunícate con ellos a través de chat o correo electrónico.'
    },
    {
      image: 'https://keepn.com/graphics/lpgraphics/landing_pages/free_online_calendar.png',
      title: 'Organiza y distribuye tareas',
      content: 'Crea listas de tareas personalizadas para cada proyecto. Añade fechas de inicio y fin, prioridades, etiquetas y comentarios. \
      Asigna tareas a los miembros de tu equipo y sigue su progreso en tiempo real.'
    },
    {
      image: 'https://images.squarespace-cdn.com/content/v1/5a5977a7f43b55eff1588911/1632238517780-07Y27AQYP0S33AR6CHGH/Tablero-Kanban.png',
      title: 'Visualiza y gestiona tu flujo de trabajo',
      content: 'Usa el tablero kanban para ver el estado de tus tareas en un solo vistazo. \
      Arrastra y suelta las tareas entre las columnas para cambiar su estado. Personaliza las columnas según tus necesidades y preferencias.'
    },
    {
      image: 'https://images.vexels.com/media/users/3/132561/isolated/preview/d6cd6d3f12846bb27d17b5e136f91883-grafico-de-barras-de-colores-de-dos-caras.png',
      title: 'Analiza y mejora tu rendimiento',
      content: 'Obtén informes y estadísticas sobre el avance de tus proyectos y el desempeño de tu equipo. \
      Identifica los puntos fuertes y débiles, las áreas de mejora y las oportunidades de crecimiento.'
    }
  ];

  ngOnInit() {}

}
