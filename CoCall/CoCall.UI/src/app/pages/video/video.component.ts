import { Component } from '@angular/core';

@Component({
  selector: 'app-video',
  standalone: false,
  templateUrl: './video.component.html',
  styleUrl: './video.component.css'
})
export class VideoComponent {
  activeCalls = [{ name: 'User1' }, { name: 'User2' }];
  activeCall: any = null;

  onSearch(event: any) {
    const query = event.target.value;
    console.log('Search query:', query);
  }

  startCall(call: any) {
    this.activeCall = call;
  }

  toggleMic() {
    console.log('Toggle mic');
  }

  toggleSpeaker() {
    console.log('Toggle speaker');
  }

  toggleCamera() {
    console.log('Toggle camera');
  }

  hangUp() {
    this.activeCall = null;
  }
}
