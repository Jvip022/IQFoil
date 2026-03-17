import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BibliotecaOfflineComponent } from './biblioteca-offline.component';

describe('BibliotecaOfflineComponent', () => {
  let component: BibliotecaOfflineComponent;
  let fixture: ComponentFixture<BibliotecaOfflineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BibliotecaOfflineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BibliotecaOfflineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
