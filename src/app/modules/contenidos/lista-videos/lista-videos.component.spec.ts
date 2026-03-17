import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaVideosComponent } from './lista-videos.component';

describe('ListaVideosComponent', () => {
  let component: ListaVideosComponent;
  let fixture: ComponentFixture<ListaVideosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaVideosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaVideosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
