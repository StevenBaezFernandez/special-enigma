import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { UiWms } from './ui-wms';

describe('UiWms', () => {
  let component: UiWms;
  let fixture: ComponentFixture<UiWms>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiWms],
    }).compileComponents();

    fixture = TestBed.createComponent(UiWms);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
