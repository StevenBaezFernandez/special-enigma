import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  imports: [RouterModule],
  selector: 'virteex-wms-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly appName = 'Wms';
}
