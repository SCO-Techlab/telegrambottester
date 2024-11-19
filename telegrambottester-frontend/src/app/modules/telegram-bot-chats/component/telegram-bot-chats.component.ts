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
import { TelegramBotChatsState } from '../store/telegram-bot-chats.state';
import { TelegramBotChat } from '../model/telegram-bot-chat';
import { AddTelegramBotChat, DeleteTelegramBotChat, FetchTelegramBotChats, SubscribeTelegramBotChatsWS, UnSubscribeTelegramBotChatsWS, UpdateTelegramBotChat } from '../store/telegram-bot-chats.actions';
import { AddEditChatsDialogoData } from 'src/app/shared/dialogs/add-edit-chats-dialog/model/add-edit-chats-dialog-data';
import { AddEditChatsDialogComponent } from 'src/app/shared/dialogs/add-edit-chats-dialog/add-edit-chats-dialog.component';
import { AddEditChatsDialogConstants } from 'src/app/shared/dialogs/add-edit-chats-dialog/constants/add-edit-chats-dialog.constants';

@Component({
  selector: 'app-telegram-bot-chats',
  templateUrl: './telegram-bot-chats.component.html',
  styleUrls: ['./telegram-bot-chats.component.scss']
})
export class TelegramBotChatsComponent implements OnInit, AfterViewInit, OnDestroy {

  private subManager: Subscription;
  @Select(TelegramBotChatsState.telegramBotChats) telegramBotChats$: Observable<TelegramBotChat[]>;
  @Select(TelegramBotChatsState.notifyChangeTelegramBotChats) notifyChangeTelegramBotChats$: Observable<boolean>;

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
      "chatId",
      "description",
      "createdAt",
      "updatedAt",
      "actions",
    ];
    this.labelsColumns = {
      chatId: this.translateService.getTranslate('label.telegram-bot.chats.component.cols.chatId'),
      description: this.translateService.getTranslate('label.telegram-bot.chats.component.cols.description'),
      createdAt: this.translateService.getTranslate('label.telegram-bot.chats.component.cols.date'),
      updatedAt: this.translateService.getTranslate('label.telegram-bot.chats.component.cols.updatedDate'),
    };
    this.dataSource = new MatTableDataSource<TelegramBotChat>();

    this.notifyChangeTelegramBotChats();
    this.fetchTelegramBotResults();
  }       

  ngAfterViewInit() {
    this.paginator._intl.itemsPerPageLabel = this.translateService.getTranslate('label.elements.per.page');
    this.paginator._intl.getRangeLabel = this.tableService.changePaginatorOfLabel();
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    this.subManager.unsubscribe();
    this.store.dispatch(new UnSubscribeTelegramBotChatsWS());
  }

  /* Store Functions */
  notifyChangeTelegramBotChats() {
    this.store.dispatch(new SubscribeTelegramBotChatsWS());
    this.subManager.add(
      this.notifyChangeTelegramBotChats$.subscribe({
        next: () => {
          this.store.dispatch(new FetchTelegramBotChats({ filter: { user: this.loggedUser.name } }))
        }
      })
    );
  }

  fetchTelegramBotResults() {
    this.spinnerService.showSpinner();
    this.subManager.add(
      this.telegramBotChats$.subscribe({
        next: () => {
          this.dataSource.data = [];
          const storeTelegramBotChats: TelegramBotChat[] = this.store.selectSnapshot(TelegramBotChatsState.telegramBotChats);

          if (storeTelegramBotChats && storeTelegramBotChats.length > 0) {
            this.dataSource.data = cloneDeep(storeTelegramBotChats);
          }

          this.spinnerService.hideSpinner(); 
        },
        error: () => {
          this.spinnerService.hideSpinner();
        },
      })
    );
  }

  deleteTelegramChat(data: TelegramBotChat) {
    this.spinnerService.showSpinner();
    this.store.dispatch(new DeleteTelegramBotChat({ _id: data._id })).subscribe({
      next: () => {
        this.spinnerService.hideSpinner();

        const success: boolean = this.store.selectSnapshot(TelegramBotChatsState.success);
        if (!success) {
          this.toastService.addErrorMessage(this.store.selectSnapshot(TelegramBotChatsState.errorMsg));
          return;
        }
        
        this.toastService.addSuccessMessage(this.store.selectSnapshot(TelegramBotChatsState.successMsg));
      },
      error: () => {
        this.spinnerService.hideSpinner();
        this.toastService.addErrorMessage(this.store.selectSnapshot(TelegramBotChatsState.errorMsg));
      }
    })
  }

  createTelegramBotChat(data: TelegramBotChat) {
    this.spinnerService.showSpinner();

    data.user = this.loggedUser;

    this.store.dispatch(new AddTelegramBotChat({ telegramBotChat: data })).subscribe({
      next: () => {
        this.spinnerService.hideSpinner();

        const success: boolean = this.store.selectSnapshot(TelegramBotChatsState.success);
        if (!success) {
          this.toastService.addErrorMessage(this.store.selectSnapshot(TelegramBotChatsState.errorMsg));
          return;
        }
        
        this.toastService.addSuccessMessage(this.store.selectSnapshot(TelegramBotChatsState.successMsg));
      },
      error: () => {
        this.spinnerService.hideSpinner();
        this.toastService.addErrorMessage(this.store.selectSnapshot(TelegramBotChatsState.errorMsg));
      }
    })
  }

  updateTelegramBotChat(data: TelegramBotChat) {
    this.spinnerService.showSpinner();

    if (!data.user) data.user = this.loggedUser;
    this.store.dispatch(new UpdateTelegramBotChat({ _id: data._id, telegramBotChat: data })).subscribe({
      next: () => {
        this.spinnerService.hideSpinner();

        const success: boolean = this.store.selectSnapshot(TelegramBotChatsState.success);
        if (!success) {
          this.toastService.addErrorMessage(this.store.selectSnapshot(TelegramBotChatsState.errorMsg));
          return;
        }
        
        this.toastService.addSuccessMessage(this.store.selectSnapshot(TelegramBotChatsState.successMsg));
      },
      error: () => {
        this.spinnerService.hideSpinner();
        this.toastService.addErrorMessage(this.store.selectSnapshot(TelegramBotChatsState.errorMsg));
      }
    })
  }

  /* Table Functions */
  onDeleteElement(data: TelegramBotChat) {
    const dialogData: ConfirmDialogData = {
      title: this.translateService.getTranslate('label.telegram-bot.chats.component.confirm-dialog.title'),
      text: this.translateService.getTranslate('label.telegram-bot.chats.component.confirm-dialog.text'),
    }

    const dialogRef = this.dialogService.open(ConfirmDialogComponent, {
      width: this.resolutionService.getMode() == this.resolutionService.resolutionConstants.MOBILE 
        ? ConfirmDialogConstants.MOBILE_WIDTH 
        : ConfirmDialogConstants.WEB_WIDTH,
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      this.deleteTelegramChat(data);
    });
  }

  onAddElement(data: TelegramBotChat) {
    const dialogData: AddEditChatsDialogoData = {
      title: this.translateService.getTranslate('label.telegram-bot.chats.component.add-edit-chats-dialog.title.add'),
    }

    const dialogRef = this.dialogService.open(AddEditChatsDialogComponent, {
      width: this.resolutionService.getMode() == this.resolutionService.resolutionConstants.MOBILE 
        ? AddEditChatsDialogConstants.MOBILE_WIDTH 
        : AddEditChatsDialogConstants.WEB_WIDTH,
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe((result: TelegramBotChat) => {
      if (!result) return;
      this.createTelegramBotChat(result);
    });
  }

  onEditElement(data: TelegramBotChat) {  
    if (!data) return;

    const dialogData: AddEditChatsDialogoData = {
      title: this.translateService.getTranslate('label.telegram-bot.chats.component.add-edit-chats-dialog.title.update'),
      telegramBotChat: data,
    }

    const dialogRef = this.dialogService.open(AddEditChatsDialogComponent, {
      width: this.resolutionService.getMode() == this.resolutionService.resolutionConstants.MOBILE 
        ? AddEditChatsDialogConstants.MOBILE_WIDTH 
        : AddEditChatsDialogConstants.WEB_WIDTH,
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe((result: TelegramBotChat) => {
      if (!result) return;
      this.updateTelegramBotChat(result);
    });
  }
}
