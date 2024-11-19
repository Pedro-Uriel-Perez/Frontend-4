import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-buscador',
  templateUrl: './buscador.component.html',
  styleUrls: ['./buscador.component.css']
})
export class BuscadorComponent implements OnInit, AfterViewInit {
  @ViewChild('searchContainer') searchContainer!: ElementRef;
  private scriptLoaded: boolean = false;

  constructor() {}

  ngOnInit() {
    // Verificar si el script ya está cargado
    if (!this.scriptLoaded) {
      this.loadSearchScript();
    }
  }

  ngAfterViewInit() {
    // Si el script no se cargó correctamente, intentar nuevamente
    if (!window.hasOwnProperty('google')) {
      setTimeout(() => {
        this.loadSearchScript();
      }, 100);
    }
  }

  private loadSearchScript() {
    try {
      // Crear el script element
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://cse.google.com/cse.js?cx=52cb930b8bb6344dc';

      // Manejar la carga exitosa
      script.onload = () => {
        this.scriptLoaded = true;
        console.log('Script de búsqueda cargado correctamente');
      };

      // Manejar errores
      script.onerror = () => {
        console.error('Error al cargar el script de búsqueda');
        this.scriptLoaded = false;
      };

      // Añadir el script al documento
      document.head.appendChild(script);
    } catch (error) {
      console.error('Error al inicializar el buscador:', error);
    }
  }
}