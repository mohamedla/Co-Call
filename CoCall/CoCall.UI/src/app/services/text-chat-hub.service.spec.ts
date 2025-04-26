import { TestBed } from '@angular/core/testing';

import { TextChatHubService } from './text-chat-hub.service';

describe('TextChatHubService', () => {
  let service: TextChatHubService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TextChatHubService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
