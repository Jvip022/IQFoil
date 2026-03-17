import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteProgresoComponent } from './reporte-progreso.component';

describe('ReporteProgresoComponent', () => {
  let component: ReporteProgresoComponent;
  let fixture: ComponentFixture<ReporteProgresoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteProgresoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteProgresoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
