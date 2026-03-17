import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MentoriasComponent } from './mentorias.component';

describe('MentoriasComponent', () => {
  let component: MentoriasComponent;
  let fixture: ComponentFixture<MentoriasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MentoriasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MentoriasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
