import { cloneDeep } from 'lodash-es';
import { SpinnerService } from 'src/app/shared/spinner/spinner.service';
import { FormsService } from '../../../shared/forms/forms.service';
import { TranslateService } from '../../../shared/translate/translate.service';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FormsError } from 'src/app/shared/forms/forms-errors.model';
import { ResolutionService } from 'src/app/shared/resolution/resolution.service';
import { SendMessage } from '../model/send-message';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { Select, Store } from '@ngxs/store';
import { AuthState } from '../../auth/store/auth.state';
import { Observable } from 'rxjs';
import { User } from '../../users/model/user';
import { SendMessageGroup } from '../store/telegram-bot-tester.actions';
import { TelegramBotTesterState } from '../store/telegram-bot-tester.state';
import { TelegramBotChat } from '../../telegram-bot-chats/model/telegram-bot-chat';
import { TelegramBotChatsState } from '../../telegram-bot-chats/store/telegram-bot-chats.state';
import { FetchTelegramBotChats } from '../../telegram-bot-chats/store/telegram-bot-chats.actions';

@Component({
  selector: 'app-telegram-bot-tester',
  templateUrl: './telegram-bot-tester.component.html',
  styleUrls: ['./telegram-bot-tester.component.scss']
})
export class TelegramBotTesterComponent implements OnInit, OnDestroy {

  public sendMessageForm: FormGroup;
  public formErrors: FormsError[];

  @Select(AuthState.loggedUser) loggedUser$: Observable<User>;
  public loggedUser: User;

  public telegramBotChats: TelegramBotChat[];
  public selectDataForm: FormGroup;

  constructor(
    public readonly resolutionService: ResolutionService,
    private readonly translateService: TranslateService,
    public readonly formsService: FormsService,
    private readonly spinnerService: SpinnerService,
    private readonly toastService: ToastService,
    private readonly store: Store,
  ) {}

  async ngOnInit() {
    this.loggedUser$.subscribe((loggedUser: User) => {
      this.loggedUser = undefined;
      if (loggedUser && loggedUser._id) {
        this.loggedUser = loggedUser;
      }
    });

    this.telegramBotChats = [];
    if (this.loggedUser) {
      this.telegramBotChats = await new Promise<TelegramBotChat[]>((resolve) => {
        this.spinnerService.showSpinner();
        this.store.dispatch(new FetchTelegramBotChats({ filter: { user: this.loggedUser.name } })).subscribe({
          next: () => {
            this.spinnerService.hideSpinner(); 

            if (
              this.store.selectSnapshot(TelegramBotChatsState.telegramBotChats) && 
              this.store.selectSnapshot(TelegramBotChatsState.telegramBotChats).length > 0
            ) {
              resolve(cloneDeep(this.store.selectSnapshot(TelegramBotChatsState.telegramBotChats)));
            } else {
              resolve([]);
            }
          },
          error: () => {
            this.spinnerService.hideSpinner();
            resolve([]);
          },
        });
      });
    }
    
    this.sendMessageForm = new FormGroup({
      token: new FormControl('', [Validators.required]),
      chat_id: new FormControl('', [Validators.required]),
      text: new FormControl('', [Validators.required]),
    });

    this.selectDataForm = new FormGroup({
      chatId: new FormControl(''),
    });
  }

  ngOnDestroy(): void {
    this.sendMessageForm = this.formsService.cleanErrors(this.sendMessageForm);
  }

  onCLickClean() {
    this.sendMessageForm = this.formsService.cleanErrors(this.sendMessageForm);
  }

  onClickSubmit() {
    const sendMessage: SendMessage = this.sendMessageForm.value;
    if (!this.validateFormValues(sendMessage)) {
      return;
    }

    if (sendMessage.chat_id[0] != '-') {
      sendMessage.chat_id = `-${sendMessage.chat_id}`;
    }

    if (this.loggedUser) {
      sendMessage.user = cloneDeep(this.loggedUser);
    }

    this.sendMessageToGroup(sendMessage);
  }

  private sendMessageToGroup(sendMessage: SendMessage) {
    this.spinnerService.showSpinner();
    this.store.dispatch(new SendMessageGroup({ sendMessage: sendMessage })).subscribe({
      next: () => {
        const success: boolean = this.store.selectSnapshot(TelegramBotTesterState.success);
        if (!success) {
          this.spinnerService.hideSpinner();
          this.toastService.addErrorMessage(this.store.selectSnapshot(TelegramBotTesterState.errorMsg));
          return;
        }

        this.selectDataForm.reset();
        this.onCLickClean();
        this.spinnerService.hideSpinner();
        this.toastService.addSuccessMessage(this.store.selectSnapshot(TelegramBotTesterState.successMsg));
        return;
      }, 
      error: () => {
        this.spinnerService.hideSpinner();
        this.toastService.addErrorMessage(this.store.selectSnapshot(TelegramBotTesterState.errorMsg));
      }
    })
  }

  private validateFormValues(sendMessage: SendMessage): boolean {
    this.formErrors = [];

    if (!sendMessage.token) {
      this.formErrors.push({ 
        formControlName: 'token', 
        error: this.translateService.getTranslate('label.telegram-bot.component.form.validate.token') 
      });
    }

    if (sendMessage.token) {
      const splitToken: string[] = sendMessage.token.split(':');
      if (!splitToken  || splitToken && splitToken.length != 2) {
        this.formErrors.push({ 
          formControlName: 'token', 
          error: this.translateService.getTranslate('label.telegram-bot.component.form.validate.token.format') 
        });
      }
    }

    if (!sendMessage.chat_id) {
      this.formErrors.push({ 
        formControlName: 'chat_id', 
        error: this.translateService.getTranslate('label.telegram-bot.component.form.validate.chat_id') 
      });
    }

    if (!sendMessage.text) {
      this.formErrors.push({ 
        formControlName: 'text', 
        error: this.translateService.getTranslate('label.telegram-bot.component.form.validate.text') 
      });
    }

    this.sendMessageForm = this.formsService.setErrors(this.sendMessageForm, this.formErrors);

    if (this.formErrors && this.formErrors.length > 0) {
      return false;
    }

    return true;
  }

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) { 
    if (event.key != 'Enter') {
      return;
    }

    this.onClickSubmit();
  }

  onUserChatIdChange() {
    const selected_chat_id: string = this.selectDataForm.value.chatId;
    if (!selected_chat_id || (selected_chat_id && selected_chat_id.length == 0)) {
      this.sendMessageForm.controls.chat_id.setValue('');
      return;
    }

    this.sendMessageForm.controls.chat_id.setValue(selected_chat_id);
  }

  onCleanUserChatId() {
    this.selectDataForm.controls.chatId.setValue('');
    this.sendMessageForm.controls.chat_id.setValue('');
  }
}
