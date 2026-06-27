import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from './language.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button class="lang-toggle" (click)="toggle()" [title]="label">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
      </svg>
      <span>{{ langLabel }}</span>
    </button>
  `,
  styles: [`
    .lang-toggle {
      display: flex;
      align-items: center;
      gap: 6px;
      width: 100%;
      padding: 9px 16px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      color: #c8e6c9;
      font-size: 12.5px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
      font-family: inherit;
    }
    .lang-toggle:hover { background: rgba(255,255,255,0.12); }
    svg { stroke: #81c784; flex-shrink: 0; }
  `],
})
export class LanguageSwitcherComponent {
  constructor(public langService: LanguageService) {}

  get langLabel(): string {
    return this.langService.current === 'en' ? 'English' : 'Español';
  }

  get label(): string {
    return this.langService.current === 'en' ? 'Switch to Spanish' : 'Cambiar a inglés';
  }

  toggle(): void {
    this.langService.toggle();
  }
}
