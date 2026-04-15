import { inject, Injectable } from '@angular/core';
import { HotToastService } from '@ngxpert/hot-toast';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private toast = inject(HotToastService);

  success(msg: string) {
    this.toast.success(msg, {
      style: {
        background: 'hsl(143, 85%, 96%)',
        borderColor: 'hsl(145, 92%, 87%)',
        color: 'hsl(140, 100%, 27%)',
      },
      iconTheme: {
        primary: 'hsl(140, 100%, 27%)',
        secondary: 'hsl(143, 85%, 96%)',
      },
      icon: '<i class="fa-regular fa-circle-check"></i>',
    });
  }

  info(msg: string) {
    this.toast.info(msg, {
      style: {
        background: 'hsl(208, 100%, 97%)',
        borderColor: 'hsl(221, 91%, 93%)',
        color: 'hsl(210, 92%, 45%)',
      },
      iconTheme: {
        primary: 'hsl(210, 92%, 45%)',
        secondary: 'hsl(208, 100%, 97%)',
      },
      icon: '<i class="fa-solid fa-circle-info"></i>',
    });
  }

  error(msg: string) {
    this.toast.error(msg, {
      style: {
        background: 'hsl(359, 100%, 97%)',
        borderColor: 'hsl(359, 100%, 94%)',
        color: 'hsl(360, 100%, 45%)',
      },
      iconTheme: {
        primary: 'hsl(360, 100%, 45%)',
        secondary: 'hsl(359, 100%, 97%)',
      },
      icon: '<i class="fa-solid fa-circle-info"></i>',
    });
  }
}
