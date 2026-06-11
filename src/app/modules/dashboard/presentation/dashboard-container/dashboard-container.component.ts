import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { DecimalPipe } from '@angular/common';

interface KPIStat {
  labelKey: string;
  value: number;
  trend: string;
  trendClass: 'positive' | 'neutral' | 'negative';
  icon: string;
  suffixKey: string;
  cardClass: string;
}

interface RecentActivity {
  id: number;
  type: 'health' | 'production' | 'reproduction';
  desc: string;
  time: string;
  icon: string;
}

@Component({
  selector: 'zt-dashboard-container',
  standalone: true,
  imports: [TranslatePipe, DecimalPipe],
  templateUrl: './dashboard-container.component.html',
  styleUrl: './dashboard-container.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardContainerComponent {
  kpiStats = signal<KPIStat[]>([
    {
      labelKey: 'dashboard.vacunos',
      value: 142,
      trend: '+4.2%',
      trendClass: 'positive',
      icon: 'fa-solid fa-cow',
      suffixKey: 'dashboard.vacunosUnidad',
      cardClass: 'kpi-vacunos',
    },
    {
      labelKey: 'dashboard.leche',
      value: 1480,
      trend: '+8.5%',
      trendClass: 'positive',
      icon: 'fa-solid fa-droplet',
      suffixKey: 'dashboard.lecheUnidad',
      cardClass: 'kpi-leche',
    },
    {
      labelKey: 'dashboard.sanidad',
      value: 3,
      trend: 'Estable',
      trendClass: 'neutral',
      icon: 'fa-solid fa-heart-pulse',
      suffixKey: 'dashboard.casosUnidad',
      cardClass: 'kpi-sanidad',
    },
    {
      labelKey: 'dashboard.reproduccion',
      value: 5,
      trend: 'Alta',
      trendClass: 'positive',
      icon: 'fa-solid fa-heart',
      suffixKey: 'dashboard.alertasUnidad',
      cardClass: 'kpi-reproduccion',
    },
  ]);

  recentActivities = signal<RecentActivity[]>([
    {
      id: 1,
      type: 'health',
      desc: 'Nuevo triaje registrado para vacuno <strong>V-104</strong> (Peso: 420kg, Tipo: Mensual)',
      time: 'Hace 10 minutos',
      icon: 'fa-solid fa-heart-pulse',
    },
    {
      id: 2,
      type: 'production',
      desc: 'Ordeño matutino completo: <strong>720 Litros</strong> registrados por Aracely G.',
      time: 'Hace 2 horas',
      icon: 'fa-solid fa-droplet',
    },
    {
      id: 3,
      type: 'reproduction',
      desc: 'Alerta de celo detectada en vacuno <strong>V-082</strong> (Inquietud y secreción vulvar)',
      time: 'Hace 5 horas',
      icon: 'fa-solid fa-heart',
    },
    {
      id: 4,
      type: 'health',
      desc: 'Alta médica del vacuno <strong>V-015</strong> tras tratamiento preventivo exitoso',
      time: 'Ayer',
      icon: 'fa-solid fa-circle-check',
    },
  ]);

  weeklyProduction = signal<number[]>([1210, 1340, 1280, 1420, 1380, 1450, 1480]);
  weeklyDays = signal<string[]>(['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']);

  chartPoints = computed(() => {
    const data = this.weeklyProduction();
    const min = Math.min(...data) * 0.95;
    const max = Math.max(...data) * 1.05;
    const width = 600;
    const height = 180;
    const padding = 20;

    return data.map((val, i) => {
      const x = padding + (i * (width - padding * 2)) / (data.length - 1);
      const y = height - padding - ((val - min) / (max - min)) * (height - padding * 2);
      return { x, y, val };
    });
  });

  linePath = computed(() => {
    const pts = this.chartPoints();
    if (pts.length === 0) return '';
    return `M ${pts[0].x} ${pts[0].y} ` + pts.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
  });

  areaPath = computed(() => {
    const pts = this.chartPoints();
    if (pts.length === 0) return '';
    const firstX = pts[0].x;
    const lastX = pts[pts.length - 1].x;
    const height = 180;
    return (
      `M ${firstX} ${height} L ${firstX} ${pts[0].y} ` +
      pts.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ') +
      ` L ${lastX} ${height} Z`
    );
  });
}

