import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LanguageSelector } from '../../components/language-selector/language-selector';
import { LanguageService } from '../../core/services/language';
import { vi } from 'vitest';

describe('LanguageSelector', () => {
  let component: LanguageSelector;
  let fixture: ComponentFixture<LanguageSelector>;
  const mockLanguageService = {
      currentLang: vi.fn(),
      setLanguage: vi.fn()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LanguageSelector],
      providers: [
          { provide: LanguageService, useValue: mockLanguageService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LanguageSelector);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
