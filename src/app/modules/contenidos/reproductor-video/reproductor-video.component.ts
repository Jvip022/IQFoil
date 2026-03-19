import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Pipe de duración
import { DuracionPipe } from '../lista-videos/duracion.pipe';

export interface VideoPlaylistItem {
  src: string;
  title: string;
  duration?: number;
}

@Component({
  selector: 'app-reproductor-video',
  standalone: true,
  imports: [CommonModule, FormsModule, DuracionPipe],
  templateUrl: './reproductor-video.component.html',
  styleUrls: ['./reproductor-video.component.scss']
})
export class ReproductorVideoComponent implements OnInit, OnDestroy {
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;

  @Input() src = '';
  @Input() title = '';
  @Input() autoplay = false;
  @Input() poster = '';
  @Input() playlist: VideoPlaylistItem[] = [];

  @Output() ended = new EventEmitter<void>();
  @Output() timeUpdate = new EventEmitter<number>();
  @Output() play = new EventEmitter<void>();
  @Output() pause = new EventEmitter<void>();

  isPlaying = false;
  isMuted = false;
  volume = 1;
  currentTime = 0;
  duration = 0;
  progress = 0;
  playbackRate = 1;
  isFullscreen = false;

  controlesVisibles = true;
  private timeoutControles: any;

  isSeeking = false;
  hoverProgress = 0;

  playlistIndex = 0;
  srcActual = '';

  constructor() {}

  ngOnInit(): void {
    this.actualizarSrc();
  }

  ngAfterViewInit(): void {
    this.inicializarEventosVideo();
  }

  ngOnDestroy(): void {
    if (this.timeoutControles) {
      clearTimeout(this.timeoutControles);
    }
  }

  private inicializarEventosVideo(): void {
    const video = this.videoPlayer.nativeElement;
    video.addEventListener('loadedmetadata', () => {
      this.duration = video.duration;
      if (this.playlist.length > 0 && !this.playlist[this.playlistIndex].duration) {
        this.playlist[this.playlistIndex].duration = video.duration;
      }
    });
  }

  private actualizarSrc(): void {
    if (this.playlist.length > 0) {
      this.srcActual = this.playlist[this.playlistIndex].src;
      this.title = this.playlist[this.playlistIndex].title;
    } else {
      this.srcActual = this.src;
    }
  }

  togglePlay(): void {
    const video = this.videoPlayer.nativeElement;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }

  onPlay(): void {
    this.isPlaying = true;
    this.play.emit();
  }

  onPause(): void {
    this.isPlaying = false;
    this.pause.emit();
  }

  onEnded(): void {
    this.isPlaying = false;
    this.ended.emit();
    if (this.playlist.length > 0 && this.playlistIndex < this.playlist.length - 1) {
      this.playlistIndex++;
      this.actualizarSrc();
      this.videoPlayer.nativeElement.load();
      this.videoPlayer.nativeElement.play();
    }
  }

  setVolume(event: Event): void {
    const value = parseFloat((event.target as HTMLInputElement).value);
    this.volume = value;
    this.videoPlayer.nativeElement.volume = value;
    this.isMuted = value === 0;
  }

  toggleMute(): void {
    this.isMuted = !this.isMuted;
    this.videoPlayer.nativeElement.muted = this.isMuted;
    if (!this.isMuted && this.volume === 0) {
      this.volume = 0.5;
      this.videoPlayer.nativeElement.volume = 0.5;
    }
  }

  onTimeUpdate(): void {
    const video = this.videoPlayer.nativeElement;
    this.currentTime = video.currentTime;
    this.progress = (this.currentTime / this.duration) * 100 || 0;
    this.timeUpdate.emit(this.currentTime);
  }

  onLoadedMetadata(): void {
    const video = this.videoPlayer.nativeElement;
    this.duration = video.duration;
  }

  onProgressBarMouseDown(event: MouseEvent): void {
    this.isSeeking = true;
    this.seekTo(event);
  }

  onProgressBarMouseMove(event: MouseEvent): void {
    if (this.isSeeking) {
      this.seekTo(event);
    } else {
      this.updateHoverProgress(event);
    }
  }

  onProgressBarMouseUp(): void {
    this.isSeeking = false;
  }

  private seekTo(event: MouseEvent): void {
    const bar = event.currentTarget as HTMLElement;
    const rect = bar.getBoundingClientRect();
    const pos = (event.clientX - rect.left) / rect.width;
    const newTime = pos * this.duration;
    if (isFinite(newTime)) {
      this.videoPlayer.nativeElement.currentTime = newTime;
    }
  }

  private updateHoverProgress(event: MouseEvent): void {
    const bar = event.currentTarget as HTMLElement;
    const rect = bar.getBoundingClientRect();
    const pos = (event.clientX - rect.left) / rect.width;
    this.hoverProgress = Math.min(100, Math.max(0, pos * 100));
  }

  setPlaybackRate(event: Event): void {
    const value = parseFloat((event.target as HTMLSelectElement).value);
    this.playbackRate = value;
    this.videoPlayer.nativeElement.playbackRate = value;
  }

  toggleFullscreen(): void {
    const elem = this.videoPlayer.nativeElement;
    if (!document.fullscreenElement) {
      elem.requestFullscreen();
      this.isFullscreen = true;
    } else {
      document.exitFullscreen();
      this.isFullscreen = false;
    }
  }

  seleccionarVideo(index: number): void {
    if (index !== this.playlistIndex) {
      this.playlistIndex = index;
      this.actualizarSrc();
      this.videoPlayer.nativeElement.load();
      this.videoPlayer.nativeElement.play();
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    const video = this.videoPlayer?.nativeElement;
    if (!video) return;

    switch (event.key) {
      case ' ':
        event.preventDefault();
        this.togglePlay();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        video.currentTime -= 10;
        break;
      case 'ArrowRight':
        event.preventDefault();
        video.currentTime += 10;
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.volume = Math.min(1, this.volume + 0.1);
        video.volume = this.volume;
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.volume = Math.max(0, this.volume - 0.1);
        video.volume = this.volume;
        break;
    }
  }

  mostrarControles(): void {
    this.controlesVisibles = true;
    if (this.timeoutControles) {
      clearTimeout(this.timeoutControles);
    }
  }

  ocultarControles(): void {
    if (this.isPlaying) {
      this.timeoutControles = setTimeout(() => {
        this.controlesVisibles = false;
      }, 2000);
    }
  }
}