import { TestBed } from '@angular/core/testing';

import { VideoCallHubService } from './video-call-hub.service';

describe('VideoCallHubService', () => {
  let service: VideoCallHubService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VideoCallHubService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
