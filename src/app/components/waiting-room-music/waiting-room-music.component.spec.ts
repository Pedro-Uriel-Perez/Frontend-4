import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaitingRoomMusicComponent } from './waiting-room-music.component';

describe('WaitingRoomMusicComponent', () => {
  let component: WaitingRoomMusicComponent;
  let fixture: ComponentFixture<WaitingRoomMusicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WaitingRoomMusicComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WaitingRoomMusicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
