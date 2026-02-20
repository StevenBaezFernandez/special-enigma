import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'virteex-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="header">
      <div class="header-left">
        <!-- Breadcrumb or Search -->
        <input type="text" placeholder="Search tenants, logs..." class="search-box">
      </div>
      <div class="header-right">
        @if (currentUser$ | async; as user) {
          <div class="user-info">
            <span>{{ user.email }}</span>
            <button (click)="logout()" class="logout-btn">Logout</button>
          </div>
        }
      </div>
    </header>
  `,
  styles: [`
    .header {
      height: 64px;
      background-color: #fff;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      position: fixed;
      top: 0;
      left: 250px; /* Sidebar width */
      right: 0;
      z-index: 10;
    }
    .search-box {
      padding: 8px 12px;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      width: 300px;
    }
    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logout-btn {
      background: none;
      border: 1px solid #cbd5e0;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
    }
    .logout-btn:hover {
      background-color: #f7fafc;
    }
  `]
})
export class HeaderComponent {
  authService = inject(AuthService);
  currentUser$ = this.authService.currentUser$;

  logout() {
    this.authService.logout();
  }
}
