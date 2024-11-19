import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { NgxsModule } from '@ngxs/store';
import { TelegramBotChatsService } from './telegram-bot-chats.service';
import { TelegramBotChatsComponent } from './component/telegram-bot-chats.component';
import { JoinPipe } from 'src/app/shared/join/join.pipe';
import { TelegramBotChatsState } from './store/telegram-bot-chats.state';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialogModule } from '@angular/material/dialog';

export function throwIfAlreadyLoaded(parentModule: any, moduleName: string) {
  if (parentModule) {
    throw new Error(`${moduleName} has already been loaded. Import ${moduleName} modules in the AppModule only.`);
  }
}

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    BrowserAnimationsModule,
    SharedModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatDialogModule,
    
    NgxsModule.forFeature(
      [
        TelegramBotChatsState,
      ]
    ),
  ],
  declarations: [
    TelegramBotChatsComponent,
  ],
  exports: [
    TelegramBotChatsComponent,
  ]
})
export class TelegramBotChatsModule { 
  constructor(@Optional() @SkipSelf() parentModule: TelegramBotChatsModule) {
    throwIfAlreadyLoaded(parentModule, 'TelegramBotChatsModule');
  }

  static forRoot(): ModuleWithProviders<TelegramBotChatsModule> {
    return {
      ngModule: TelegramBotChatsModule,
      providers: [
        TelegramBotChatsService,
        JoinPipe,
      ]
    };
  }
}
