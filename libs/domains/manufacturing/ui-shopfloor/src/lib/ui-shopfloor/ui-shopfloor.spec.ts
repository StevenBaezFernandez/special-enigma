import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiShopfloor } from './ui-shopfloor';

describe('UiShopfloor', () => {
  let component: UiShopfloor;
  let fixture: ComponentFixture<UiShopfloor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiShopfloor],
    }).compileComponents();

    fixture = TestBed.createComponent(UiShopfloor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
