import { Component, computed, inject, signal, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { FirebaseService } from '../../services/firebase.service';


export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  return password && confirmPassword && password.value !== confirmPassword.value ? { passwordMismatch: true } : null;
};

@Component({
  selector: 'app-auth-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth-modal.html',
  styleUrl: './auth-modal.css',
})

export class AuthModal {

  private firebaseServiceAuth = inject(FirebaseService);
  authMode = signal<'login' | 'signup'>('login');
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  authForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl(''),
    name: new FormControl('')
  }, { validators: (group) => this.authMode() === 'signup' ? passwordMatchValidator(group) : null });

  showModal = computed(() => {
    return this.firebaseServiceAuth.showAuthModal();
  });


  async submitAuth() {
    if (this.authForm.invalid) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.authForm.value;

    try {
      if (this.authMode() === 'login') {
        await this.firebaseServiceAuth.signIn(email!, password!);
      } else {
        await this.firebaseServiceAuth.signUp(email!, password!);
      }
      this.closeAuthModal();
    } catch (err: any) {
      this.errorMessage.set(err.message);
    } finally {
      this.isLoading.set(false);
    }
  }

  async signInWithGoogle() {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      await this.firebaseServiceAuth.loginWithGoogle();
      this.closeAuthModal();
    } catch (err: any) {
      this.errorMessage.set(err.message || 'Google Auth Error');
    } finally {
      this.isLoading.set(false);
    }
  }

  
  async handleForgotPassword() {
    const email = this.authForm.get('email')?.value;
    if (!email) return;
    await this.firebaseServiceAuth.resetPassword(email);
  }

  closeAuthModal() {
    this.firebaseServiceAuth.closeAuth();
    this.authForm.reset();

  }

  toggleAuthMode() { 
    this.authMode.set(this.authMode() === 'login' ? 'signup' : 'login'); 
    this.errorMessage.set(null);
  }
}
