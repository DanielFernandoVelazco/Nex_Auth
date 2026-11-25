/**
 * Fecha → "Hace X seg/min/horas/días"
 */
export function relativeTime(date: Date | string | null | undefined): string {
    if (!date) return 'Nunca';

    const now = Date.now();
    const then = new Date(date).getTime();
    const diffSec = Math.floor((now - then) / 1000);

    if (diffSec < 0) return 'En el futuro';
    if (diffSec < 60) return `Hace ${diffSec} seg`;
    if (diffSec < 3600) return `Hace ${Math.floor(diffSec / 60)} min`;
    if (diffSec < 86400) return `Hace ${Math.floor(diffSec / 3600)} horas`;
    if (diffSec < 2592000) return `Hace ${Math.floor(diffSec / 86400)} días`;
    return `Hace ${Math.floor(diffSec / 2592000)} meses`;
}

/**
 * Fecha → "En X días" / "Nunca" / "Expirada"
 */
export function expiryLabel(date: Date | string | null | undefined): {
    label: string;
    status: 'ok' | 'warning' | 'never';
} {
    if (!date) return { label: 'Nunca', status: 'never' };

    const now = Date.now();
    const then = new Date(date).getTime();
    const diffDays = Math.ceil((then - now) / 86400000);

    if (diffDays < 0) return { label: 'Expirada', status: 'warning' };
    if (diffDays < 7) return { label: `En ${diffDays} días`, status: 'warning' };
    return { label: `En ${diffDays} días`, status: 'ok' };
}

/**
 * Número → "124,400" / "1.4M"
 */
export function formatNumber(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return n.toLocaleString('en-US');
    return n.toString();
}