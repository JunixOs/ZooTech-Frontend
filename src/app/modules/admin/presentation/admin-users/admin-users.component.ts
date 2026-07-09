import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { AdminUser } from '../../domain/admin-user.model';
import { AdminUserApiService } from '../../infrastructure/admin-user-api.service';
import { AdminUserFormComponent } from '../admin-user-form/admin-user-form.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { ColumnConfig } from '@shared/models/table-config.model';

@Component({
  selector: 'zt-admin-users',
  standalone: true,
  imports: [TranslatePipe, AdminUserFormComponent, PageHeaderComponent, DataTableComponent],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUsersComponent implements OnInit {
  private readonly adminUserService = inject(AdminUserApiService);

  readonly users = signal<AdminUser[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly showForm = signal(false);
  readonly deletingId = signal<number | null>(null);

  readonly columns: ColumnConfig[] = [
    { key: 'id', headerKey: 'admin.users.columns.id', filterable: false, align: 'left' },
    { key: 'email', headerKey: 'admin.users.columns.email', filterable: false, align: 'left' },
    {
      key: 'username',
      headerKey: 'admin.users.columns.username',
      filterable: false,
      align: 'left',
    },
    {
      key: 'firstName',
      headerKey: 'admin.users.columns.firstName',
      filterable: false,
      align: 'left',
    },
    {
      key: 'isActive',
      headerKey: 'admin.users.columns.isActive',
      filterable: false,
      type: 'badge',
      align: 'center',
    },
    {
      key: 'createdAt',
      headerKey: 'admin.users.columns.createdAt',
      filterable: false,
      type: 'date',
      align: 'center',
    },
  ];

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.error.set(null);

    this.adminUserService.listAdminUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('admin.users.errors.loadFailed');
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  onShowForm(): void {
    this.showForm.set(true);
  }

  onHideForm(): void {
    this.showForm.set(false);
  }

  onUserCreated(): void {
    this.showForm.set(false);
    this.loadUsers();
  }

  onDeleteUser(row: Record<string, unknown>): void {
    const id = row['id'] as number;
    if (!id) return;

    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;

    this.deletingId.set(id);
    this.adminUserService.deleteAdminUser(id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.loadUsers();
      },
      error: (err) => {
        this.error.set('admin.users.errors.deleteFailed');
        this.deletingId.set(null);
        console.error(err);
      },
    });
  }
}
