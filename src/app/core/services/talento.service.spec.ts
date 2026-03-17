import { TestBed } from '@angular/core/testing';

import { TalentoService } from './talento.service';

describe('TalentoService', () => {
  let service: TalentoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TalentoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
