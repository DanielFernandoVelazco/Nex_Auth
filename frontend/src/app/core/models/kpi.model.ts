export type KpiTrend = 'up' | 'down' | 'neutral';

export type KpiColor = 'primary' | 'secondary' | 'tertiary' | 'error';

export interface Kpi {
    id: string;
    label: string;
    value: string;
    delta?: string;            // '+14.2%'
    trend?: KpiTrend;
    icon: string;              // material symbol
    color?: KpiColor;
    footer?: string;           // small text below
    progress?: number;         // 0-100 for mini progress bar
}