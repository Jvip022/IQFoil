import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarioEventosComponent } from './calendario-eventos.component';

describe('CalendarioEventosComponent', () => {
  let component: CalendarioEventosComponent;
  let fixture: ComponentFixture<CalendarioEventosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarioEventosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarioEventosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
