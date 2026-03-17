import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadoConexionComponent } from './estado-conexion.component';

describe('EstadoConexionComponent', () => {
  let component: EstadoConexionComponent;
  let fixture: ComponentFixture<EstadoConexionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstadoConexionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstadoConexionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
