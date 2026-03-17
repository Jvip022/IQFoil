import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgresoModuloComponent } from './progreso-modulo.component';

describe('ProgresoModuloComponent', () => {
  let component: ProgresoModuloComponent;
  let fixture: ComponentFixture<ProgresoModuloComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgresoModuloComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgresoModuloComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
