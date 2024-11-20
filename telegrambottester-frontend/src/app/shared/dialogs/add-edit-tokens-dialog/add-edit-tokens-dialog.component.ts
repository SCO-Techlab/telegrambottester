import { cloneDeep } from 'lodash-es';
import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FormsError } from '../../forms/forms-errors.model';
import { ResolutionService } from '../../resolution/resolution.service';
import { TranslateService } from '../../translate/translate.service';
import { FormsService } from '../../forms/forms.service';
import { TelegramBotToken } from 'src/app/modules/telegram-bot-tokens/model/telegram-bot-token';
import { AddEditTokensDialogoData } from './model/add-edit-tokens-dialog-data';

@Component({
  selector: 'app-add-edit-tokens-dialog',
  templateUrl: './add-edit-tokens-dialog.component.html',
  styleUrls: ['./add-edit-tokens-dialog.component.scss']
})
export class AddEditTokensDialogComponent implements OnInit, AfterViewInit {

  public edit: boolean;
  public telegramBotToken: TelegramBotToken;

  public addEditTokensDialogForm: FormGroup;
  public formErrors: FormsError[];

  constructor(
    public readonly dialogRef: MatDialogRef<AddEditTokensDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddEditTokensDialogoData,
    public readonly resolutionService: ResolutionService,
    private readonly translateService: TranslateService,
    public readonly formsService: FormsService,
  ) {}

  ngOnInit(): void {
    this.edit = false;
    this.telegramBotToken = new TelegramBotToken();

    this.addEditTokensDialogForm = new FormGroup({
      token: new FormControl('', [Validators.required]),
      description: new FormControl(''),
    });

    this.formErrors = [];

    if (this.data && this.data.telegramBotToken && this.data.telegramBotToken._id) {
      this.edit = true;
      this.telegramBotToken = cloneDeep(this.data.telegramBotToken);

      this.addEditTokensDialogForm.controls.token.setValue(this.telegramBotToken.token);
      this.addEditTokensDialogForm.controls.description.setValue(this.telegramBotToken.description);
    }
  }

  ngAfterViewInit(): void {
    this.addEditTokensDialogForm = this.formsService.touchEmptyControls(this.addEditTokensDialogForm);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onClickSubmit(): void {
    const form: TelegramBotToken = this.addEditTokensDialogForm.value;
    
    this.validateFormValues(form);
    if (this.formErrors && this.formErrors.length > 0) {
      return;
    }
    
    if (!this.edit) {
      this.telegramBotToken = cloneDeep(form);
    } else {
      this.telegramBotToken.token = form.token;
      this.telegramBotToken.description = form.description ? form.description : '';
    }

    this.dialogRef.close(this.telegramBotToken);
  }
  
  private validateFormValues(form: TelegramBotToken) {
    this.formErrors = [];

    if (!form.token) {
      this.formErrors.push({ 
        formControlName: 'token', 
        error: this.translateService.getTranslate('label.add-edit-tokens.dialog.form.validate.token')
      });
    }

    this.addEditTokensDialogForm = this.formsService.setErrors(this.addEditTokensDialogForm, this.formErrors);
  }
}
