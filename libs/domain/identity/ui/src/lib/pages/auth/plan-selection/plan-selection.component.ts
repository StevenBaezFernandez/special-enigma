import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthLayoutComponent } from '../components/auth-layout/auth-layout.component';
import { AuthService, LanguageService, CountryService, BillingService } from '@virteex/shared-ui';

@Component({
  selector: 'virteex-plan-selection',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, AuthLayoutComponent],
  templateUrl: './plan-selection.component.html',
  styleUrls: ['./plan-selection.component.scss']
})
export class PlanSelectionComponent implements OnInit {
  private authService = inject(AuthService);
  private billingService = inject(BillingService);
  private router = inject(Router);
  private languageService = inject(LanguageService);
  private countryService = inject(CountryService);

  isLoading = signal(true);
  plans = this.billingService.plans;

  ngOnInit() {
    this.authService.getOnboardingStatus().subscribe({
      next: (status) => {
        if (status.isCompleted) {
          this.navigateToHome();
        } else if (status.step !== 'plan_selection') {
          this.isLoading.set(false);
        } else {
          this.isLoading.set(false);
        }
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  private navigateToHome() {
    const lang = this.languageService.currentLang();
    const country = this.countryService.currentCountryCode();
    this.router.navigate(['/', lang, country, 'accounting']);
  }

  selectPlan(planId: string) {
    this.billingService.changePlan(planId).subscribe(success => {
      if (success) {
        // Redirection happens in service
      }
    });
  }
}
