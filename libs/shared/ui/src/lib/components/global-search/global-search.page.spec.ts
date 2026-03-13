
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GlobalSearchPage } from '../../components/global-search/global-search.page';
import { SearchService } from '../../core/services/search.service';
import { Router, ActivatedRoute } from '@angular/router';
import { vi } from 'vitest';
import { of } from 'rxjs';

describe('GlobalSearch', () => {
  let component: GlobalSearchPage;
  let fixture: ComponentFixture<GlobalSearchPage>;
  const mockSearchService = {
      search: vi.fn()
  };
  const mockRouter = {
      navigate: vi.fn()
  };
  const mockActivatedRoute = {
      params: of({}),
      queryParamMap: of({ get: () => null })
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalSearchPage],
      providers: [
          { provide: SearchService, useValue: mockSearchService },
          { provide: Router, useValue: mockRouter },
          { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlobalSearchPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
