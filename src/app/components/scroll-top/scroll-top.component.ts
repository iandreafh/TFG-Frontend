import {Component, HostListener} from '@angular/core';

@Component({
  selector: 'app-scroll-top',
  templateUrl: './scroll-top.component.html',
  styleUrls: ['./scroll-top.component.css']
})
export class ScrollTopComponent {

  private isVisible = false;

  constructor() {
    this.onScroll();
  }

  getStyle() {
    return {
      display: this.isVisible ? 'flex' : 'none'
    };
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    const scrollHeight = this.getScrollHeight();
    this.isVisible = document.body.scrollTop > scrollHeight || document.documentElement.scrollTop > scrollHeight;
  }

  getScrollHeight(): number {
    let deviceHeight;
    if (window.innerWidth < 768) {
      deviceHeight = 550; // Altura de scroll para dispositivos pequeños
    } else {
      deviceHeight = 700; // Altura de scroll para dispositivos grandes
    }

    return deviceHeight;
  }

}
