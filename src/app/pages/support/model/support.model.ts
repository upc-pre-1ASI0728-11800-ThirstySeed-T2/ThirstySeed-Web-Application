export interface SupportTicket {
  id: number;
  requesterUserId: number;
  requesterUsername: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketMessage {
  id: number;
  ticketId: number;
  senderUserId: number;
  senderUsername: string;
  content: string;
  attachmentUrls: string[];
  createdAt: string;
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  category: string;
  priority: string;
  attachmentUrls: string[];
}

export interface SendMessageRequest {
  content: string;
  attachmentUrls: string[];
}
