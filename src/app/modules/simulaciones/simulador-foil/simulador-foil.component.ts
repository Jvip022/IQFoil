import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { EstadoConexionComponent } from '../../../shared/estado-conexion/estado-conexion.component';
import { NotificacionService } from '../../../core/services/notificacion.service';

@Component({
  selector: 'app-simulador-foil',
  standalone: true,
  imports: [CommonModule, FormsModule, EstadoConexionComponent],
  templateUrl: './simulador-foil.component.html',
  styleUrls: ['./simulador-foil.component.scss']
})
export class SimuladorFoilComponent implements OnInit, AfterViewInit {
  @ViewChild('foilCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  // Parámetros de simulación
  velocidadViento = 15;   // nudos
  anguloAtaque = 5;       // grados
  superficieAlar = 120;   // dm²
  pesoNavegante = 75;     // kg
  olaGrande = false;

  // Resultados
  sustentacion = 0;       // Newtons
  resistencia = 0;        // Newtons
  relacionLD = 0;         // L/D
  velocidadDespegue = 0;  // nudos

  private ctx: CanvasRenderingContext2D | null = null;
  private animationFrameId?: number;

  constructor(private notificacionService: NotificacionService) {}

  ngOnInit(): void {
    this.calcular();
  }

  ngAfterViewInit(): void {
    this.initCanvas();
    this.dibujarFoil();
  }

  private initCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d');
    // Ajustar resolución para evitar borrosidad
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    window.addEventListener('resize', () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      this.dibujarFoil();
    });
  }

  calcular(): void {
    // Fórmulas simplificadas de física de fluidos (solo para simulación)
    const vientoMs = this.velocidadViento * 0.514;   // nudos → m/s
    const superficieM2 = this.superficieAlar / 100;  // dm² → m²
    const densidadAire = 1.225;                     // kg/m³
    const cl = 0.4 + (this.anguloAtaque * 0.05);    // coeficiente de sustentación
    const cd = 0.05 + (this.anguloAtaque * 0.01);   // coeficiente de resistencia

    // Sustentación = 0.5 * ρ * v² * S * CL
    this.sustentacion = 0.5 * densidadAire * vientoMs * vientoMs * superficieM2 * cl;

    // Resistencia = 0.5 * ρ * v² * S * CD
    this.resistencia = 0.5 * densidadAire * vientoMs * vientoMs * superficieM2 * cd;

    // Relación L/D
    this.relacionLD = this.resistencia > 0 ? this.sustentacion / this.resistencia : 0;

    // Velocidad de despegue (cuando sustentación = peso)
    const pesoN = this.pesoNavegante * 9.81;
    this.velocidadDespegue = Math.sqrt((2 * pesoN) / (densidadAire * superficieM2 * cl)) / 0.514;

    // Ajuste por ola grande (reduce sustentación un 10%)
    if (this.olaGrande) {
      this.sustentacion *= 0.9;
      this.velocidadDespegue *= 1.1;
    }

    this.dibujarFoil();
  }

  resetear(): void {
    this.velocidadViento = 15;
    this.anguloAtaque = 5;
    this.superficieAlar = 120;
    this.pesoNavegante = 75;
    this.olaGrande = false;
    this.calcular();
    this.notificacionService.mostrarInfo('Valores restablecidos a configuración por defecto');
  }

  private dibujarFoil(): void {
    if (!this.ctx) return;

    const canvas = this.canvasRef.nativeElement;
    const ctx = this.ctx;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Dibujar línea de referencia horizontal
    ctx.beginPath();
    ctx.moveTo(40, h / 2);
    ctx.lineTo(w - 40, h / 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Calcular posición del perfil (centro del canvas)
    const centerX = w / 2;
    const baseY = h / 2;

    // Ángulo de ataque en radianes
    const rad = (this.anguloAtaque * Math.PI) / 180;
    const offset = Math.min(20, this.sustentacion / 500); // desplazamiento visual

    // Dibujar perfil superior (curva)
    ctx.beginPath();
    for (let x = centerX - 100; x <= centerX + 100; x += 5) {
      const t = (x - (centerX - 100)) / 200; // 0 a 1
      // Espesor máximo en t=0.3 (simula perfil NACA)
      const espesor = 12 * (1 - Math.pow(2 * t - 1, 2)) * (1 + offset * 0.2);
      const y = baseY - espesor - (offset * Math.sin(rad));
      if (x === centerX - 100) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#00e6d6';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Dibujar perfil inferior
    ctx.beginPath();
    for (let x = centerX - 100; x <= centerX + 100; x += 5) {
      const t = (x - (centerX - 100)) / 200;
      const espesor = 12 * (1 - Math.pow(2 * t - 1, 2)) * (1 + offset * 0.2);
      const y = baseY + espesor * 0.3 + (offset * Math.sin(rad) * 0.5);
      if (x === centerX - 100) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#1a2b4c';
    ctx.stroke();

    // Indicar ángulo de ataque con línea
    ctx.beginPath();
    ctx.moveTo(centerX, baseY);
    ctx.lineTo(centerX + 30 * Math.sin(rad), baseY - 30 * Math.cos(rad));
    ctx.strokeStyle = '#f39c12';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Texto informativo
    ctx.font = '12px "Inter", sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText(`Ángulo: ${this.anguloAtaque}°`, centerX + 20, baseY - 20);
    ctx.fillText(`Sustentación: ${this.sustentacion.toFixed(0)} N`, centerX + 20, baseY - 5);
  }

  // Limpiar animación al destruir
  ngOnDestroy(): void {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    window.removeEventListener('resize', () => {});
  }
}