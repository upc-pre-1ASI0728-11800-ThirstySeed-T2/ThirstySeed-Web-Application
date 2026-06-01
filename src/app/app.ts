import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './shared/sidebar/sidebar'; // ← importa el componente

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    SidebarComponent,   // ← agrégala aquí
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('ThirstySeed-WebApp');
}
