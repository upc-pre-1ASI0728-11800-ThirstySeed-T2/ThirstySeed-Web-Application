import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type AppLang = 'en' | 'es';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly STORAGE_KEY = 'app_lang';
  readonly supported: AppLang[] = ['en', 'es'];

  constructor(private translate: TranslateService) {}

  init(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY) as AppLang | null;
    const lang: AppLang = saved && this.supported.includes(saved) ? saved : 'en';
    this.translate.use(lang);
  }

  get current(): AppLang {
    const lang = this.translate.currentLang() as AppLang | null;
    return lang ?? 'en';
  }

  use(lang: AppLang): void {
    this.translate.use(lang);
    localStorage.setItem(this.STORAGE_KEY, lang);
  }

  toggle(): void {
    this.use(this.current === 'en' ? 'es' : 'en');
  }
}
