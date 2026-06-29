import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CreateTicketRequest,
  SendMessageRequest,
  SupportTicket,
  TicketMessage,
} from '../model/support.model';

@Injectable({ providedIn: 'root' })
export class SupportService {
  private base = `${environment.apiBaseUrl}/api/v1/support`;

  constructor(private http: HttpClient) {}

  getMyTickets(): Observable<SupportTicket[]> {
    return this.http.get<SupportTicket[]>(`${this.base}/tickets/me`);
  }

  getAllTickets(): Observable<SupportTicket[]> {
    return this.http.get<SupportTicket[]>(`${this.base}/tickets`);
  }

  createTicket(payload: CreateTicketRequest): Observable<SupportTicket> {
    return this.http.post<SupportTicket>(`${this.base}/tickets`, payload);
  }

  getTicketById(ticketId: number): Observable<SupportTicket> {
    return this.http.get<SupportTicket>(`${this.base}/tickets/${ticketId}`);
  }

  getMessages(ticketId: number): Observable<TicketMessage[]> {
    return this.http.get<TicketMessage[]>(`${this.base}/tickets/${ticketId}/messages`);
  }

  sendMessage(ticketId: number, payload: SendMessageRequest): Observable<TicketMessage> {
    return this.http.post<TicketMessage>(`${this.base}/tickets/${ticketId}/messages`, payload);
  }

  updateStatus(ticketId: number, status: string): Observable<SupportTicket> {
    return this.http.patch<SupportTicket>(`${this.base}/tickets/${ticketId}/status`, { status });
  }
}
