import { HttpErrorsService } from '../../../shared/http-error/http-errors.service';
import { TranslateService } from 'src/app/shared/translate/translate.service';
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { Injectable } from "@angular/core";
import { catchError, map, tap } from "rxjs/operators";
import { TelegramBotChat } from '../model/telegram-bot-chat';
import { TelegramBotChatsService } from '../telegram-bot-chats.service';
import { AddTelegramBotChat, DeleteTelegramBotChat, FetchTelegramBotChats, SubscribeTelegramBotChatsWS, UnSubscribeTelegramBotChatsWS, UpdateTelegramBotChat } from './telegram-bot-chats.actions';

export class TelegramBotChatsStateModel {
  telegramBotChats: TelegramBotChat[];
  telegramBotChat: TelegramBotChat;
  success: boolean;
  notifyChangeTelegramBotChats: boolean;
  errorMsg: string;
  successMsg: string;
}

export const telegramBotChatsStateDefaults: TelegramBotChatsStateModel = {
  telegramBotChats: [],
  telegramBotChat: undefined,
  success: false,
  notifyChangeTelegramBotChats: false,
  errorMsg: '',
  successMsg: '',
};

@State<TelegramBotChatsStateModel>({
  name: 'telegrambotchats',
  defaults: telegramBotChatsStateDefaults,
})

@Injectable()
export class TelegramBotChatsState {

  constructor(
    private readonly telegramBotChatsService: TelegramBotChatsService,
    private readonly translateService: TranslateService,
    private readonly httpErrorsService: HttpErrorsService,
  ) {}

  @Selector()
  static telegramBotChats(state: TelegramBotChatsStateModel): TelegramBotChat[] {
    return state.telegramBotChats;
  }

  @Selector()
  static telegramBotChat(state: TelegramBotChatsStateModel): TelegramBotChat {
    return state.telegramBotChat;
  }

  @Selector()
  static success(state: TelegramBotChatsStateModel): boolean {
    return state.success;
  }

  @Selector()
  static notifyChangeTelegramBotChats(state: TelegramBotChatsStateModel): boolean {
    return state.notifyChangeTelegramBotChats;
  }

  @Selector()
  static errorMsg(state: TelegramBotChatsStateModel): string {
    return state.errorMsg;
  }

  @Selector()
  static successMsg(state: TelegramBotChatsStateModel): string {
    return state.successMsg;
  }
  
  @Action(FetchTelegramBotChats)
  public fetchTelegramBotChats(
    { patchState }: StateContext<TelegramBotChatsStateModel>,
    { payload }: FetchTelegramBotChats
  ) { 
    return this.telegramBotChatsService.fetchTelegramBotChats(payload.filter).pipe(
      map((telegramBotChats: TelegramBotChat[]) => {
        patchState({
          telegramBotChats: [],
        });

        if (telegramBotChats) {
          patchState({
            telegramBotChats: telegramBotChats,
          });
        }
      })
    );
  }

  @Action(AddTelegramBotChat)
  public addTelegramBotChat(
    { patchState }: StateContext<TelegramBotChatsStateModel>,
    { payload }: AddTelegramBotChat
  ) {
    return this.telegramBotChatsService.addTelegramBotChat(payload.telegramBotChat).pipe(
      tap((telegramBotChat: TelegramBotChat) => {
        patchState({
          success: false,
          errorMsg: this.translateService.getTranslate('label.telegram-bot-chats.state.create.error'),
        });

        if (telegramBotChat) {
          patchState({
            success: true,
            successMsg: this.translateService.getTranslate('label.telegram-bot-chats.state.create.success'),
          });
        }
      }),
      catchError(error => {
        let errorMsg: string = this.translateService.getTranslate('label.telegram-bot-chats.state.create.error');
        if (this.httpErrorsService.getErrorMessage(error.error.message)) {
          errorMsg = this.httpErrorsService.getErrorMessage(error.error.message);
        }

        patchState({
          success: false,
          errorMsg: errorMsg,
        });
        
        throw new Error(error);
      }),
    );
  }

  @Action(UpdateTelegramBotChat)
  public updateTelegramBotChat(
    { patchState }: StateContext<TelegramBotChatsStateModel>,
    { payload }: UpdateTelegramBotChat
  ) {
    return this.telegramBotChatsService.updateTelegramBotChat(payload._id, payload.telegramBotChat).pipe(
      tap((telegramBotChat: TelegramBotChat) => {
        patchState({
          success: false,
          errorMsg: this.translateService.getTranslate('label.telegram-bot-chats.state.update.error'),
        });

        if (telegramBotChat) {
          patchState({
            success: true,
            successMsg: this.translateService.getTranslate('label.telegram-bot-chats.state.update.success'),
          });
        }
      }),
      catchError(error => {
        let errorMsg: string = this.translateService.getTranslate('label.telegram-bot-chats.state.update.error');
        if (this.httpErrorsService.getErrorMessage(error.error.message)) {
          errorMsg = this.httpErrorsService.getErrorMessage(error.error.message);
        }

        patchState({
          success: false,
          errorMsg: errorMsg,
        });
        
        throw new Error(error);
      }),
    );
  }

  @Action(DeleteTelegramBotChat)
  public deleteTelegramBotChat(
    { patchState }: StateContext<TelegramBotChatsStateModel>,
    { payload }: DeleteTelegramBotChat
  ) {
    return this.telegramBotChatsService.deleteTelegramBotChats(payload._id).pipe(
      tap((result: boolean) => {
        patchState({
          success: false,
          errorMsg: this.translateService.getTranslate('label.telegram-bot-chats.state.delete.error'),
        });

        if (result) {
          patchState({
            success: true,
            successMsg: this.translateService.getTranslate('label.telegram-bot-chats.state.delete.success'),
          });
        }
      }),
      catchError(error => {
        let errorMsg: string = this.translateService.getTranslate('label.telegram-bot-chats.state.delete.error');
        if (this.httpErrorsService.getErrorMessage(error.error.message)) {
          errorMsg = this.httpErrorsService.getErrorMessage(error.error.message);
        }

        patchState({
          success: false,
          errorMsg: errorMsg,
        });
        
        throw new Error(error);
      }),
    );
  }
  
  @Action(SubscribeTelegramBotChatsWS)
  public subscribeTelegramBotChatsWS(ctx: StateContext<TelegramBotChatsStateModel>) {
    return this.telegramBotChatsService.getTelegramBotChatsBySocket().pipe(
      map((change: boolean) => {
        if (change) {
          let state = ctx.getState();

          state = {
            ...state,
            notifyChangeTelegramBotChats : !state.notifyChangeTelegramBotChats
          };

          ctx.setState({ ...state });
        }
      })
    )
  }

  @Action(UnSubscribeTelegramBotChatsWS)
  public unSubscribeTelegramBotChatsWS() {
    this.telegramBotChatsService.removeSocket();
  }
}