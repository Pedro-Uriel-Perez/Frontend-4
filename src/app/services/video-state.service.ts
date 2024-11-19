import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VideoStateService {
  private currentTime: number = 0;

  setCurrentTime(time: number) {
    this.currentTime = time;
  }

  getCurrentTime(): number {
    return this.currentTime;
  }
}
