import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LanguageService } from './shared/language/language.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly title = signal('ThirstySeed-WebApp');

  constructor(private langService: LanguageService) {}

  ngOnInit(): void {
    this.langService.init();
  }
}
