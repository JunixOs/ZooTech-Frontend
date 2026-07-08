import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AdminUserApiService } from '../../infrastructure/admin-user-api.service';

@Component({
  selector: 'zt-admin-dashboard',
  standalone: true,
  imports: [TranslatePipe, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent implements OnInit {
  private readonly adminUserService = inject(AdminUserApiService);

  readonly totalUsers = signal<number>(0);
  readonly loadingUsers = signal<boolean>(false);

  ngOnInit(): void {
    this.loadUserCount();
  }

  private loadUserCount(): void {
    this.loadingUsers.set(true);
    this.adminUserService.listAdminUsers().subscribe({
      next: (users) => {
        this.totalUsers.set(users.length);
        this.loadingUsers.set(false);
      },
      error: () => {
        this.totalUsers.set(0);
        this.loadingUsers.set(false);
      },
    });
  }
}
