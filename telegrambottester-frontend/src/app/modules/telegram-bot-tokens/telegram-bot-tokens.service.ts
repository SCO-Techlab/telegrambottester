import { JoinPipe } from '../../shared/join/join.pipe';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { websocketEvents } from 'src/app/websocket/websocket.events';
import { WebSocketService } from 'src/app/websocket/websocket.service';
import { environment } from 'src/environments/environment';
import { TelegramBotToken } from './model/telegram-bot-token';

@Injectable({
  providedIn: 'root'
})
export class TelegramBotTokensService {

  constructor(
    private readonly joinPipe: JoinPipe,
    private readonly http: HttpClient,
    private readonly websocketsService: WebSocketService,
  ) {}

  fetchTelegramBotTokens(filter?: any): Observable<TelegramBotToken[]> {
    const params: string[] = [];

    if (filter) {
      if (filter.token) {
        params.push(`token=${filter.token}`);
      }

      if (filter.user) {
        params.push(`user=${filter.user}`);
      }

      if (filter.description) {
        params.push(`description=${filter.description}`);
      }
    }

    return this.http.get<TelegramBotToken[]>(`${environment.apiUrl}/telegram-bot-tokens${params.length == 0 
      ? '' 
      : `?${this.joinPipe.transform(params, '&')}`}
    `);
  }

  addTelegramBotToken(telegramBotToken: TelegramBotToken): Observable<TelegramBotToken> {
    return this.http.post<TelegramBotToken>(`${environment.apiUrl}/telegram-bot-tokens`, telegramBotToken);
  }

  updateTelegramBotToken(_id: string, telegramBotToken: TelegramBotToken): Observable<TelegramBotToken> {
    return this.http.put<TelegramBotToken>(`${environment.apiUrl}/telegram-bot-tokens/${_id}`, telegramBotToken);
  }

  deleteTelegramBotToken(_id: string): Observable<boolean> {
    return this.http.delete<boolean>(`${environment.apiUrl}/telegram-bot-tokens/${_id}`)
  }

  getTelegramBotTokensBySocket(): any {
    return this.websocketsService.getMessage(websocketEvents.WS_TELEGRAM_BOT_TOKEN);
  }
  
  removeSocket(): any {
    this.websocketsService.removeListenerMessage(websocketEvents.WS_TELEGRAM_BOT_TOKEN);
  }
}
