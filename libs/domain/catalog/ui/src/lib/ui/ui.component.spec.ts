import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CatalogUiComponent } from './ui.component';

describe('CatalogUiComponent', () => {
  let component: CatalogUiComponent;
  let fixture: ComponentFixture<CatalogUiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogUiComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
