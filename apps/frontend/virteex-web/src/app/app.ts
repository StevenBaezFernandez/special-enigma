import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoadingService } from '@virteex/shared-util-http';
import { CommonModule } from '@angular/common';

@Component({
  imports: [RouterModule, CommonModule],
  selector: 'virteex-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  title = 'virteex-web';
  loadingService = inject(LoadingService);
}
