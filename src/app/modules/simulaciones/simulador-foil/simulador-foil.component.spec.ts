import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimuladorFoilComponent } from './simulador-foil.component';

describe('SimuladorFoilComponent', () => {
  let component: SimuladorFoilComponent;
  let fixture: ComponentFixture<SimuladorFoilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimuladorFoilComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimuladorFoilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
