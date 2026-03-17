import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelMetricasComponent } from './panel-metricas.component';

describe('PanelMetricasComponent', () => {
  let component: PanelMetricasComponent;
  let fixture: ComponentFixture<PanelMetricasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelMetricasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanelMetricasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
