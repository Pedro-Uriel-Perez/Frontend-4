import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatesService } from '../../services/dates.service'; 

@Component({
  selector: 'app-auth-callback',
  template: '<p>Procesando autenticación...</p>'
})
export class AuthCallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private datesService: DatesService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        this.datesService.handleAuthResponse(params['token']).subscribe(
          (user: any) => {
            console.log('Usuario autenticado:', user);
            localStorage.setItem('userId', user.id);
            localStorage.setItem('userName', user.name);
            this.router.navigate(['/citas', { userId: user.id, userName: user.name }]);
          },
          error => {
            console.error('Error en la autenticación:', error);
            this.router.navigate(['/login']);
          }
        );
      } else {
        this.router.navigate(['/login']);
      }
    });
  }
}