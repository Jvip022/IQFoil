import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Componentes compartidos
import { EstadoConexionComponent } from '../../../shared/estado-conexion/estado-conexion.component';

// Servicios
import { NotificacionService } from '../../../core/services/notificacion.service';

interface Parametros {
  viento: number;        // nudos
  ola: number;           // metros
  peso: number;          // kg
  anguloFoil: number;    // grados
  olaGrande: boolean;
}

interface Resultados {
  anguloOptimo: number;
  tensionStay: number;
  posicionCarro: number;
  anguloOrza: number;
  recomendacion: string;
}

@Component({
  selector: 'app-calculadora-ajustes',
  standalone: true,
  imports: [CommonModule, FormsModule, EstadoConexionComponent],
  templateUrl: './calculadora-ajustes.component.html',
  styleUrls: ['./calculadora-ajustes.component.scss']
})
export class CalculadoraAjustesComponent implements OnInit {
  params: Parametros = {
    viento: 15,
    ola: 1.5,
    peso: 75,
    anguloFoil: 5,
    olaGrande: false
  };

  resultados: Resultados = {
    anguloOptimo: 0,
    tensionStay: 0,
    posicionCarro: 0,
    anguloOrza: 0,
    recomendacion: ''
  };

  constructor(private notificacionService: NotificacionService) {}

  ngOnInit(): void {
    this.calcular();
  }

  calcular(): void {
    const viento = this.params.viento;
    const ola = this.params.ola;
    const peso = this.params.peso;
    const anguloBase = this.params.anguloFoil;
    const olaGrande = this.params.olaGrande;

    // Fórmulas simplificadas para simulación (ajustables según necesidades reales)
    let anguloOptimo = anguloBase + (viento * 0.1) - (ola * 0.5);
    if (olaGrande) anguloOptimo += 2;
    anguloOptimo = Math.max(0, Math.min(15, anguloOptimo));

    let tensionStay = (viento * 5) + (peso * 0.8);
    tensionStay = Math.round(tensionStay);

    let posicionCarro = 10 + (viento * 0.5) - (ola * 2);
    posicionCarro = Math.max(0, Math.min(30, posicionCarro));

    let anguloOrza = 5 + (viento * 0.2) + (olaGrande ? 3 : 0);
    anguloOrza = Math.max(0, Math.min(15, anguloOrza));

    let recomendacion = '';
    if (viento > 20) {
      recomendacion = 'Viento fuerte: reduce ángulo de foil y aumenta tensión.';
    } else if (viento < 8) {
      recomendacion = 'Viento ligero: busca más ángulo de foil y menor tensión.';
    } else if (ola > 2) {
      recomendacion = 'Ola grande: ajusta posición del carro hacia atrás.';
    } else {
      recomendacion = 'Condiciones normales, configuración estándar.';
    }

    this.resultados = {
      anguloOptimo: parseFloat(anguloOptimo.toFixed(1)),
      tensionStay,
      posicionCarro: parseFloat(posicionCarro.toFixed(1)),
      anguloOrza: parseFloat(anguloOrza.toFixed(1)),
      recomendacion
    };
  }

  resetear(): void {
    this.params = {
      viento: 15,
      ola: 1.5,
      peso: 75,
      anguloFoil: 5,
      olaGrande: false
    };
    this.calcular();
    this.notificacionService.mostrarInfo('Valores restablecidos a configuración por defecto');
  }

  guardarConfiguracion(): void {
    const config = {
      parametros: this.params,
      resultados: this.resultados,
      fecha: new Date()
    };
    localStorage.setItem('ultimaConfiguracion', JSON.stringify(config));
    this.notificacionService.mostrarExito('Configuración guardada localmente');
  }
}