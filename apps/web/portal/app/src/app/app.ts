import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  imports: [RouterModule],
  selector: 'virteex-web-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly appName = 'Web';
}
