import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NxWelcome } from './nx-welcome';
import { ProductListComponent } from '@virteex/ui-store';

@Component({
  imports: [NxWelcome, RouterModule, ProductListComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'virteex-store';
}
