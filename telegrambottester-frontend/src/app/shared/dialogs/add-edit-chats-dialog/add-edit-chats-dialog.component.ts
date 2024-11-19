import { cloneDeep } from 'lodash-es';
import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FormsError } from '../../forms/forms-errors.model';
import { ResolutionService } from '../../resolution/resolution.service';
import { TranslateService } from '../../translate/translate.service';
import { FormsService } from '../../forms/forms.service';
import { AddEditChatsDialogoData } from './model/add-edit-chats-dialog-data';
import { TelegramBotChat } from 'src/app/modules/telegram-bot-chats/model/telegram-bot-chat';

@Component({
  selector: 'app-add-edit-chats-dialog',
  templateUrl: './add-edit-chats-dialog.component.html',
  styleUrls: ['./add-edit-chats-dialog.component.scss']
})
export class AddEditChatsDialogComponent implements OnInit, AfterViewInit {

  public edit: boolean;
  public telegramBotChat: TelegramBotChat;

  public addEditChatsDialogForm: FormGroup;
  public formErrors: FormsError[];

  constructor(
    public readonly dialogRef: MatDialogRef<AddEditChatsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddEditChatsDialogoData,
    public readonly resolutionService: ResolutionService,
    private readonly translateService: TranslateService,
    public readonly formsService: FormsService,
  ) {}

  ngOnInit(): void {
    this.edit = false;
    this.telegramBotChat = new TelegramBotChat();

    this.addEditChatsDialogForm = new FormGroup({
      chatId: new FormControl('', [Validators.required]),
      description: new FormControl(''),
    });

    this.formErrors = [];

    if (this.data && this.data.telegramBotChat && this.data.telegramBotChat._id) {
      this.edit = true;
      this.telegramBotChat = cloneDeep(this.data.telegramBotChat);

      this.addEditChatsDialogForm.controls.chatId.setValue(this.telegramBotChat.chatId);
      this.addEditChatsDialogForm.controls.description.setValue(this.telegramBotChat.description);
    }
  }

  ngAfterViewInit(): void {
    this.addEditChatsDialogForm = this.formsService.touchEmptyControls(this.addEditChatsDialogForm);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onClickSubmit(): void {
    const form: TelegramBotChat = this.addEditChatsDialogForm.value;
    
    this.validateFormValues(form);
    if (this.formErrors && this.formErrors.length > 0) {
      return;
    }
    
    if (!this.edit) {
      this.telegramBotChat = cloneDeep(form);
    } else {
      this.telegramBotChat.chatId = form.chatId;
      this.telegramBotChat.description = form.description ? form.description : '';
    }

    this.dialogRef.close(this.telegramBotChat);
  }
  
  private validateFormValues(form: TelegramBotChat) {
    this.formErrors = [];

    if (!form.chatId) {
      this.formErrors.push({ 
        formControlName: 'chatId', 
        error: this.translateService.getTranslate('label.add-edit-chats.dialog.form.validate.chatId')
      });
    }

    this.addEditChatsDialogForm = this.formsService.setErrors(this.addEditChatsDialogForm, this.formErrors);
  }
}
