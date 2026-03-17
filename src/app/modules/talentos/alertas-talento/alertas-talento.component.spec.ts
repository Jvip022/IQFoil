import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertasTalentoComponent } from './alertas-talento.component';

describe('AlertasTalentoComponent', () => {
  let component: AlertasTalentoComponent;
  let fixture: ComponentFixture<AlertasTalentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertasTalentoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlertasTalentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
