import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { interval, switchMap, takeWhile, of } from 'rxjs';

@Component({
  selector: 'app-onboarding-wizard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8 max-w-2xl mx-auto bg-white shadow-lg rounded-xl">
      <h2 class="text-2xl font-bold mb-4">Setting up your Enterprise ERP</h2>
      <p class="text-gray-600 mb-8">We are provisioning your dedicated environment. This usually takes 1-2 minutes.</p>

      <div class="space-y-6">
        <div *ngFor="let step of steps" class="flex items-center gap-4">
          <div [ngClass]="{
            'bg-green-500': progress >= step.threshold,
            'bg-blue-500 animate-pulse': status === step.status,
            'bg-gray-200': progress < step.threshold && status !== step.status
          }" class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold">
            <span *ngIf="progress < step.threshold && status !== step.status">{{ step.id }}</span>
            <span *ngIf="progress >= step.threshold">✓</span>
            <span *ngIf="status === step.status" class="text-xs">...</span>
          </div>
          <div class="flex-1">
            <p class="font-medium" [class.text-green-600]="progress >= step.threshold">{{ step.name }}</p>
            <p class="text-sm text-gray-500">{{ step.description }}</p>
          </div>
        </div>
      </div>

      <div class="mt-10 pt-6 border-t">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm font-bold text-blue-600">{{ status }}</span>
          <span class="text-sm font-bold">{{ progress }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2.5">
          <div class="bg-blue-600 h-2.5 rounded-full transition-all duration-500" [style.width.%]="progress"></div>
        </div>
      </div>

      <div *ngIf="status === 'COMPLETED'" class="mt-8 p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-3">
         <span class="text-2xl">🎉</span>
         <div>
            <p class="font-bold">Your environment is ready!</p>
            <button class="text-sm underline">Go to Dashboard</button>
         </div>
      </div>
    </div>
  `,
})
export class OnboardingWizardComponent implements OnInit {
  private http = inject(HttpClient);

  tenantId = 'new-tenant-123'; // Dynamic in real usage
  progress = 0;
  status = 'STARTING';
  message = '';

  steps = [
    { id: 1, name: 'Database Creation', status: 'DATABASE_CREATION', threshold: 20, description: 'Allocating physical storage and dedicated instances.' },
    { id: 2, name: 'Schema Migration', status: 'SCHEMA_MIGRATION', threshold: 50, description: 'Structuring the enterprise-grade ledger.' },
    { id: 3, name: 'Initial Seeding', status: 'SEEDING', threshold: 80, description: 'Populating catalogs and fiscal rules.' }
  ];

  ngOnInit() {
    // Poll for real status from the Admin API
    interval(2000)
      .pipe(
        switchMap(() => this.http.get<any>(`/api/admin/tenants/${this.tenantId}/provisioning-status`)),
        takeWhile(data => data.status !== 'COMPLETED' && data.status !== 'FAILED', true)
      )
      .subscribe({
        next: (data) => {
          this.progress = data.progress;
          this.status = data.status;
          this.message = data.message;
        },
        error: () => {
          this.status = 'FAILED';
          this.message = 'Connection lost. Please contact support.';
        }
      });
  }
}
