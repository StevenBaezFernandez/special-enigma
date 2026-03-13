import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatCard } from '../../components/stat-card/stat-card';
import { LucideAngularModule, DollarSign } from 'lucide-angular';

describe('StatCard', () => {
  let component: StatCard;
  let fixture: ComponentFixture<StatCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatCard, LucideAngularModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatCard);
    component = fixture.componentInstance;
    component.data = { iconName: 'DollarSign', value: '100', label: 'Sales' };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
