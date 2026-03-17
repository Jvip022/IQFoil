import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HiloDetalleComponent } from './hilo-detalle.component';

describe('HiloDetalleComponent', () => {
  let component: HiloDetalleComponent;
  let fixture: ComponentFixture<HiloDetalleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HiloDetalleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HiloDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
