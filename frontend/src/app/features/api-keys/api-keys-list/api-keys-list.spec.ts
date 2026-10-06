import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApiKeysList } from './api-keys-list';

describe('ApiKeysList', () => {
  let component: ApiKeysList;
  let fixture: ComponentFixture<ApiKeysList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApiKeysList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApiKeysList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
