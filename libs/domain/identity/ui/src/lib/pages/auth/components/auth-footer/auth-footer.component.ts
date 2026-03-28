import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { LanguageSelector } from '@virteex/shared-ui';

@Component({
  selector: 'virteex-auth-footer',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule,
    LucideAngularModule,
    LanguageSelector
  ],
  templateUrl: './auth-footer.component.html',
  styleUrls: ['./auth-footer.component.scss']
})
export class AuthFooterComponent {
  readonly currentYear = new Date().getFullYear();
}
