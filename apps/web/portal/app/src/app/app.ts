import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ThemeService } from '@virteex/shared-ui';

@Component({
  imports: [RouterModule],
  selector: 'virteex-web-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly appName = 'Web';
  private readonly themeService = inject(ThemeService);
}
