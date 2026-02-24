import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NxWelcome } from './nx-welcome';
import { ScanComponent } from '@virteex/inventory-ui-wms';

@Component({
  imports: [NxWelcome, RouterModule, ScanComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'virteex-wms';
}
