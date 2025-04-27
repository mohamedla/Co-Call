import { Component } from '@angular/core';

@Component({
  selector: 'app-video',
  standalone: false,
  templateUrl: './video.component.html',
  styleUrl: './video.component.css'
})
export class VideoComponent {
  isMicMuted = false;
  isCameraOff = false;
  isAudioMuted = false;
  activeCalls = [{ id: 1, name: 'User1' }, { id: 2, name: 'User2' }];
  activeCall: any = null;

  onSearch(event: any) {
    const query = event.target.value;
    console.log('Search query:', query);
  }

  startCall(call: any) {
    this.activeCall = call;
  }

  toggleMic() {
    this.isMicMuted = !this.isMicMuted;
    // const localStream = this.callService.getLocalStream();
    // if (localStream) {
    //   const audioTracks = localStream.getAudioTracks();
    //   audioTracks.forEach(track => {
    //     track.enabled = !this.isMicMuted;
    //   });
    // }
  }

  toggleSpeaker() {
    this.isAudioMuted = !this.isAudioMuted;
    // if (this.remoteVideo?.nativeElement) {
    //   // Control the volume of the remote video element
    //   this.remoteVideo.nativeElement.volume = this.isAudioMuted ? 0 : 1;
    // }
  }

  toggleCamera() {
    this.isCameraOff = !this.isCameraOff;
    // const localStream = this.callService.getLocalStream();
    // if (localStream) {
    //   const videoTracks = localStream.getVideoTracks();
    //   videoTracks.forEach(track => {
    //     track.enabled = !this.isCameraOff;
    //   });
    // }
  }

  hangUp() {
    this.activeCall = null;
  }
}
