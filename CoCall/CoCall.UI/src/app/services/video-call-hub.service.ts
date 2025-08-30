import { ElementRef, Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../environments/environment';
import { User } from '../models/user';
import { NotificationHubService } from './notification-hub.service';

type SessionDesc = { type: 'offer' | 'answer'; sdp: string };
type IceCandidateDto = {
  candidate: string;
  sdpMid?: string;
  sdpMLineIndex?: number;
};

@Injectable({
  providedIn: 'root',
})
export class VideoCallHubService {
  private connection: signalR.HubConnection;

  // WebRTC state
  private pc: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private localVideoEl?: HTMLVideoElement;
  private remoteVideoEl?: HTMLVideoElement;

  private currentCallId: number | null = null;
  private isCaller = false; // simple flag to know who initiates the offer
  private sentOffer = false; // avoid duplicate offers

  private userName: string;

  private config: RTCConfiguration = {
    iceServers: [
      {
        urls: ['stun:localhost:3478', 'turn:localhost:3478'],
        username: 'myuser',
        credential: 'mypassword',
      },
    ],
  };

  private remoteTracksReady = false;
  constructor(private notification: NotificationHubService) {}

  async startConnection(userId: string): Promise<void> {
    this.userName = userId;
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.baseURL}/hubs/videocall`, {
        accessTokenFactory: () => userId, // Pass userId as a token or query string
      })
      .withAutomaticReconnect()
      .build();

    this.registerSignalHandlers();

    await this.connection.start();
    console.log('VideoCallHub connection started');
  }

  private registerSignalHandlers() {
    // generic message logger
    this.connection.on('ReceiveMessage', (msg: string) => {
      console.log('[Hub]', msg);
      if (
        this.isCaller &&
        this.currentCallId &&
        !this.sentOffer &&
        msg.includes('has joined the call')
      ) {
        this.notification.sendNotification(this.userName, "User Join Call", msg);
        this.createAndSendOffer(this.currentCallId).catch(console.error);
      }
    });

    // OFFER received (callee)
    this.connection.on('ReceiveOffer', async (offer: SessionDesc) => {
      try {
        console.log('[SignalR] ReceiveOffer', offer?.type);
        await this.ensurePc();

        const remoteDesc = { type: offer.type as RTCSdpType, sdp: offer.sdp };
        console.log('Setting remote description (offer):', remoteDesc);
        await this.pc!.setRemoteDescription(
          new RTCSessionDescription(remoteDesc)
        );
        console.log('Remote description (offer) set');

        await this.ensureLocalMedia();
        this.addLocalTracksToPc();

        const answer = await this.pc!.createAnswer();
        await this.pc!.setLocalDescription(answer);
        console.log('Created and set localDescription (answer)');

        if (this.currentCallId != null) {
          const dto: SessionDesc = {
            type: answer.type as 'answer',
            sdp: answer.sdp ?? '',
          };
          await this.connection.invoke('SendAnswer', this.currentCallId, dto);
          console.log('[SignalR] Sent Answer via hub');
        }
      } catch (err) {
        console.error('Error handling ReceiveOffer:', err);
      }
    });

    // ANSWER received (caller)
    this.connection.on('ReceiveAnswer', async (answer: SessionDesc) => {
      try {
        console.log('[SignalR] ReceiveAnswer', answer?.type);
        if (!this.pc) {
          console.warn('PC not ready when answer received');
          return;
        }
        const remoteDesc = { type: answer.type as RTCSdpType, sdp: answer.sdp };
        console.log('Setting remote description (answer):', remoteDesc);
        await this.pc.setRemoteDescription(
          new RTCSessionDescription(remoteDesc)
        );
        console.log('Remote description (answer) set');
      } catch (err) {
        console.error('Error handling ReceiveAnswer:', err);
      }
    });

    // ICE candidate from remote
    this.connection.on('ReceiveIceCandidate', async (c: IceCandidateDto) => {
      try {
        console.log('[SignalR] ReceiveIceCandidate', c);
        if (!c || !c.candidate) return;
        await this.pc?.addIceCandidate(
          new RTCIceCandidate({
            candidate: c.candidate,
            sdpMid: c.sdpMid ?? undefined,
            sdpMLineIndex: c.sdpMLineIndex ?? undefined,
          })
        );
        console.log('Added remote ICE candidate');
      } catch (err) {
        console.warn('Failed to add ICE candidate', err);
      }
    });

    // call end / expire
    this.connection.on('CallEnded', (msg: string) => {
      console.log('CallEnded:', msg);
      this.resetPeer();
    });
    this.connection.on('CallExpired', (msg: string) => {
      console.log('CallExpired:', msg);
      this.resetPeer();
    });
  }

  // ---------------- PUBLIC ----------------
  attachVideoElements(
    localRef: ElementRef<HTMLVideoElement>,
    remoteRef: ElementRef<HTMLVideoElement>
  ) {
    this.localVideoEl = localRef.nativeElement;
    this.remoteVideoEl = remoteRef.nativeElement;
  }

  async enterCall(callId: number, asCaller = false) {
    this.currentCallId = callId;
    this.isCaller = asCaller;
    this.sentOffer = false;

    await this.connection.invoke('EnterCall', callId);

    // prepare local media and pc
    await this.ensureLocalMedia();
    await this.ensurePc();

    // add tracks BEFORE creating offer (important)
    this.addLocalTracksToPc();

    if (this.isCaller) {
      // we try to create offer immediately
      await this.createAndSendOffer(callId);
    }
  }

  async leaveCall() {
    if (this.currentCallId != null) {
      await this.connection.invoke('LeaveCall', this.currentCallId);
    }
    this.resetPeer();
  }

  async endCall(enderId: string) {
    if (this.currentCallId != null) {
      await this.connection.invoke('EndCall', this.currentCallId, enderId);
    }
    this.resetPeer();
  }

  async sendCallInvitation(callId: number) {
    await this.connection.invoke('SendCallInvitation', callId);
  }

  onReceiveCallInvitation(callback: (callerName: string) => void): void {
    this.connection.on('ReceiveCallInvitation', callback);
  }

  // media controls
  setMicEnabled(enabled: boolean) {
    //this.localStream?.getAudioTracks().forEach(t => t.enabled = enabled);
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = enabled;
        console.log(`Mic track ${track.id} set to enabled=${enabled}`);
      });
    }
  }
  setCameraEnabled(enabled: boolean) {
    //this.localStream?.getVideoTracks().forEach(t => t.enabled = enabled);
    const isCameraOff = !enabled;

    if (isCameraOff && this.localStream) {
      // Replace actual track with black one
      const sender = this.pc
        ?.getSenders()
        .find((s) => s.track?.kind === 'video');
      if (sender) {
        const blackTrack = this.createBlackVideoTrack();
        sender.replaceTrack(blackTrack);
        console.log('Camera disabled → replaced with black track');
      }
    } else if (!isCameraOff && this.localStream) {
      // Restore real camera track
      const sender = this.pc
        ?.getSenders()
        .find((s) => s.track?.kind === 'video');
      const realTrack = this.localStream.getVideoTracks()[0];
      if (sender && realTrack) {
        sender.replaceTrack(realTrack);
        console.log('Camera enabled → restored real track');
      }
    }
    // const sender = this.pc?.getSenders().find(s => s.track?.kind === 'video');
    // if (!enabled) {
    //   sender?.replaceTrack(null); // stop sending
    //   console.log('Camera disabled → track removed');
    // } else if (this.localStream) {
    //   const realTrack = this.localStream.getVideoTracks()[0];
    //   sender?.replaceTrack(realTrack);
    //   console.log('Camera enabled → track restored');
    // }
  }
  // Helper to create a black dummy track
  private createBlackVideoTrack(): MediaStreamTrack {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const context = canvas.getContext('2d')!;
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);

    const stream = canvas.captureStream();
    return stream.getVideoTracks()[0];
  }

  setRemoteVolume(volume01: number) {
    if (this.remoteVideoEl)
      this.remoteVideoEl.volume = Math.max(0, Math.min(1, volume01));
  }

  // ---------------- INTERNALS ----------------
  private async ensureLocalMedia() {
    if (this.localStream) return;
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      if (this.localVideoEl) this.localVideoEl.srcObject = this.localStream;
      console.log('Local media obtained:', this.localStream);
    } catch (err) {
      console.error('getUserMedia error', err);
      throw err;
    }
  }

  private addLocalTracksToPc() {
    if (!this.pc || !this.localStream) return;
    // Avoid adding duplicate senders: check existing senders' tracks
    const existingTrackIds = new Set(
      this.pc.getSenders().map((s) => s.track?.id)
    );
    for (const track of this.localStream.getTracks()) {
      if (!existingTrackIds.has(track.id)) {
        this.pc.addTrack(track, this.localStream);
        console.log('Adding local track:', track);
      }
    }
  }

  private async ensurePc() {
    if (this.pc) return;

    // const config: RTCConfiguration = {
    //   iceServers: [
    //     { urls: 'stun:stun.l.google.com:19302' }
    //     // Add TURN servers here for production
    //   ]
    // };
    this.pc = new RTCPeerConnection(this.config);

    // remote stream and ontrack
    this.remoteStream = new MediaStream();
    if (this.remoteVideoEl) this.remoteVideoEl.srcObject = this.remoteStream;
    console.log('Remote media obtained:', this.remoteStream);

    this.pc.ontrack = (e) => {
      console.log('ontrack event:', e.streams);
      e.streams[0].getTracks().forEach((track) => {
        // Prevent adding your own audio back into remoteStream
        if (
          this.localStream?.getTracks().some((t) => t.label === track.label)
        ) {
          console.log('Skipping local mic loopback track:', track.label);
          return;
        }

        this.remoteStream?.addTrack(track);
        console.log(
          'Added remote track to remoteStream:',
          track.kind,
          track.id
        );
      });
      if (this.remoteVideoEl) {
        this.remoteVideoEl.srcObject = this.remoteStream!;
      }
      this.remoteTracksReady = true;
    };

    // ICE: send to the other group members
    this.pc.onicecandidate = async (e) => {
      if (e.candidate && this.currentCallId != null) {
        const dto: IceCandidateDto = {
          candidate: e.candidate.candidate,
          sdpMid: e.candidate.sdpMid ?? undefined,
          sdpMLineIndex: e.candidate.sdpMLineIndex ?? undefined,
        };
        try {
          await this.connection.invoke(
            'SendIceCandidate',
            this.currentCallId,
            dto
          );
          console.log('Sent local ICE candidate');
        } catch (err) {
          console.warn('Failed to send ICE candidate via hub', err);
        }
      }
    };

    this.pc.onconnectionstatechange = () => {
      console.log('pc.connectionState =', this.pc!.connectionState);
    };
    this.pc.oniceconnectionstatechange = () => {
      console.log('pc.iceConnectionState =', this.pc!.iceConnectionState);
    };
  }

  private async createAndSendOffer(callId: number) {
    try {
      if (!this.pc) await this.ensurePc();
      if (!this.pc) throw new Error('PC not available');

      // await this.ensureLocalMedia();
      // this.addLocalTracksToPc();

      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);
      console.log('Created offer and set local description', offer);

      const dto: SessionDesc = {
        type: offer.type as 'offer',
        sdp: offer.sdp ?? '',
      };
      await this.connection.invoke('SendOffer', callId, dto);
      this.sentOffer = true;
      console.log('[SignalR] Sent Offer via hub');
    } catch (err) {
      console.error('createAndSendOffer failed:', err);
    }
  }

  private resetPeer() {
    try {
      const sender = this.pc
        ?.getSenders()
        .find((s) => s.track?.kind === 'video');
      if (sender) {
        sender.replaceTrack(this.createBlackVideoTrack());
      }

      this.pc?.getSenders().forEach((s) => {
        try {
          s.track?.stop();
        } catch {}
      });
      this.pc?.close();
    } catch (e) {
      console.warn('Error closing pc', e);
    }
    this.pc = null;

    try {
      this.localStream?.getTracks().forEach((t) => t.stop());
    } catch {}
    this.localStream = null;

    this.remoteStream = null;

    if (this.localVideoEl) this.localVideoEl.srcObject = null;
    console.log('Local video element srcObject cleared');

    if (this.remoteVideoEl) this.remoteVideoEl.srcObject = null;
    console.log('Remote video element srcObject cleared');

    this.currentCallId = null;
    this.isCaller = false;
    this.sentOffer = false;
  }

  localRecorder: MediaRecorder;
  remoteRecorder: MediaRecorder;
  recordedChunks: BlobPart[] = [];
  startRecording() {
    if (!this.remoteTracksReady) {
      console.warn('Remote stream not ready yet, delaying recording...');
      // wait a bit or subscribe to an event
      return;
    }

    if (!this.pc) return;
    // mix both local + remote into one MediaStream
    const localStream = new MediaStream();
    const remoteStream = new MediaStream();
    this.pc.getSenders().forEach((sender) => {
      if (sender.track) localStream.addTrack(sender.track);
    });
    this.pc.getReceivers().forEach((receiver) => {
      if (receiver.track) remoteStream.addTrack(receiver.track);
    });

    this.localRecorder = new MediaRecorder(localStream, {
      mimeType: 'video/webm; codecs=vp8,opus',
    });

    this.remoteRecorder = new MediaRecorder(remoteStream, {
      mimeType: 'video/webm; codecs=vp8,opus',
    });

    this.recordedChunks = [];

    this.localRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    this.remoteRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    this.localRecorder.onstop = () => {
      const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
      this.uploadRecording(
        blob,
        this.currentCallId + '-LocalCallRecording.webm'
      );
      this.recordedChunks = [];
    };

    this.remoteRecorder.onstop = () => {
      const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
      this.uploadRecording(blob, this.currentCallId + '-allRecording.webm');
      this.recordedChunks = [];
    };

    this.localRecorder.start();
    this.remoteRecorder.start();
    console.log('Recording started');
  }

  stopRecording() {
    this.localRecorder.stop();
    this.remoteRecorder.stop();
    console.log('Recording stopped');
  }

  audioRecord: MediaRecorder;
  startAudioRecording(): boolean {
    if (!this.remoteTracksReady) {
      console.warn('Remote stream not ready yet, delaying recording...');
      // wait a bit or subscribe to an event
      return false;
    }

    if (!this.pc) return false;

    if (!this.localStream && !this.remoteStream) return false;

    const audioContext = new AudioContext();
    const destination = audioContext.createMediaStreamDestination();

    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        const src = audioContext.createMediaStreamSource(
          new MediaStream([track])
        );
        src.connect(destination);
      });
    }

    if (this.remoteStream) {
      this.remoteStream.getAudioTracks().forEach((track) => {
        const src = audioContext.createMediaStreamSource(
          new MediaStream([track])
        );
        src.connect(destination);
      });
    }

    const audioStream = destination.stream;
    this.audioRecord = new MediaRecorder(audioStream, {
      mimeType: 'audio/webm; codecs=opus',
    });
    this.recordedChunks = [];

    this.audioRecord.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    this.audioRecord.onstop = () => {
      const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
      this.uploadRecording(
        blob,
        this.currentCallId + '-CallAudioRecording.webm'
      );
      this.recordedChunks = [];
    };

    this.audioRecord.start();
    console.log('Audio recording started');
    return true;
  }

  stopAudioRecording() {
    this.audioRecord.stop();
    console.log('Audio Recording stopped');
  }

  private uploadRecording(blob: Blob, fileName: string) {
    const formData = new FormData();
    formData.append('file', blob, fileName);

    fetch(`${environment.baseURL}/api/recording/upload`, {
      method: 'POST',
      body: formData,
    })
      .then((r) => console.log('Uploaded recording'))
      .catch((e) => console.error('Upload failed', e));
  }
}
