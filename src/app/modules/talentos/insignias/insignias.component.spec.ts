import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsigniasComponent } from './insignias.component';

describe('InsigniasComponent', () => {
  let component: InsigniasComponent;
  let fixture: ComponentFixture<InsigniasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InsigniasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InsigniasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
