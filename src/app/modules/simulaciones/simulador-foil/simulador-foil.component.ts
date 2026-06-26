import { Component, ElementRef, OnInit, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EstadoConexionComponent } from '../../../shared/estado-conexion/estado-conexion.component';
import { NotificacionService } from '../../../core/services/notificacion.service';

interface Waypoint {
  x: number;
  y: number;
  tipo: 'ceñida' | 'popa' | 'traves'; // tipo de tramo para calcular velocidad
}

interface Barco {
  nombre: string;
  color: string;
  x: number;
  y: number;
  waypointIndex: number;       // índice del waypoint actual
  progreso: number;           // 0..1 entre waypoints
  velocidad: number;          // nudos (escalada para animación)
}

@Component({
  selector: 'app-simulador-foil',
  standalone: true,
  imports: [CommonModule, FormsModule, EstadoConexionComponent],
  templateUrl: './simulador-foil.component.html',
  styleUrls: ['./simulador-foil.component.scss']
})
export class SimuladorFoilComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('regataCanvas') regataCanvasRef!: ElementRef<HTMLCanvasElement>;

  // Parámetros de la regata
  distanciaRegata = 5;
  numBarcos = 6;
  direccionViento = 'N';
  tipoPista = 'curso';
  velocidadViento = 15; // nudos (fijo para el cálculo de velocidad estimada)

  // Resultados
  anguloOptimo: number | null = null;
  rumboRecomendado: string = '';
  velocidadEstimada: number | null = null;
  tiempoSimulacion = 0;

  // Control de simulación
  simulando = false;
  private animationId: any = null;
  private lastTimestamp = 0;

  // Datos de la regata
  private waypoints: Waypoint[] = [];
  private barcos: Barco[] = [];
  private ctx: CanvasRenderingContext2D | null = null;
  private resizeHandler: (() => void) | null = null;
  private canvasWidth = 0;
  private canvasHeight = 0;

  constructor(private notificacionService: NotificacionService) {}

  ngOnInit(): void {
    this.actualizarRegata();
  }

  ngAfterViewInit(): void {
    this.initCanvas();
    this.dibujarRegata();
  }

  ngOnDestroy(): void {
    this.detenerSimulacion();
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }
  }

  // ==================== INICIALIZACIÓN DEL CANVAS ====================
  private initCanvas(): void {
    const canvas = this.regataCanvasRef.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvasWidth = rect.width;
    this.canvasHeight = rect.height;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.scale(dpr, dpr);
    this.ctx = ctx;

    this.resizeHandler = () => {
      const newRect = canvas.getBoundingClientRect();
      this.canvasWidth = newRect.width;
      this.canvasHeight = newRect.height;
      canvas.width = newRect.width * dpr;
      canvas.height = newRect.height * dpr;
      canvas.style.width = newRect.width + 'px';
      canvas.style.height = newRect.height + 'px';
      this.ctx?.scale(dpr, dpr);
      this.dibujarRegata();
    };
    window.addEventListener('resize', this.resizeHandler);
  }

  // ==================== ACTUALIZACIÓN DE PARÁMETROS ====================
  actualizarRegata(): void {
    this.calcularAnguloOptimo();
    this.generarRecorrido();
    this.inicializarBarcos();
    this.dibujarRegata();
  }

  // ==================== CÁLCULO DE ÁNGULO ====================
  private calcularAnguloOptimo(): void {
    const dirMap: { [key: string]: { x: number; y: number } } = {
      N: { x: 0, y: -1 },
      S: { x: 0, y: 1 },
      E: { x: 1, y: 0 },
      O: { x: -1, y: 0 },
      NE: { x: 0.707, y: -0.707 },
      NO: { x: -0.707, y: -0.707 },
      SE: { x: 0.707, y: 0.707 },
      SO: { x: -0.707, y: 0.707 },
    };
    const viento = dirMap[this.direccionViento] || { x: 0, y: -1 };
    const anguloViento = Math.atan2(viento.x, viento.y) * (180 / Math.PI);

    let anguloOptimo = 0;
    let rumbo = '';
    switch (this.tipoPista) {
      case 'curso':
        anguloOptimo = 45;
        rumbo = 'Ceñida (contra el viento)';
        break;
      case 'slalom':
        anguloOptimo = 90;
        rumbo = 'Travesía (viento de través)';
        break;
      case 'slalom_ceñida':
        anguloOptimo = 45;
        rumbo = 'Ceñida final';
        break;
      case 'maraton':
        anguloOptimo = 30;
        rumbo = 'Mixto (ceñida/popa)';
        break;
      default:
        anguloOptimo = 45;
        rumbo = 'Ceñida';
    }

    let anguloReal = anguloViento + anguloOptimo;
    if (anguloReal > 360) anguloReal -= 360;
    if (anguloReal < 0) anguloReal += 360;

    this.anguloOptimo = anguloOptimo;
    this.rumboRecomendado = `${rumbo} (${anguloReal.toFixed(0)}° desde el Norte)`;

    // Velocidad estimada según tipo de pista
    let factor = 1.0;
    if (this.tipoPista === 'curso') factor = 0.8;
    else if (this.tipoPista === 'slalom') factor = 0.9;
    else if (this.tipoPista === 'slalom_ceñida') factor = 0.7;
    else if (this.tipoPista === 'maraton') factor = 0.6;
    this.velocidadEstimada = this.velocidadViento * factor;
  }

  // ==================== GENERACIÓN DE RECORRIDO ====================
  private generarRecorrido(): void {
    const margin = 60;
    const w = this.canvasWidth || 600;
    const h = this.canvasHeight || 400;
    const cx = w / 2;
    const cy = h / 2;
    const size = Math.min(w, h) * 0.35;

    this.waypoints = [];

    switch (this.tipoPista) {
      case 'curso':
        // Rectángulo: esquinas (inicio en superior izquierda)
        this.waypoints = [
          { x: margin, y: margin, tipo: 'ceñida' },
          { x: w - margin, y: margin, tipo: 'traves' },
          { x: w - margin, y: h - margin, tipo: 'popa' },
          { x: margin, y: h - margin, tipo: 'traves' },
        ];
        break;
      case 'slalom':
        // U invertida: salida abajo izquierda, sube, va a la derecha, baja
        this.waypoints = [
          { x: margin, y: h - margin, tipo: 'traves' },
          { x: margin, y: margin, tipo: 'ceñida' },
          { x: w - margin, y: margin, tipo: 'popa' },
          { x: w - margin, y: h - margin, tipo: 'traves' },
        ];
        break;
      case 'slalom_ceñida':
        // Similar a U pero con ceñida final en diagonal
        this.waypoints = [
          { x: margin, y: h - margin, tipo: 'traves' },
          { x: margin, y: margin, tipo: 'ceñida' },
          { x: w - margin, y: margin, tipo: 'popa' },
          { x: w - margin, y: h - margin, tipo: 'ceñida' },
          { x: cx, y: h - margin, tipo: 'traves' },
        ];
        break;
      case 'maraton':
        // Recorrido largo con zigzag
        this.waypoints = [
          { x: margin, y: h - margin, tipo: 'ceñida' },
          { x: cx, y: margin, tipo: 'popa' },
          { x: w - margin, y: h * 0.3, tipo: 'traves' },
          { x: margin, y: h * 0.6, tipo: 'ceñida' },
          { x: w - margin, y: h - margin, tipo: 'popa' },
        ];
        break;
      default:
        this.waypoints = [];
    }
  }

  // ==================== INICIALIZACIÓN DE BARCOS ====================
  private inicializarBarcos(): void {
    if (this.waypoints.length < 2) return;

    const colores = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#ff9ff3', '#54a0ff', '#5f27cd', '#f368e0', '#ff9f43', '#00d2d3', '#1dd1a1', '#f8a5c2'];
    this.barcos = [];
    for (let i = 0; i < this.numBarcos; i++) {
      // Distribuir los barcos a lo largo del recorrido (progreso inicial escalonado)
      const progresoInicial = i / this.numBarcos;
      const color = colores[i % colores.length];
      this.barcos.push({
        nombre: `Barco ${i + 1}`,
        color,
        x: 0,
        y: 0,
        waypointIndex: 0,
        progreso: progresoInicial,
        velocidad: 0.5 + Math.random() * 0.5 // factor de velocidad individual
      });
    }
    // Actualizar posiciones iniciales
    this.actualizarPosicionesBarcos(0);
  }

  // ==================== ACTUALIZACIÓN DE POSICIONES ====================
  private actualizarPosicionesBarcos(deltaTime: number): void {
    if (this.waypoints.length < 2) return;

    const factorVelocidadBase = 0.02; // ajuste de velocidad de animación
    const vientoDir = this.obtenerVectorViento();

    for (const barco of this.barcos) {
      // Velocidad base según el tramo actual
      const wpActual = this.waypoints[barco.waypointIndex];
      const wpSiguiente = this.waypoints[(barco.waypointIndex + 1) % this.waypoints.length];
      let velocidadTramo = 1.0;
      switch (wpActual.tipo) {
        case 'ceñida': velocidadTramo = 0.6; break;
        case 'popa': velocidadTramo = 1.2; break;
        case 'traves': velocidadTramo = 0.9; break;
        default: velocidadTramo = 1.0;
      }

      // Efecto del viento sobre la velocidad en este tramo
      const dx = wpSiguiente.x - wpActual.x;
      const dy = wpSiguiente.y - wpActual.y;
      const anguloTramo = Math.atan2(dy, dx);
      const vientoAngle = Math.atan2(vientoDir.y, vientoDir.x);
      const diff = this.normalizarAngulo(anguloTramo - vientoAngle);
      // Si el viento es de cara (diff ~ PI) reduce velocidad, si es de popa (diff ~ 0) aumenta
      const factorViento = 1 + 0.3 * Math.cos(diff);

      // Velocidad final
      const velocidad = factorVelocidadBase * velocidadTramo * factorViento * barco.velocidad * (1 + deltaTime * 0.1);

      // Avanzar progreso
      barco.progreso += velocidad;
      if (barco.progreso >= 1) {
        barco.progreso = 0;
        barco.waypointIndex = (barco.waypointIndex + 1) % this.waypoints.length;
      }

      // Interpolar posición
      const wpA = this.waypoints[barco.waypointIndex];
      const wpB = this.waypoints[(barco.waypointIndex + 1) % this.waypoints.length];
      barco.x = wpA.x + (wpB.x - wpA.x) * barco.progreso;
      barco.y = wpA.y + (wpB.y - wpA.y) * barco.progreso;
    }
  }

  private normalizarAngulo(angulo: number): number {
    while (angulo > Math.PI) angulo -= 2 * Math.PI;
    while (angulo < -Math.PI) angulo += 2 * Math.PI;
    return angulo;
  }

  private obtenerVectorViento(): { x: number; y: number } {
    const map: { [key: string]: { x: number; y: number } } = {
      N: { x: 0, y: -1 },
      S: { x: 0, y: 1 },
      E: { x: 1, y: 0 },
      O: { x: -1, y: 0 },
      NE: { x: 0.707, y: -0.707 },
      NO: { x: -0.707, y: -0.707 },
      SE: { x: 0.707, y: 0.707 },
      SO: { x: -0.707, y: 0.707 },
    };
    return map[this.direccionViento] || { x: 0, y: -1 };
  }

  // ==================== DIBUJADO DEL CANVAS ====================
  private dibujarRegata(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const w = this.canvasWidth || 600;
    const h = this.canvasHeight || 400;

    // Fondo
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0a1a2b';
    ctx.fillRect(0, 0, w, h);

    // Dibujar recorrido
    if (this.waypoints.length >= 2) {
      ctx.beginPath();
      ctx.moveTo(this.waypoints[0].x, this.waypoints[0].y);
      for (let i = 1; i < this.waypoints.length; i++) {
        ctx.lineTo(this.waypoints[i].x, this.waypoints[i].y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(0,230,214,0.5)';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Puntos de control
      for (const wp of this.waypoints) {
        ctx.beginPath();
        ctx.arc(wp.x, wp.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fill();
      }
    }

    // Dibujar rosa del viento
    const centerX = 60;
    const centerY = 60;
    const radius = 30;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    const v = this.obtenerVectorViento();
    const len = radius * 0.8;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + v.x * len, centerY + v.y * len);
    ctx.strokeStyle = '#00e6d6';
    ctx.lineWidth = 3;
    ctx.stroke();
    const angle = Math.atan2(v.y, v.x);
    const headLen = 10;
    ctx.beginPath();
    ctx.moveTo(centerX + v.x * len, centerY + v.y * len);
    ctx.lineTo(centerX + v.x * len - headLen * Math.cos(angle - 0.5), centerY + v.y * len - headLen * Math.sin(angle - 0.5));
    ctx.moveTo(centerX + v.x * len, centerY + v.y * len);
    ctx.lineTo(centerX + v.x * len - headLen * Math.cos(angle + 0.5), centerY + v.y * len - headLen * Math.sin(angle + 0.5));
    ctx.stroke();
    ctx.fillStyle = 'white';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Viento ' + this.direccionViento, centerX, centerY - radius - 10);

    // Ángulo óptimo (línea verde)
    if (this.anguloOptimo !== null) {
      const anguloRad = this.anguloOptimo * (Math.PI / 180);
      const vientoAngle = Math.atan2(v.y, v.x);
      const optAngle = vientoAngle + anguloRad;
      const lineLen = 60;
      const lineX = centerX + lineLen * Math.cos(optAngle);
      const lineY = centerY + lineLen * Math.sin(optAngle);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(lineX, lineY);
      ctx.strokeStyle = '#4caf50';
      ctx.lineWidth = 2;
      ctx.stroke();
      const headLen2 = 10;
      ctx.beginPath();
      ctx.moveTo(lineX, lineY);
      ctx.lineTo(lineX - headLen2 * Math.cos(optAngle - 0.5), lineY - headLen2 * Math.sin(optAngle - 0.5));
      ctx.moveTo(lineX, lineY);
      ctx.lineTo(lineX - headLen2 * Math.cos(optAngle + 0.5), lineY - headLen2 * Math.sin(optAngle + 0.5));
      ctx.stroke();
      ctx.fillStyle = '#4caf50';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Ángulo óptimo ${this.anguloOptimo.toFixed(0)}°`, lineX + 20, lineY - 10);
    }

    // Dibujar barcos
    for (const barco of this.barcos) {
      ctx.beginPath();
      ctx.arc(barco.x, barco.y, 8, 0, 2 * Math.PI);
      ctx.fillStyle = barco.color;
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = 'white';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(barco.nombre, barco.x, barco.y - 15);
    }

    // Información en el canvas
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`Distancia: ${this.distanciaRegata} mn`, w - 20, 30);
    ctx.fillText(`Barcos: ${this.numBarcos}`, w - 20, 50);
  }

  // ==================== CONTROL DE SIMULACIÓN ====================
  toggleRegata(): void {
    if (this.simulando) {
      this.detenerSimulacion();
    } else {
      this.iniciarSimulacion();
    }
  }

  private iniciarSimulacion(): void {
    if (this.simulando) return;
    this.simulando = true;
    this.tiempoSimulacion = 0;
    this.lastTimestamp = performance.now();
    this.notificacionService.mostrarInfo('🏁 ¡Regata iniciada!');
    this.bucleSimulacion();
  }

  private detenerSimulacion(): void {
    this.simulando = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.notificacionService.mostrarInfo('⏹️ Regata detenida');
  }

  private bucleSimulacion(): void {
    if (!this.simulando) return;

    const now = performance.now();
    const delta = (now - this.lastTimestamp) / 1000; // segundos
    this.lastTimestamp = now;
    this.tiempoSimulacion += delta;

    // Actualizar posiciones
    this.actualizarPosicionesBarcos(delta);

    // Redibujar
    this.dibujarRegata();

    // Continuar
    this.animationId = requestAnimationFrame(() => this.bucleSimulacion());
  }
}