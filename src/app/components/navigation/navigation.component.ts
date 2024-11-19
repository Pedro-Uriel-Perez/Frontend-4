import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html', 
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {
  ngOnInit(): void {
    this.ensureVideoPlayback();
  }

  ensureVideoPlayback(): void {
    const video = document.getElementById('background-video') as HTMLVideoElement;
    if (video) {
      video.play().catch(() => {
        video.muted = true;
        video.play();
      });
    }
  }
}




