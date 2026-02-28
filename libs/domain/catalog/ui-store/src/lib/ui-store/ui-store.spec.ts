import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiStore } from './ui-store';

describe('UiStore', () => {
  let component: UiStore;
  let fixture: ComponentFixture<UiStore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiStore],
    }).compileComponents();

    fixture = TestBed.createComponent(UiStore);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
