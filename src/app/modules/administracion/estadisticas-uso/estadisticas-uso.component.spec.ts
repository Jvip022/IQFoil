import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadisticasUsoComponent } from './estadisticas-uso.component';

describe('EstadisticasUsoComponent', () => {
  let component: EstadisticasUsoComponent;
  let fixture: ComponentFixture<EstadisticasUsoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstadisticasUsoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstadisticasUsoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
