import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionRubricasComponent } from './gestion-rubricas.component';

describe('GestionRubricasComponent', () => {
  let component: GestionRubricasComponent;
  let fixture: ComponentFixture<GestionRubricasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionRubricasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionRubricasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
