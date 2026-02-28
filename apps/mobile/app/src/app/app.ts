import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SyncService } from './core/services/sync.service';

@Component({
  imports: [RouterModule],
  selector: 'virteex-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'virteex-mobile';
  private syncService = inject(SyncService);
}
