
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThemeToggle } from '../../components/theme-toggle/theme-toggle';
import { ThemeService } from '../../core/services/theme';
import { vi } from 'vitest';
import { signal } from '@angular/core';

describe('ThemeToggle', () => {
  let component: ThemeToggle;
  let fixture: ComponentFixture<ThemeToggle>;

  // Update mock to match usage: ctx.themeService.themeMode() (signal access)
  // or themeMode (signal property)
  const mockThemeService = {
      themeMode: signal('light'),
      setTheme: vi.fn(),
      toggleTheme: vi.fn()
  };

  beforeEach(async () => {
    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    await TestBed.configureTestingModule({
      imports: [ThemeToggle],
      providers: [
          { provide: ThemeService, useValue: mockThemeService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThemeToggle);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
