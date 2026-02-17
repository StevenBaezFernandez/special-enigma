import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NxWelcome } from './nx-welcome';
import { KioskComponent } from '@virteex/ui-shopfloor';

@Component({
  imports: [NxWelcome, RouterModule, KioskComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'virteex-shopfloor';
}
