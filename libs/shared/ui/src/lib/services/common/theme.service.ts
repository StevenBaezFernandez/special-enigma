import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly THEME_KEY = 'virteex-theme';

  public theme = signal<Theme>(this.getStoredTheme());

  constructor() {
    effect(() => {
      const currentTheme = this.theme();
      this.applyTheme(currentTheme);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.THEME_KEY, currentTheme);
      }
    });

    // Listen for system theme changes if in 'system' mode
    if (typeof window !== 'undefined' && window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (this.theme() === 'system') {
          this.applyTheme('system');
        }
      });
    }
  }

  public setTheme(theme: Theme) {
    this.theme.set(theme);
  }

  public toggleTheme() {
    const current = this.theme();
    if (current === 'light') this.setTheme('dark');
    else if (current === 'dark') this.setTheme('system');
    else this.setTheme('light');
  }

  private getStoredTheme(): Theme {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(this.THEME_KEY) as Theme;
      return stored || 'system';
    }
    return 'system';
  }

  private applyTheme(theme: Theme) {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    let isDark = theme === 'dark';

    if (theme === 'system' && typeof window !== 'undefined' && window.matchMedia) {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }
}
