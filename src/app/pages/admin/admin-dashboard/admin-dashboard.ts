import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupportService } from '../../support/services/support.service';
import { SupportTicket, TicketMessage, SendMessageRequest } from '../../support/model/support.model';
import { AuthService } from '../../../iam/services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface SystemUser {
  id: number;
  username: string;
  roles: string[];
}

type Tab = 'tickets' | 'users' | 'operations';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent implements OnInit {
  activeTab: Tab = 'tickets';

  // ── Tickets ──────────────────────────────────────────────────────────────
  tickets: SupportTicket[] = [];
  filteredTickets: SupportTicket[] = [];
  selectedTicket: SupportTicket | null = null;
  messages: TicketMessage[] = [];
  newMessage = '';
  statusFilter = '';
  priorityFilter = '';
  categoryFilter = '';
  searchQuery = '';
  updatingStatusId: number | null = null;

  readonly statuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
  readonly priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  readonly categories = ['IRRIGATION', 'SUBSCRIPTION', 'PROFILE', 'WATER_ZONE', 'SENSORS', 'ALERTS', 'OTHER'];

  // ── Users ─────────────────────────────────────────────────────────────────
  users: SystemUser[] = [];
  userRoleCounts: Record<string, number> = {};

  // ── Operations ────────────────────────────────────────────────────────────
  loadingOps = false;

  // ── Shared ────────────────────────────────────────────────────────────────
  loading = false;
  errorMessage = '';

  private destroyRef = inject(DestroyRef);

  constructor(
    private supportService: SupportService,
    private authService: AuthService,
    private http: HttpClient,
    private router: Router,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadTickets();
  }

  setTab(tab: Tab): void {
    this.activeTab = tab;
    this.selectedTicket = null;
    this.errorMessage = '';
    if (tab === 'tickets' && !this.tickets.length) this.loadTickets();
    if (tab === 'users' && !this.users.length) this.loadUsers();
  }

  // ── Tickets ───────────────────────────────────────────────────────────────

  loadTickets(): void {
    this.loading = true;
    this.supportService.getAllTickets().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (tickets) => {
        this.tickets = tickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.applyFilters();
        this.loading = false;
        this.cd.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Could not load tickets.';
        this.loading = false;
        this.cd.detectChanges();
      },
    });
  }

  applyFilters(): void {
    this.filteredTickets = this.tickets.filter((t) => {
      const matchStatus   = !this.statusFilter   || t.status === this.statusFilter;
      const matchPriority = !this.priorityFilter || t.priority === this.priorityFilter;
      const matchCategory = !this.categoryFilter || t.category === this.categoryFilter;
      const matchSearch   = !this.searchQuery    || t.requesterUsername.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchStatus && matchPriority && matchCategory && matchSearch;
    });
  }

  openTicket(ticket: SupportTicket): void {
    this.selectedTicket = ticket;
    this.messages = [];
    this.newMessage = '';
    this.supportService.getMessages(ticket.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (msgs) => { this.messages = msgs; this.cd.detectChanges(); },
    });
  }

  closeTicketDetail(): void {
    this.selectedTicket = null;
  }

  updateTicketStatus(ticketId: number, status: string): void {
    this.updatingStatusId = ticketId;
    this.supportService.updateStatus(ticketId, status).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (updated) => {
        this.tickets = this.tickets.map((t) => (t.id === ticketId ? updated : t));
        if (this.selectedTicket?.id === ticketId) this.selectedTicket = updated;
        this.applyFilters();
        this.updatingStatusId = null;
        this.cd.detectChanges();
      },
      error: () => { this.updatingStatusId = null; this.cd.detectChanges(); },
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedTicket) return;
    const payload: SendMessageRequest = { content: this.newMessage.trim(), attachmentUrls: [] };
    this.supportService.sendMessage(this.selectedTicket.id, payload).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (msg) => {
        this.messages = [...this.messages, msg];
        this.newMessage = '';
        this.cd.detectChanges();
      },
    });
  }

  // ── Users ─────────────────────────────────────────────────────────────────

  loadUsers(): void {
    this.loading = true;
    const token = this.authService.getToken() ?? '';
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.get<SystemUser[]>(`${environment.apiBaseUrl}/api/v1/users`, { headers })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (users) => {
          this.users = users;
          this.userRoleCounts = {};
          users.forEach((u) => {
            u.roles.forEach((r) => {
              this.userRoleCounts[r] = (this.userRoleCounts[r] ?? 0) + 1;
            });
          });
          this.loading = false;
          this.cd.detectChanges();
        },
        error: () => {
          this.errorMessage = 'Could not load users.';
          this.loading = false;
          this.cd.detectChanges();
        },
      });
  }

  getRoleLabel(role: string): string {
    return role.replace('ROLE_', '').replace('_', ' ');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  get currentUser() {
    return this.authService.getCurrentUser();
  }
}
