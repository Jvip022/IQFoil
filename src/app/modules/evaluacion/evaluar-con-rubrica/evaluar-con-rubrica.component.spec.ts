import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluarConRubricaComponent } from './evaluar-con-rubrica.component';

describe('EvaluarConRubricaComponent', () => {
  let component: EvaluarConRubricaComponent;
  let fixture: ComponentFixture<EvaluarConRubricaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvaluarConRubricaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvaluarConRubricaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
