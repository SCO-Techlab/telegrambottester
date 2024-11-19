import { JoinPipe } from '../../shared/join/join.pipe';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { websocketEvents } from 'src/app/websocket/websocket.events';
import { WebSocketService } from 'src/app/websocket/websocket.service';
import { environment } from 'src/environments/environment';
import { TelegramBotChat } from './model/telegram-bot-chat';

@Injectable({
  providedIn: 'root'
})
export class TelegramBotChatsService {

  constructor(
    private readonly joinPipe: JoinPipe,
    private readonly http: HttpClient,
    private readonly websocketsService: WebSocketService,
  ) {}

  fetchTelegramBotChats(filter?: any): Observable<TelegramBotChat[]> {
    const params: string[] = [];

    if (filter) {
      if (filter.chatId) {
        params.push(`chatId=${filter.chatId}`);
      }

      if (filter.user) {
        params.push(`user=${filter.user}`);
      }

      if (filter.description) {
        params.push(`description=${filter.description}`);
      }
    }

    return this.http.get<TelegramBotChat[]>(`${environment.apiUrl}/telegram-bot-chats${params.length == 0 
      ? '' 
      : `?${this.joinPipe.transform(params, '&')}`}
    `);
  }

  addTelegramBotChat(telegramBotChat: TelegramBotChat): Observable<TelegramBotChat> {
    return this.http.post<TelegramBotChat>(`${environment.apiUrl}/telegram-bot-chats`, telegramBotChat);
  }

  updateTelegramBotChat(_id: string, telegramBotChat: TelegramBotChat): Observable<TelegramBotChat> {
    return this.http.put<TelegramBotChat>(`${environment.apiUrl}/telegram-bot-chats/${_id}`, telegramBotChat);
  }

  deleteTelegramBotChats(_id: string): Observable<boolean> {
    return this.http.delete<boolean>(`${environment.apiUrl}/telegram-bot-chats/${_id}`)
  }

  getTelegramBotChatsBySocket(): any {
    return this.websocketsService.getMessage(websocketEvents.WS_TELEGRAM_BOT_CHAT);
  }
  
  removeSocket(): any {
    this.websocketsService.removeListenerMessage(websocketEvents.WS_TELEGRAM_BOT_CHAT);
  }
}
