import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { UserManagementPage } from './user-management.page';
import { UsersService, InviteUserDto, UpdateUserDto, RolesService, Role, AuthService, User as ApiUser, UserStatus, WebSocketService, HasPermissionDirective, ToastService } from '@virteex/shared-ui';
import { TranslateModule } from '@ngx-translate/core';
import { LucideAngularModule, UserPlus, Save, X, Send, User, History, Trash2, Key, Search, Filter, ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal, FilePenLine, Ban, UserCog, Mail, ChevronLeft, ChevronRight, Plus, RefreshCw, Power, PowerOff, Building, Lock, Archive, UserCheck, Zap, FileInput, FileOutput, UserCircle2, LogOut } from 'lucide-angular';
import { vi } from 'vitest';

const mockUsers: ApiUser[] = [
  { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@doe.com', status: UserStatus.ACTIVE, roles: [{id: '1', name: 'Admin'}], organizationId: '1', isOnline: true, createdAt: new Date() },
  { id: '2', firstName: 'Jane', lastName: 'Doe', email: 'jane@doe.com', status: UserStatus.PENDING, roles: [{id: '2', name: 'User'}], organizationId: '1', isOnline: false, createdAt: new Date() },
];

const mockRoles: Role[] = [
    { id: '1', name: 'Admin', permissions: [] },
    { id: '2', name: 'User', permissions: [] },
]

describe('UserManagementPage', () => {
  let component: UserManagementPage;
  let fixture: ComponentFixture<UserManagementPage>;
  let usersService: UsersService;
  let toastService: ToastService;

  const mockUsersService = {
    getUsers: vi.fn(() => of({ data: mockUsers, total: mockUsers.length })),
    inviteUser: vi.fn(() => of(mockUsers[0])),
    updateUser: vi.fn(() => of(mockUsers[0])),
    deleteUser: vi.fn(() => of(undefined)),
    sendPasswordReset: vi.fn(() => of({ message: 'Email sent' })),
    forceLogout: vi.fn(() => of({})),
    blockAndLogout: vi.fn(() => of({})),
  };

  const mockRolesService = {
    getRoles: vi.fn(() => of(mockRoles)),
  };

  const mockToastService = {
    showError: vi.fn(),
    showSuccess: vi.fn(),
  };

  const mockWebSocketService = {
    listen: () => of({}),
    disconnect: vi.fn(),
  };

  const mockAuthService = {
    currentUser: () => null,
    impersonate: vi.fn(() => of(null)),
    hasPermissions: vi.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    vi.clearAllMocks(); // Clear mocks before each test
    await TestBed.configureTestingModule({
      imports: [
        UserManagementPage,
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        HasPermissionDirective,
        LucideAngularModule.pick({ UserPlus, Save, X, Send, User, History, Trash2, Key, Search, Filter, ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal, FilePenLine, Ban, UserCog, Mail, ChevronLeft, ChevronRight, Plus, RefreshCw, Power, PowerOff, Building, Lock, Archive, UserCheck, Zap, FileInput, FileOutput, UserCircle2, LogOut })
      ],
      providers: [
        provideZonelessChangeDetection(),
        { provide: UsersService, useValue: mockUsersService },
        { provide: RolesService, useValue: mockRolesService },
        { provide: ToastService, useValue: mockToastService },
        { provide: WebSocketService, useValue: mockWebSocketService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserManagementPage);
    component = fixture.componentInstance;
    usersService = TestBed.inject(UsersService);
    toastService = TestBed.inject(ToastService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load users on init', () => {
    expect(mockUsersService.getUsers).toHaveBeenCalled();
    expect(component.users().length).toBe(2);
    expect(component.totalUsers()).toBe(2);
  });

  it('should open invite modal', () => {
    component.openInviteModal();
    expect(component.isEditMode()).toBe(false);
    expect(component.userModalOpen()).toBe(true);
    expect(component.userForm.value.id).toBeNull();
  });

  it('should open edit modal and patch form values', () => {
    const userToEdit = mockUsers[0];
    component.openEditModal(userToEdit);
    expect(component.isEditMode()).toBe(true);
    expect(component.userModalOpen()).toBe(true);
    expect(component.selectedUser).toBe(userToEdit);
    expect(component.userForm.value.firstName).toBe(userToEdit.firstName);
  });

  it('should invite a new user', () => {
    component.openInviteModal();
    component.userForm.patchValue({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@user.com',
        roleId: '1',
    });
    component.save();

    const payload: InviteUserDto = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@user.com',
        roleId: '1',
    };
    expect(mockUsersService.inviteUser).toHaveBeenCalledWith(payload);
    expect(mockToastService.showSuccess).toHaveBeenCalledWith('Usuario invitado con éxito.');
    expect(mockUsersService.getUsers).toHaveBeenCalledTimes(2); // 1 on init, 1 after save
  });

  it('should update an existing user', () => {
    const userToEdit = mockUsers[0];
    component.openEditModal(userToEdit);
    component.userForm.patchValue({
        firstName: 'John Updated',
        lastName: 'Doe Updated',
        email: 'john.updated@doe.com',
        roleId: '2',
    });
    component.save();

    const payload: UpdateUserDto = {
        firstName: 'John Updated',
        lastName: 'Doe Updated',
        email: 'john.updated@doe.com',
        roleId: '2',
    };
    expect(mockUsersService.updateUser).toHaveBeenCalledWith(userToEdit.id, payload);
    expect(mockToastService.showSuccess).toHaveBeenCalledWith('Usuario actualizado con éxito.');
    expect(mockUsersService.getUsers).toHaveBeenCalledTimes(2);
  });

  it('should delete a user', () => {
    const userToDelete = mockUsers[0];
    component.openDeleteModal(userToDelete);
    expect(component.deleteModalOpen()).toBe(true);
    expect(component.selectedUser).toBe(userToDelete);

    component.confirmDelete();

    expect(mockUsersService.deleteUser).toHaveBeenCalledWith(userToDelete.id);
    expect(mockToastService.showSuccess).toHaveBeenCalledWith('Usuario eliminado con éxito.');
    expect(mockUsersService.getUsers).toHaveBeenCalledTimes(2);
  });
});
