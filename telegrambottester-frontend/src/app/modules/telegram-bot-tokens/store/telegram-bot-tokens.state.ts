import { HttpErrorsService } from '../../../shared/http-error/http-errors.service';
import { TranslateService } from 'src/app/shared/translate/translate.service';
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { Injectable } from "@angular/core";
import { catchError, map, tap } from "rxjs/operators";
import { TelegramBotToken } from '../model/telegram-bot-token';
import { TelegramBotTokensService } from '../telegram-bot-tokens.service';
import { AddTelegramBotToken, DeleteTelegramBotToken, FetchTelegramBotTokens, SubscribeTelegramBotTokensWS, UnSubscribeTelegramBotTokensWS, UpdateTelegramBotToken } from './telegram-bot-tokens.actions';

export class TelegramBotTokensStateModel {
  telegramBotTokens: TelegramBotToken[];
  telegramBotToken: TelegramBotToken;
  success: boolean;
  notifyChangeTelegramBotTokens: boolean;
  errorMsg: string;
  successMsg: string;
}

export const telegramBotTokensStateDefaults: TelegramBotTokensStateModel = {
  telegramBotTokens: [],
  telegramBotToken: undefined,
  success: false,
  notifyChangeTelegramBotTokens: false,
  errorMsg: '',
  successMsg: '',
};

@State<TelegramBotTokensStateModel>({
  name: 'telegrambottokens',
  defaults: telegramBotTokensStateDefaults,
})

@Injectable()
export class TelegramBotTokensState {

  constructor(
    private readonly telegramBotTokensService: TelegramBotTokensService,
    private readonly translateService: TranslateService,
    private readonly httpErrorsService: HttpErrorsService,
  ) {}

  @Selector()
  static telegramBotTokens(state: TelegramBotTokensStateModel): TelegramBotToken[] {
    return state.telegramBotTokens;
  }

  @Selector()
  static telegramBotToken(state: TelegramBotTokensStateModel): TelegramBotToken {
    return state.telegramBotToken;
  }

  @Selector()
  static success(state: TelegramBotTokensStateModel): boolean {
    return state.success;
  }

  @Selector()
  static notifyChangeTelegramBotTokens(state: TelegramBotTokensStateModel): boolean {
    return state.notifyChangeTelegramBotTokens;
  }

  @Selector()
  static errorMsg(state: TelegramBotTokensStateModel): string {
    return state.errorMsg;
  }

  @Selector()
  static successMsg(state: TelegramBotTokensStateModel): string {
    return state.successMsg;
  }
  
  @Action(FetchTelegramBotTokens)
  public fetchTelegramBotTokens(
    { patchState }: StateContext<TelegramBotTokensStateModel>,
    { payload }: FetchTelegramBotTokens
  ) { 
    return this.telegramBotTokensService.fetchTelegramBotTokens(payload.filter).pipe(
      map((telegramBotTokens: TelegramBotToken[]) => {
        patchState({
          telegramBotTokens: [],
        });

        if (telegramBotTokens) {
          patchState({
            telegramBotTokens: telegramBotTokens,
          });
        }
      })
    );
  }

  @Action(AddTelegramBotToken)
  public addTelegramBotToken(
    { patchState }: StateContext<TelegramBotTokensStateModel>,
    { payload }: AddTelegramBotToken
  ) {
    return this.telegramBotTokensService.addTelegramBotToken(payload.telegramBotToken).pipe(
      tap((telegramBotToken: TelegramBotToken) => {
        patchState({
          success: false,
          errorMsg: this.translateService.getTranslate('label.telegram-bot-tokens.state.create.error'),
        });

        if (telegramBotToken) {
          patchState({
            success: true,
            successMsg: this.translateService.getTranslate('label.telegram-bot-tokens.state.create.success'),
          });
        }
      }),
      catchError(error => {
        let errorMsg: string = this.translateService.getTranslate('label.telegram-bot-tokens.state.create.error');
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

  @Action(UpdateTelegramBotToken)
  public updateTelegramBotToken(
    { patchState }: StateContext<TelegramBotTokensStateModel>,
    { payload }: UpdateTelegramBotToken
  ) {
    return this.telegramBotTokensService.updateTelegramBotToken(payload._id, payload.telegramBotToken).pipe(
      tap((telegramBotToken: TelegramBotToken) => {
        patchState({
          success: false,
          errorMsg: this.translateService.getTranslate('label.telegram-bot-tokens.state.update.error'),
        });

        if (telegramBotToken) {
          patchState({
            success: true,
            successMsg: this.translateService.getTranslate('label.telegram-bot-tokens.state.update.success'),
          });
        }
      }),
      catchError(error => {
        let errorMsg: string = this.translateService.getTranslate('label.telegram-bot-tokens.state.update.error');
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

  @Action(DeleteTelegramBotToken)
  public deleteTelegramBotToken(
    { patchState }: StateContext<TelegramBotTokensStateModel>,
    { payload }: DeleteTelegramBotToken
  ) {
    return this.telegramBotTokensService.deleteTelegramBotToken(payload._id).pipe(
      tap((result: boolean) => {
        patchState({
          success: false,
          errorMsg: this.translateService.getTranslate('label.telegram-bot-tokens.state.delete.error'),
        });

        if (result) {
          patchState({
            success: true,
            successMsg: this.translateService.getTranslate('label.telegram-bot-tokens.state.delete.success'),
          });
        }
      }),
      catchError(error => {
        let errorMsg: string = this.translateService.getTranslate('label.telegram-bot-tokens.state.delete.error');
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
  
  @Action(SubscribeTelegramBotTokensWS)
  public subscribeTelegramBotTokensWS(ctx: StateContext<TelegramBotTokensStateModel>) {
    return this.telegramBotTokensService.getTelegramBotTokensBySocket().pipe(
      map((change: boolean) => {
        if (change) {
          let state = ctx.getState();

          state = {
            ...state,
            notifyChangeTelegramBotTokens : !state.notifyChangeTelegramBotTokens
          };

          ctx.setState({ ...state });
        }
      })
    )
  }

  @Action(UnSubscribeTelegramBotTokensWS)
  public unSubscribeTelegramBotTokensWS() {
    this.telegramBotTokensService.removeSocket();
  }
}