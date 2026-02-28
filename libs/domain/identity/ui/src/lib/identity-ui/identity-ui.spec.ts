import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IdentityUi } from './identity-ui';

describe('IdentityUi', () => {
  let component: IdentityUi;
  let fixture: ComponentFixture<IdentityUi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IdentityUi],
    }).compileComponents();

    fixture = TestBed.createComponent(IdentityUi);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
