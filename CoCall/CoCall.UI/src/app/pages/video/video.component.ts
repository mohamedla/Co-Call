import { ToastrService } from 'ngx-toastr';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { Component, OnInit } from '@angular/core';
import { VideoCallHubService } from '../../services/video-call-hub.service';
import { ActiveCall } from '../../models/active-chats';
import { VideoCallService } from '../../services/video-call.service';

@Component({
  selector: 'app-video',
  standalone: false,
  templateUrl: './video.component.html',
  styleUrl: './video.component.css'
})
export class VideoComponent implements OnInit {
  isMicMuted = false;
  isCameraOff = false;
  isAudioMuted = false;
  activeCalls : ActiveCall[] = [{ id: 1, userName: 'User1', name: 'User 1' }, { id: 2, userName: 'User2', name: 'User 2' }];
  activeCall: any = null;
  searchResults: User[] = [];
  searchTimeout: any;
  userName = 'johnsmith';
  user: User;

  constructor(
    private userService: UserService,
    private toastr: ToastrService,
    private videoChatHub: VideoCallHubService,
    private videoServ: VideoCallService
  ) {}

  ngOnInit(): void {
    this.userService.verifyUser(this.userName).subscribe(
      (response) => {
        this.user = response;
        // Initialize SignalR connection
        this.initializeSignalRConnection();

        // Load active chats
        this.userService.getActiveCalls(this.user.id).subscribe(
          (response) => {
            this.activeCalls = response;
          },
          (error) => {
            this.toastr.error('Error getting active chats');
            console.error('Error getting active chats:', error);
          }
        );
      },
      (error) => {
        console.error('Error verifying:', error);
      }
    );
  }

  private initializeSignalRConnection(): void {
    this.videoChatHub.startConnection(this.user.id.toString())
      .then(() => {
        this.toastr.success('Connected to video service');

        // Set up call receiving
        this.videoChatHub.onReceiveCallInvitation((caller: string) => {
          this.toastr.info(`Incoming call from ${caller}`);
          // Here you can implement logic to show incoming call UI
        });
      })
      .catch(err => {
        this.toastr.error('Could not connect to video service');
        console.error('Error connecting to VideoHub:', err);
      });
  }

  onSearch(event: any) {
    const query = event.target.value;

    // Clear previous timeout to prevent multiple API calls
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    if (query.trim() === '') {
      this.searchResults = [];
      return;
    }

    // Add delay to avoid making API calls on every keystroke
    this.searchTimeout = setTimeout(() => {
      this.userService.search(query).subscribe(
        (response) => {
          this.searchResults = response;
        },
        (error) => {
          console.error('Error searching:', error);
          this.searchResults = [];
        }
      );
    }, 300);
  }

  createNewCall(user: User) {
    // Check if user is already in active calls
    const existingCall = this.activeCalls.find(call => call.name === user.name);

    if (existingCall) {
      // If call exists, start it
      this.startCall(existingCall);
    } else {
      // Create new call entry
      // const newCall = {
      //   id: this.activeCalls.length + 1,
      //   userName: user.id.toString(),
      //   name: user.name
      // };

      this.videoServ.createCall(this.user.id, user.id).then(
        (response) => {
          const newCall = {
            id: response.id,
            userName: user.userName,
            name: user.name
          };
          // Add to active calls
          this.activeCalls.push(newCall);

          // Start the call
          this.startCall(newCall);
        },
        (error) => {
          this.toastr.error('Error creating call');
          console.error('Error creating call:', error);
        }
      );
    }

    // Clear search results
    this.searchResults = [];
  }

  startCall(call: any) {
    this.activeCall = call;
    this.videoChatHub.sendCallInvitation(this.user.userName, call.userName).then(
      () => {
        this.videoChatHub.enterCall(call.id);
        this.toastr.success(`Calling ${call.name}...`);
      },
      (error) => {
        this.toastr.error('Error sending call invitation');
        console.error('Error sending call invitation:', error);
      }
    );
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
    // In a real app, you would end the call here
    // For example: this.callService.endCall();
  }
}
