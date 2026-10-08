import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenantSettings } from './tenant-settings';

describe('TenantSettings', () => {
  let component: TenantSettings;
  let fixture: ComponentFixture<TenantSettings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TenantSettings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TenantSettings);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
