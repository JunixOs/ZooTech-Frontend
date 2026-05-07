import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'zt-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="landing-page">
      <nav class="nav">
        <div class="logo">Zootech</div>
        <div class="nav-links">
          <a routerLink="/dashboard" class="btn-login">Acceder al Sistema</a>
        </div>
      </nav>

      <header class="hero">
        <div class="hero-content">
          <h1>Gestión Inteligente para el Futuro de <span class="highlight">Zootech</span></h1>
          <p>La plataforma Enterprise definitiva para la administración de recursos, usuarios y analítica en tiempo real.</p>
          <div class="actions">
            <a routerLink="/dashboard" class="btn-primary">Empezar ahora</a>
            <button class="btn-outline">Saber más</button>
          </div>
        </div>
        <div class="hero-visual">
          <div class="abstract-shape"></div>
        </div>
      </header>

      <section class="features">
        <div class="feature-card">
          <h3>Multi-tenancy</h3>
          <p>Arquitectura preparada para escalar a múltiples clientes con aislamiento total.</p>
        </div>
        <div class="feature-card">
          <h3>Clean Architecture</h3>
          <p>Código desacoplado, mantenible y listo para crecer sin límites.</p>
        </div>
        <div class="feature-card">
          <h3>Signals & Performance</h3>
          <p>Optimizado con las últimas APIs de Angular para una experiencia fluida.</p>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .landing-page { min-height: 100vh; background: #ffffff; color: #1e293b; }
    
    .nav { 
      display: flex; justify-content: space-between; align-items: center; 
      padding: 1.5rem 5%; background: white; border-bottom: 1px solid #f1f5f9;
    }
    .logo { font-size: 1.5rem; font-weight: 800; color: #2563eb; }
    .btn-login { text-decoration: none; color: #2563eb; font-weight: 600; padding: 0.5rem 1rem; border: 1px solid #2563eb; border-radius: 8px; transition: 0.3s; }
    .btn-login:hover { background: #2563eb; color: white; }

    .hero { 
      display: flex; align-items: center; padding: 100px 5%; 
      background: radial-gradient(circle at top right, #eff6ff 0%, #ffffff 50%);
    }
    .hero-content { flex: 1; max-width: 600px; }
    .hero-content h1 { font-size: 3.5rem; line-height: 1.1; margin-bottom: 1.5rem; color: #0f172a; }
    .highlight { color: #2563eb; }
    .hero-content p { font-size: 1.25rem; color: #64748b; margin-bottom: 2.5rem; }

    .actions { display: flex; gap: 1rem; }
    .btn-primary { 
      background: #2563eb; color: white; padding: 1rem 2rem; 
      border-radius: 12px; text-decoration: none; font-weight: 600; 
      box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);
    }
    .btn-outline { 
      background: transparent; color: #64748b; padding: 1rem 2rem; 
      border-radius: 12px; border: 1px solid #e2e8f0; font-weight: 600; cursor: pointer;
    }

    .hero-visual { flex: 1; display: flex; justify-content: center; }
    .abstract-shape { 
      width: 300px; height: 300px; 
      background: linear-gradient(45deg, #2563eb, #60a5fa); 
      border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; 
      animation: morph 8s ease-in-out infinite;
    }

    .features { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; padding: 50px 5%; }
    .feature-card { padding: 2rem; border-radius: 16px; background: #f8fafc; border: 1px solid #f1f5f9; }
    .feature-card h3 { margin-bottom: 1rem; color: #2563eb; }

    @keyframes morph {
      0% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
      50% { border-radius: 50% 50% 33% 67% / 55% 27% 73% 45%; }
      100% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
    }

    @media (max-width: 768px) {
      .hero { flex-direction: column; text-align: center; padding: 60px 5%; }
      .hero-content h1 { font-size: 2.5rem; }
      .features { grid-template-columns: 1fr; }
      .actions { justify-content: center; }
    }
  `]
})
export class LandingComponent {}
