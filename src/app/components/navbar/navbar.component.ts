import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  public isSticky = false;

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    const scrollPosition = window.scrollY;

    const navbar = document.querySelector('.navbar');

    if (navbar) {
      // Ajusta el offset según sea necesario
      const stickyOffset = navbar.clientHeight;

      if (scrollPosition >= stickyOffset) {
        this.isSticky = true;
      } else {
        this.isSticky = false;
      }
    }
  }
}
