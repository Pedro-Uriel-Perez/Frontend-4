import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicoLoginComponent } from './medico-login.component';

describe('DoctorLoginComponent', () => {
  let component: MedicoLoginComponent;
  let fixture: ComponentFixture<MedicoLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MedicoLoginComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MedicoLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
