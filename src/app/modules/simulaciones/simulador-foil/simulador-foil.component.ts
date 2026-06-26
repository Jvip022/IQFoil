import { Component, ElementRef, OnInit, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
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
export class SimuladorFoilComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('foilCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  // Parámetros de simulación
  velocidadViento = 15;
  anguloAtaque = 5;
  superficieAlar = 120;
  pesoNavegante = 75;
  olaGrande = false;

  // Resultados
  sustentacion = 0;
  resistencia = 0;
  relacionLD = 0;
  velocidadDespegue = 0;

  private ctx: CanvasRenderingContext2D | null = null;
  private resizeHandler: (() => void) | null = null;

  constructor(private notificacionService: NotificacionService) {}

  ngOnInit(): void {
    this.calcular();
  }

  ngAfterViewInit(): void {
    this.initCanvas();
    this.dibujarFoil();
  }

  ngOnDestroy(): void {
    // Eliminar el listener de resize correctamente
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }
  }

  private initCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    if (!canvas) return;

    // Obtener el contexto
    this.ctx = canvas.getContext('2d');
    if (!this.ctx) return;

    // Establecer tamaño real del canvas (DPI-aware)
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    this.ctx.scale(dpr, dpr);

    // Guardar referencia del handler para poder eliminarlo después
    this.resizeHandler = () => {
      const newRect = canvas.getBoundingClientRect();
      canvas.width = newRect.width * dpr;
      canvas.height = newRect.height * dpr;
      canvas.style.width = newRect.width + 'px';
      canvas.style.height = newRect.height + 'px';
      this.ctx?.scale(dpr, dpr);
      this.dibujarFoil();
    };

    // Escuchar cambios de tamaño
    window.addEventListener('resize', this.resizeHandler);
  }

  calcular(): void {
    // Fórmulas simplificadas de física de fluidos
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

    // Redibujar el foil con los nuevos valores
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
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    const ctx = this.ctx;
    if (!ctx) return;

    // Obtener dimensiones reales del canvas (en píxeles CSS)
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    // Limpiar
    ctx.clearRect(0, 0, w, h);

    // Fondo semitransparente
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, 0, w, h);

    // Línea de referencia horizontal
    ctx.beginPath();
    ctx.moveTo(40, h / 2);
    ctx.lineTo(w - 40, h / 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Centro del canvas
    const centerX = w / 2;
    const baseY = h / 2;

    // Ángulo de ataque en radianes
    const rad = (this.anguloAtaque * Math.PI) / 180;
    const offset = Math.min(20, Math.max(-20, this.sustentacion / 500));

    // --- Perfil superior (curva de sustentación) ---
    ctx.beginPath();
    for (let x = centerX - 100; x <= centerX + 100; x += 3) {
      const t = (x - (centerX - 100)) / 200;
      const espesor = 12 * (1 - Math.pow(2 * t - 1, 2)) * (1 + offset * 0.2);
      const y = baseY - espesor - (offset * Math.sin(rad) * 0.3);
      if (x === centerX - 100) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#00e6d6';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // --- Perfil inferior ---
    ctx.beginPath();
    for (let x = centerX - 100; x <= centerX + 100; x += 3) {
      const t = (x - (centerX - 100)) / 200;
      const espesor = 12 * (1 - Math.pow(2 * t - 1, 2)) * (1 + offset * 0.2);
      const y = baseY + espesor * 0.3 + (offset * Math.sin(rad) * 0.2);
      if (x === centerX - 100) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#1a2b4c';
    ctx.lineWidth = 2;
    ctx.stroke();

    // --- Línea del ángulo de ataque ---
    ctx.beginPath();
    ctx.moveTo(centerX, baseY);
    ctx.lineTo(centerX + 40 * Math.sin(rad), baseY - 40 * Math.cos(rad));
    ctx.strokeStyle = '#f39c12';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    // --- Puntos de referencia visual ---
    ctx.beginPath();
    ctx.arc(centerX, baseY, 4, 0, 2 * Math.PI);
    ctx.fillStyle = '#f39c12';
    ctx.fill();

    // --- Texto informativo ---
    ctx.font = '12px "Inter", sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.textAlign = 'left';
    ctx.fillText(`Ángulo: ${this.anguloAtaque}°`, centerX + 20, baseY - 30);
    ctx.fillText(`Sustentación: ${this.sustentacion.toFixed(0)} N`, centerX + 20, baseY - 12);

    // Mostrar estado de vuelo
    // 18 nudos,8 angulo,160dm ,75kg
    const vuela = this.sustentacion >= this.pesoNavegante * 9.81;
    ctx.font = '14px "Inter", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillStyle = vuela ? '#4caf50' : '#f44336';
    ctx.fillText(vuela ? '🟢 VOLANDO' : '🔴 NO VUELA', w - 20, 30);
  }
}