import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { VideoCallHubService } from '../../services/video-call-hub.service';
import { ActiveCall } from '../../models/active-chats';
import { VideoCallService } from '../../services/video-call.service';
import { ActivatedRoute } from '@angular/router';
import { NotificationHubService } from '../../services/notification-hub.service';

@Component({
  selector: 'app-video',
  standalone: false,
  templateUrl: './video.component.html',
  styleUrl: './video.component.css'
})
export class VideoComponent implements OnInit, AfterViewInit {
  @ViewChild('localVideo',  { static: false }) localVideoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo', { static: false }) remoteVideoRef!: ElementRef<HTMLVideoElement>;

  isMicMuted = false;
  isCameraOff = false;
  isAudioMuted = false;
  isRecording = false;
  isAudioRecording = false;

  activeCalls : ActiveCall[] = [];
  activeCall: ActiveCall | null = null;

  searchResults: User[] = [];
  searchTimeout: any;

  userName = 'johnsmith';
  user: User;

  constructor(
    private userService: UserService,
    private toastr: ToastrService,
    private hub: VideoCallHubService,
    private videoServ: VideoCallService,
    private activeroute: ActivatedRoute,
    private notification: NotificationHubService
  ) {
    this.activeroute.queryParams.subscribe(params => {
      this.userName = params['username'] || this.userName;
    });
  }

  async ngOnInit() {
    this.user = await this.userService.verifyUser(this.userName).toPromise();
    await this.hub.startConnection(this.user.userName.toString()).then(() => {
      // Set up call receiving
      this.hub.onReceiveCallInvitation((callerName: string) => {
        this.toastr.info(`Incoming call from ${callerName}`);
      });

      this.toastr.success('Connected to video service')
    }).catch(err => {
      this.toastr.error('Could not connect to video service')
      console.error('Error connecting to VideoHub:', err)
    });


    //Load active calls list
    this.userService.getActiveCalls(this.user.id).subscribe({
      next: (calls) => this.activeCalls = calls,
      error: () => this.toastr.error('Error getting active calls')
    });
  }

  async ngAfterViewInit() {
    this.hub.attachVideoElements(this.localVideoRef, this.remoteVideoRef);
  }

  hideActiveCall(): boolean {
    return this.activeCall === null;
  }

  async startCall(call: ActiveCall) {
    this.activeCall = call;
    // enter as caller (this will create offer)
    await this.hub.enterCall(call.id, true);
    this.toastr.success(call.userName === this.user.userName? `Calling ${call.name}...`: 'Joined call');
  }

  joinCall(call: ActiveCall) {
    this.activeCall = call;
    if(!call.IsCaller){
      this.acceptIncoming(call);
    }else{
      this.startCall(call);
    }
  }

  async acceptIncoming(call: ActiveCall) {
    this.activeCall = { id: call.id, userName: call.userName, name: call.name, IsCaller: false };

    this.notification.sendNotification(call.userName, "Call Acceptance", this.user.name + " accept your call");
    await this.hub.enterCall(call.id, false);
    this.toastr.info('Joined call');
  }

  toggleMic() {
    this.isMicMuted = !this.isMicMuted;
    this.hub.setMicEnabled(!this.isMicMuted);
  }

  toggleCamera() {
    this.isCameraOff = !this.isCameraOff;
    this.hub.setCameraEnabled(!this.isCameraOff);
  }

  toggleSpeaker() {
    this.isAudioMuted = !this.isAudioMuted;
    this.hub.setRemoteVolume(this.isAudioMuted ? 0 : 1);
  }

  toggleRecording() {
    this.isRecording = !this.isRecording;
    if(this.isRecording){
      this.toastr.info('Recording started');
      this.hub.startRecording();
    }else{
      this.toastr.info('Recording stopped');
      this.hub.stopRecording();
    }
  }

  toggleAudioRecording() {
    this.isAudioRecording = !this.isAudioRecording;
    if(this.isAudioRecording){
      if(this.hub.startAudioRecording()){
        this.toastr.info('Recording started');
      }else{
        this.toastr.error('Cannot start audio recording. Remote stream not ready yet.');
        this.isAudioRecording = false;
      }

    }else{
      this.toastr.info('Recording stopped');
      this.hub.stopAudioRecording();
    }
  }

  async hangUp() {
    await this.hub.leaveCall();
    this.activeCall = null;
  }

  async endCall() {
    await this.hub.endCall(this.user.userName);
    this.activeCall = null;
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
      if(existingCall.IsCaller) this.hub.sendCallInvitation(existingCall.id);
      this.notification.sendNotification(existingCall.userName, "Call Invitation", existingCall.name + " Send you a call invitation again");
      this.startCall(existingCall);
    } else {
      this.videoServ.createCall(this.user.id, user.id).then(
        (response) => {
          const newCall = {
            id: response.id,
            userName: user.userName,
            name: user.name,
            IsCaller: true
          };
          // Add to active calls
          this.activeCalls.push(newCall);
          // Send Call Invetation
          this.hub.sendCallInvitation(response.id);
          this.notification.sendNotification(response.userName, "Call Invitation", response.name + " Send you a call invitation.");
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
}
