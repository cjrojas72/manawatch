import { Component, OnInit, inject, effect } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { FirebaseService } from './services/firebase.service';
import { AuthModal } from './auth/auth-modal/auth-modal';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AuthModal],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {


  private router = inject(Router);
}
