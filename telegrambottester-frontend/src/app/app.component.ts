import { Component, HostListener, OnInit } from "@angular/core";
import { WebSocketService } from "./websocket/websocket.service";
import { SpinnerService } from "./shared/spinner/spinner.service";
import { ResolutionService } from './shared/resolution/resolution.service';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { AuthState } from './modules/auth/store/auth.state';
import { Observable } from 'rxjs';
import { User } from './modules/users/model/user';
import { LogOut } from './modules/auth/store/auth.actions';
import { ToastService } from './shared/toast/toast.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  
  public viewMode: string;

  @Select(AuthState.loggedUser) loggedUser$: Observable<User>;
  public loggedUser: User;

  constructor(
    private readonly websocketsService: WebSocketService,
    public readonly spinnerService: SpinnerService,
    public readonly resolutionService: ResolutionService,
    public readonly router: Router,
    private readonly store: Store,
    private readonly toatService: ToastService,
  ) {
    this.viewMode = this.resolutionService.getMode();

    this.websocketsService.connect();
  }

  ngOnInit(): void {
    this.loggedUser$.subscribe((loggedUser: User) => {
      this.loggedUser = undefined;
      if (loggedUser && loggedUser._id) {
        this.loggedUser = loggedUser;
      }
    });
  }

  onClickHomeLogo() {
    this.router.navigateByUrl('');
  }

  onClickSignUp() {
    this.router.navigateByUrl('signup');
  }

  onClickLogIn() {
    this.router.navigateByUrl('login');
  }

  onClickLogOut() {
    if (!this.loggedUser) return;

    this.spinnerService.showSpinner();
    this.store.dispatch(new LogOut()).subscribe({
      next: () => {
        this.spinnerService.hideSpinner();
        this.toatService.addSuccessMessage(this.store.selectSnapshot(AuthState.successMsg));
        this.router.navigateByUrl('login');
      },
    })
  }

  @HostListener('window:resize', ['$event'])
  onResize($event) {
    this.viewMode = this.resolutionService.getMode($event.target.innerWidth);
  }
}
