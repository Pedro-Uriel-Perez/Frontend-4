import { AfterViewInit, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, AfterViewInit {
  constructor() { }

  ngOnInit() {
    this.loadGoogleSearch();
  }

  ngAfterViewInit() {
    if (!(window as any).google) {
      setTimeout(() => {
        this.loadGoogleSearch();
      }, 100);
    }
  }

  private loadGoogleSearch() {
    try {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://cse.google.com/cse.js?cx=52cb930b8bb6344dc';
      document.head.appendChild(script);
    } catch (error) {
      console.error('Error al cargar el buscador:', error);
    }
  }
}
