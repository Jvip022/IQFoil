import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamenTeoricoComponent } from './examen-teorico.component';

describe('ExamenTeoricoComponent', () => {
  let component: ExamenTeoricoComponent;
  let fixture: ComponentFixture<ExamenTeoricoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamenTeoricoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExamenTeoricoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
