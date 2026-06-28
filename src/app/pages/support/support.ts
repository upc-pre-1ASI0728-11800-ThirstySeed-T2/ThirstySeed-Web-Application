import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateDirective } from '@ngx-translate/core';
import { AuthService } from '../../iam/services/auth.service';
import { SupportService } from './services/support.service';
import { SupportTicket, TicketMessage } from './model/support.model';

type Panel = 'empty' | 'new' | 'detail';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, TranslateDirective],
  templateUrl: './support.html',
  styleUrl: './support.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupportComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatEnd') chatEnd!: ElementRef;

  tickets: SupportTicket[] = [];
  loadingTickets = true;
  ticketError = '';

  panel: Panel = 'empty';
  selectedTicket: SupportTicket | null = null;
  messages: TicketMessage[] = [];
  loadingMessages = false;

  newTitle = '';
  newDescription = '';
  newCategory = 'IRRIGATION';
  newPriority = 'LOW';
  creating = false;
  createError = '';

  messageContent = '';
  sending = false;

  categories = ['IRRIGATION', 'SENSORS', 'WATER_ZONE', 'ALERTS', 'PROFILE', 'SUBSCRIPTION', 'OTHER'];
  priorities = ['LOW', 'MEDIUM', 'HIGH'];

  private currentUserId = 0;
  private shouldScrollChat = false;

  constructor(
    private authService: AuthService,
    private supportService: SupportService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) this.currentUserId = user.id;
    this.loadTickets();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollChat) {
      this.scrollToBottom();
      this.shouldScrollChat = false;
    }
  }

  loadTickets(): void {
    this.loadingTickets = true;
    this.ticketError = '';
    this.supportService.getMyTickets().subscribe({
      next: (tickets) => {
        this.tickets = tickets.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        this.loadingTickets = false;
        this.cd.detectChanges();
      },
      error: () => {
        this.ticketError = 'Could not load tickets. Please try again.';
        this.loadingTickets = false;
        this.cd.detectChanges();
      },
    });
  }

  openNewTicket(): void {
    this.panel = 'new';
    this.selectedTicket = null;
    this.createError = '';
    this.newTitle = '';
    this.newDescription = '';
    this.newCategory = 'IRRIGATION';
    this.newPriority = 'LOW';
  }

  cancelNew(): void {
    this.panel = this.selectedTicket ? 'detail' : 'empty';
  }

  submitTicket(): void {
    if (!this.newTitle.trim() || !this.newDescription.trim()) {
      this.createError = 'Title and description are required.';
      return;
    }
    this.creating = true;
    this.createError = '';
    this.supportService.createTicket({
      title: this.newTitle.trim(),
      description: this.newDescription.trim(),
      category: this.newCategory,
      priority: this.newPriority,
      attachmentUrls: [],
    }).subscribe({
      next: (ticket) => {
        this.tickets.unshift(ticket);
        this.creating = false;
        this.openDetail(ticket);
        this.cd.detectChanges();
      },
      error: (err) => {
        this.createError = err?.error?.message || 'Failed to create ticket. Please try again.';
        this.creating = false;
        this.cd.detectChanges();
      },
    });
  }

  openDetail(ticket: SupportTicket): void {
    this.selectedTicket = ticket;
    this.panel = 'detail';
    this.messages = [];
    this.loadingMessages = true;
    this.supportService.getMessages(ticket.id).subscribe({
      next: (msgs) => {
        this.messages = msgs;
        this.loadingMessages = false;
        this.shouldScrollChat = true;
        this.cd.detectChanges();
      },
      error: () => {
        this.loadingMessages = false;
        this.cd.detectChanges();
      },
    });
  }

  sendMessage(): void {
    if (!this.messageContent.trim() || !this.selectedTicket) return;
    const content = this.messageContent.trim();
    this.messageContent = '';
    this.sending = true;
    this.supportService.sendMessage(this.selectedTicket.id, {
      content,
      attachmentUrls: [],
    }).subscribe({
      next: (msg) => {
        this.messages.push(msg);
        this.sending = false;
        this.shouldScrollChat = true;
        this.cd.detectChanges();
      },
      error: () => {
        this.messageContent = content;
        this.sending = false;
        this.cd.detectChanges();
      },
    });
  }

  onMsgKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  isOwnMessage(msg: TicketMessage): boolean {
    return msg.senderUserId === this.currentUserId;
  }

  statusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'OPEN': return 'status-open';
      case 'IN_PROGRESS': return 'status-progress';
      case 'RESOLVED': return 'status-resolved';
      case 'CLOSED': return 'status-closed';
      default: return 'status-open';
    }
  }

  priorityClass(priority: string): string {
    switch (priority?.toUpperCase()) {
      case 'HIGH': return 'priority-high';
      case 'MEDIUM': return 'priority-medium';
      case 'LOW': return 'priority-low';
      default: return 'priority-low';
    }
  }

  formatDate(iso: string): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  }

  formatTime(iso: string): string {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit',
    });
  }

  private scrollToBottom(): void {
    try {
      this.chatEnd?.nativeElement?.scrollIntoView({ behavior: 'smooth' });
    } catch { /* noop */ }
  }

  trackById(_: number, item: {id: number}): number { return item.id; }
  trackByValue(_: number, item: string): string { return item; }
}
