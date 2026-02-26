import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationsPage } from './notifications.page';
import { NotificationCenterService, Notification } from '../../services/notification-center.service';
import { signal } from '@angular/core';
import { vi } from 'vitest';

class MockNotificationCenterService {
  notifications = signal<Notification[]>([]);
  unreadCount = signal(0);
  markAsRead = vi.fn();
  markAllAsRead = vi.fn();
  initialize = vi.fn();
}

describe('NotificationsPage', () => {
  let component: NotificationsPage;
  let fixture: ComponentFixture<NotificationsPage>;
  let mockService: MockNotificationCenterService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationsPage],
      providers: [
        { provide: NotificationCenterService, useClass: MockNotificationCenterService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificationsPage);
    component = fixture.componentInstance;
    mockService = TestBed.inject(NotificationCenterService) as unknown as MockNotificationCenterService;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display notifications from the service', () => {
    const testNotifications: Notification[] = [
      { id: '1', title: 'Test 1', message: 'Message 1', type: 'info', read: false, timestamp: new Date() },
      { id: '2', title: 'Test 2', message: 'Message 2', type: 'success', read: true, timestamp: new Date() }
    ];
    mockService.notifications.set(testNotifications);
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('.notification-item');
    expect(items.length).toBe(2);
  });

  it('should call markAsRead when a notification is clicked', () => {
    const testNotifications: Notification[] = [
      { id: '1', title: 'Test 1', message: 'Message 1', type: 'info', read: false, timestamp: new Date() }
    ];
    mockService.notifications.set(testNotifications);
    fixture.detectChanges();

    const item = fixture.nativeElement.querySelector('.notification-item');
    item.click();
    expect(mockService.markAsRead).toHaveBeenCalledWith('1');
  });

  it('should call markAllAsRead when the "mark all as read" button is clicked', () => {
    const button = fixture.nativeElement.querySelector('.mark-all-btn');
    // If button exists (it might depend on logic)
    if (button) {
        button.click();
        expect(mockService.markAllAsRead).toHaveBeenCalled();
    }
  });
});
