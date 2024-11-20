import { ResolutionService } from 'src/app/shared/resolution/resolution.service';
import { cloneDeep } from 'lodash-es';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { User } from '../../users/model/user';
import { AuthState } from '../../auth/store/auth.state';
import { SpinnerService } from 'src/app/shared/spinner/spinner.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TableService } from 'src/app/shared/table/table.service';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/shared/dialogs/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogData } from 'src/app/shared/dialogs/confirm-dialog/model/confirm-dialog-data';
import { TranslateService } from 'src/app/shared/translate/translate.service';
import { ConfirmDialogConstants } from 'src/app/shared/dialogs/confirm-dialog/constants/confirm-dialog.constants';
import { AddEditChatsDialogConstants } from 'src/app/shared/dialogs/add-edit-chats-dialog/constants/add-edit-chats-dialog.constants';
import { TelegramBotTokensState } from '../store/telegram-bot-tokens.state';
import { TelegramBotToken } from '../model/telegram-bot-token';
import { AddEditTokensDialogoData } from 'src/app/shared/dialogs/add-edit-tokens-dialog/model/add-edit-tokens-dialog-data';
import { AddEditTokensDialogComponent } from 'src/app/shared/dialogs/add-edit-tokens-dialog/add-edit-tokens-dialog.component';
import { AddTelegramBotToken, DeleteTelegramBotToken, FetchTelegramBotTokens, SubscribeTelegramBotTokensWS, UnSubscribeTelegramBotTokensWS, UpdateTelegramBotToken } from '../store/telegram-bot-tokens.actions';

@Component({
  selector: 'app-telegram-bot-tokens',
  templateUrl: './telegram-bot-tokens.component.html',
  styleUrls: ['./telegram-bot-tokens.component.scss']
})
export class TelegramBotTokensComponent implements OnInit, AfterViewInit, OnDestroy {

  private subManager: Subscription;
  @Select(TelegramBotTokensState.telegramBotTokens) telegramBotTokens$: Observable<TelegramBotToken[]>;
  @Select(TelegramBotTokensState.notifyChangeTelegramBotTokens) notifyChangeTelegramBotTokens$: Observable<boolean>;

  private loggedUser: User;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  public displayedColumns: string[];
  public labelsColumns: any;
  public dataSource: any;

  constructor(
    public readonly dialogService: MatDialog,
    private readonly store: Store,
    private readonly spinnerService: SpinnerService,
    public readonly tableService: TableService,
    private readonly toastService: ToastService,
    private readonly resolutionService: ResolutionService,
    private readonly translateService: TranslateService,
  ) {}

  /* Angular Implements Functions */
  ngOnInit() {
    this.subManager = new Subscription();
    this.loggedUser = this.store.selectSnapshot(AuthState.loggedUser);

    this.displayedColumns  = [
      "token",
      "description",
      "createdAt",
      "updatedAt",
      "actions",
    ];
    this.labelsColumns = {
      token: this.translateService.getTranslate('label.telegram-bot.tokens.component.cols.token'),
      description: this.translateService.getTranslate('label.telegram-bot.tokens.component.cols.description'),
      createdAt: this.translateService.getTranslate('label.telegram-bot.tokens.component.cols.date'),
      updatedAt: this.translateService.getTranslate('label.telegram-bot.tokens.component.cols.updatedDate'),
    };
    this.dataSource = new MatTableDataSource<TelegramBotToken>();

    this.notifyChangeTelegramBotTokens();
    this.fetchTelegramBotTokens();
  }       

  ngAfterViewInit() {
    this.paginator._intl.itemsPerPageLabel = this.translateService.getTranslate('label.elements.per.page');
    this.paginator._intl.getRangeLabel = this.tableService.changePaginatorOfLabel();
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    this.subManager.unsubscribe();
    this.store.dispatch(new UnSubscribeTelegramBotTokensWS());
  }

  /* Store Functions */
  notifyChangeTelegramBotTokens() {
    this.store.dispatch(new SubscribeTelegramBotTokensWS());
    this.subManager.add(
      this.notifyChangeTelegramBotTokens$.subscribe({
        next: () => {
          this.store.dispatch(new FetchTelegramBotTokens({ filter: { user: this.loggedUser.name } }))
        }
      })
    );
  }

  fetchTelegramBotTokens() {
    this.spinnerService.showSpinner();
    this.subManager.add(
      this.telegramBotTokens$.subscribe({
        next: () => {
          this.dataSource.data = [];
          const storeTelegramBotTokens: TelegramBotToken[] = this.store.selectSnapshot(TelegramBotTokensState.telegramBotTokens);

          if (storeTelegramBotTokens && storeTelegramBotTokens.length > 0) {
            this.dataSource.data = cloneDeep(storeTelegramBotTokens);
          }

          this.spinnerService.hideSpinner(); 
        },
        error: () => {
          this.spinnerService.hideSpinner();
        },
      })
    );
  }

  deleteTelegramToken(data: TelegramBotToken) {
    this.spinnerService.showSpinner();
    this.store.dispatch(new DeleteTelegramBotToken({ _id: data._id })).subscribe({
      next: () => {
        this.spinnerService.hideSpinner();

        const success: boolean = this.store.selectSnapshot(TelegramBotTokensState.success);
        if (!success) {
          this.toastService.addErrorMessage(this.store.selectSnapshot(TelegramBotTokensState.errorMsg));
          return;
        }
        
        this.toastService.addSuccessMessage(this.store.selectSnapshot(TelegramBotTokensState.successMsg));
      },
      error: () => {
        this.spinnerService.hideSpinner();
        this.toastService.addErrorMessage(this.store.selectSnapshot(TelegramBotTokensState.errorMsg));
      }
    })
  }

  createTelegramBotToken(data: TelegramBotToken) {
    this.spinnerService.showSpinner();

    data.user = this.loggedUser;

    this.store.dispatch(new AddTelegramBotToken({ telegramBotToken: data })).subscribe({
      next: () => {
        this.spinnerService.hideSpinner();

        const success: boolean = this.store.selectSnapshot(TelegramBotTokensState.success);
        if (!success) {
          this.toastService.addErrorMessage(this.store.selectSnapshot(TelegramBotTokensState.errorMsg));
          return;
        }
        
        this.toastService.addSuccessMessage(this.store.selectSnapshot(TelegramBotTokensState.successMsg));
      },
      error: () => {
        this.spinnerService.hideSpinner();
        this.toastService.addErrorMessage(this.store.selectSnapshot(TelegramBotTokensState.errorMsg));
      }
    })
  }

  updateTelegramBotToken(data: TelegramBotToken) {
    this.spinnerService.showSpinner();

    if (!data.user) data.user = this.loggedUser;
    this.store.dispatch(new UpdateTelegramBotToken({ _id: data._id, telegramBotToken: data })).subscribe({
      next: () => {
        this.spinnerService.hideSpinner();

        const success: boolean = this.store.selectSnapshot(TelegramBotTokensState.success);
        if (!success) {
          this.toastService.addErrorMessage(this.store.selectSnapshot(TelegramBotTokensState.errorMsg));
          return;
        }
        
        this.toastService.addSuccessMessage(this.store.selectSnapshot(TelegramBotTokensState.successMsg));
      },
      error: () => {
        this.spinnerService.hideSpinner();
        this.toastService.addErrorMessage(this.store.selectSnapshot(TelegramBotTokensState.errorMsg));
      }
    })
  }

  /* Table Functions */
  onDeleteElement(data: TelegramBotToken) {
    const dialogData: ConfirmDialogData = {
      title: this.translateService.getTranslate('label.telegram-bot.tokens.component.confirm-dialog.title'),
      text: this.translateService.getTranslate('label.telegram-bot.tokens.component.confirm-dialog.text'),
    }

    const dialogRef = this.dialogService.open(ConfirmDialogComponent, {
      width: this.resolutionService.getMode() == this.resolutionService.resolutionConstants.MOBILE 
        ? ConfirmDialogConstants.MOBILE_WIDTH 
        : ConfirmDialogConstants.WEB_WIDTH,
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      this.deleteTelegramToken(data);
    });
  }

  onAddElement(data: TelegramBotToken) {
    const dialogData: AddEditTokensDialogoData = {
      title: this.translateService.getTranslate('label.telegram-bot.tokens.component.add-edit-tokens-dialog.title.add'),
    }

    const dialogRef = this.dialogService.open(AddEditTokensDialogComponent, {
      width: this.resolutionService.getMode() == this.resolutionService.resolutionConstants.MOBILE 
        ? AddEditChatsDialogConstants.MOBILE_WIDTH 
        : AddEditChatsDialogConstants.WEB_WIDTH,
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe((result: TelegramBotToken) => {
      if (!result) return;
      this.createTelegramBotToken(result);
    });
  }

  onEditElement(data: TelegramBotToken) {  
    if (!data) return;

    const dialogData: AddEditTokensDialogoData = {
      title: this.translateService.getTranslate('label.telegram-bot.tokens.component.add-edit-tokens-dialog.title.update'),
      telegramBotToken: data,
    }

    const dialogRef = this.dialogService.open(AddEditTokensDialogComponent, {
      width: this.resolutionService.getMode() == this.resolutionService.resolutionConstants.MOBILE 
        ? AddEditChatsDialogConstants.MOBILE_WIDTH 
        : AddEditChatsDialogConstants.WEB_WIDTH,
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe((result: TelegramBotToken) => {
      if (!result) return;
      this.updateTelegramBotToken(result);
    });
  }
}
