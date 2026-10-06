import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionsMonitor } from './sessions-monitor';

describe('SessionsMonitor', () => {
  let component: SessionsMonitor;
  let fixture: ComponentFixture<SessionsMonitor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionsMonitor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SessionsMonitor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
