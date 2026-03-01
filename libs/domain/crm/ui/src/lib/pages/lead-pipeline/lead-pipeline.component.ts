import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'virteex-lead-pipeline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-6">Lead Pipeline</h1>

      <div *ngIf="loading" class="text-blue-500 text-center py-10">Loading pipeline...</div>
      <div *ngIf="error" class="text-red-500 mb-4">{{ error }}</div>

      <div *ngIf="!loading && !error && pipeline.length > 0" class="flex flex-wrap md:flex-nowrap gap-4 overflow-x-auto pb-4">
        <div *ngFor="let stage of pipeline" class="bg-gray-100 rounded p-4 min-w-[300px] flex-shrink-0">
          <h2 class="text-lg font-bold mb-4 flex justify-between">
            {{ stage.name }}
            <span class="bg-gray-200 px-2 py-0.5 rounded text-sm text-gray-600">{{ stage.leads?.length || 0 }}</span>
          </h2>

          <div class="space-y-3">
            <div *ngFor="let lead of stage.leads" class="bg-white p-4 rounded shadow-sm border-l-4" [class.border-blue-500]="lead.priority === 'HIGH'" [class.border-gray-300]="lead.priority !== 'HIGH'">
              <p class="font-semibold text-sm">{{ lead.title }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ lead.company }}</p>
              <div class="flex justify-between items-center mt-3">
                <span class="text-xs font-bold text-gray-600">{{ lead.value | currency }}</span>
                <span class="text-[10px] text-gray-400">{{ lead.lastActivity | date }}</span>
              </div>
            </div>
          </div>

          <button class="w-full mt-4 py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded hover:bg-gray-50 transition-colors text-sm font-medium">
            + Add Lead
          </button>
        </div>
      </div>

      <div *ngIf="!loading && !error && pipeline.length === 0" class="text-center py-12 bg-gray-50 rounded border-2 border-dashed border-gray-200">
        <p class="text-gray-500">No lead pipeline stages configured.</p>
        <button class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Setup Pipeline</button>
      </div>
    </div>
  `,
})
export class LeadPipelineComponent implements OnInit {
  private http = inject(HttpClient);
  pipeline: any[] = [];
  loading = true;
  error = '';

  ngOnInit() {
    this.http.get<any[]>('/api/crm/pipeline')
      .pipe(
        catchError(err => {
          this.error = 'Failed to load pipeline data.';
          return of([]);
        })
      )
      .subscribe(data => {
        this.pipeline = data;
        this.loading = false;
      });
  }
}
