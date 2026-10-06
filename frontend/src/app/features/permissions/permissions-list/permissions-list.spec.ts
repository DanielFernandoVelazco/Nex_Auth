import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionsList } from './permissions-list';

describe('PermissionsList', () => {
  let component: PermissionsList;
  let fixture: ComponentFixture<PermissionsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermissionsList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PermissionsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
