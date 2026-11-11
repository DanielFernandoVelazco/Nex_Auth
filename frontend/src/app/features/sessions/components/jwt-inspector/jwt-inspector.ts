import { Component, input, computed, inject } from '@angular/core';
import { SessionRow } from '../../../../core/models/session.model';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-jwt-inspector',
  imports: [],
  templateUrl: './jwt-inspector.html',
  styleUrl: './jwt-inspector.scss',
})
export class JwtInspector {
  private readonly toast = inject(ToastService);

  readonly session = input.required<SessionRow>();
  readonly revoke = input<() => void>();
  readonly stepUp = input<() => void>();

  protected readonly riskClass = computed(() => {
    const risk = this.session().riskLevel;
    if (risk === 'high') return 'text-error';
    if (risk === 'medium') return 'text-secondary';
    return 'text-tertiary-container';
  });

  protected readonly riskLabel = computed(() => {
    const risk = this.session().riskLevel;
    const score = this.session().riskScore;
    if (risk === 'high') return `ALTO RIESGO (Score: ${score}/100)`;
    if (risk === 'medium') return `RIESGO MEDIO (Score: ${score}/100)`;
    return `BAJO RIESGO (Score: ${String(score).padStart(2, '0')}/100)`;
  });

  protected readonly rolePillClass = computed(() =>
    this.session().geo.isAnomaly
      ? 'bg-error-container text-on-error-container'
      : 'bg-surface-container-high text-primary'
  );

  protected copyClaims(): void {
    const s = this.session();
    const json = JSON.stringify({
      iss: s.jwt.iss,
      sub: s.jwt.sub,
      aud: s.jwt.aud,
      exp: s.jwt.exp,
      iat: s.jwt.iat,
      amr: s.jwt.amr,
      jti: s.jwt.jti,
      scope: s.jwt.scope,
    }, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      this.toast.success('Claims copiados al portapapeles');
    });
  }

  protected onRevoke(): void {
    this.revoke()?.();
  }

  protected onStepUp(): void {
    this.stepUp()?.();
  }
}