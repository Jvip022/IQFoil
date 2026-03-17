import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubirVideoPracticaComponent } from './subir-video-practica.component';

describe('SubirVideoPracticaComponent', () => {
  let component: SubirVideoPracticaComponent;
  let fixture: ComponentFixture<SubirVideoPracticaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubirVideoPracticaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubirVideoPracticaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
