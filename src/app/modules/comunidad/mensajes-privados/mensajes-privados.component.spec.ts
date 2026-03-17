import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MensajesPrivadosComponent } from './mensajes-privados.component';

describe('MensajesPrivadosComponent', () => {
  let component: MensajesPrivadosComponent;
  let fixture: ComponentFixture<MensajesPrivadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MensajesPrivadosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MensajesPrivadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
