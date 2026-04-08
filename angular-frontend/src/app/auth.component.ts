import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

interface SignupForm {
  fullName: string;
  email: string;
  password: string;
  mobile: string;
}

interface LoginForm {
  email: string;
  password: string;
}

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})
export class AuthComponent {
  isSignupMode = true;
  popupMessage = '';
  popupVisible = false;

  signupForm: SignupForm = {
    fullName: '',
    email: '',
    password: '',
    mobile: '',
  };

  loginForm: LoginForm = {
    email: '',
    password: '',
  };

  signupErrors: Record<keyof SignupForm, string> = {
    fullName: '',
    email: '',
    password: '',
    mobile: '',
  };

  loginErrors: Record<keyof LoginForm, string> = {
    email: '',
    password: '',
  };

  constructor(private router: Router, private authService: AuthService) {}

  toggleMode(signup: boolean) {
    this.isSignupMode = signup;
    this.resetErrors();
    this.closePopup();
  }

  isValidEmail(email: string) {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  }

  isValidMobile(mobile: string) {
    return /^[0-9]{10}$/.test(mobile);
  }

  resetErrors() {
    Object.keys(this.signupErrors).forEach((k) => (this.signupErrors[k as keyof SignupForm] = ''));
    Object.keys(this.loginErrors).forEach((k) => (this.loginErrors[k as keyof LoginForm] = ''));
  }

  validateSignupForm() {
    let valid = true;

    if (!this.signupForm.fullName.trim()) {
      this.signupErrors.fullName = 'Full Name is required';
      valid = false;
    } else {
      this.signupErrors.fullName = '';
    }

    if (!this.signupForm.email.trim()) {
      this.signupErrors.email = 'Email is required';
      valid = false;
    } else if (!this.isValidEmail(this.signupForm.email.trim())) {
      this.signupErrors.email = 'Enter a valid email';
      valid = false;
    } else {
      this.signupErrors.email = '';
    }

    if (!this.signupForm.password.trim()) {
      this.signupErrors.password = 'Password is required';
      valid = false;
    } else if (this.signupForm.password.trim().length < 6) {
      this.signupErrors.password = 'Password must be at least 6 characters';
      valid = false;
    } else {
      this.signupErrors.password = '';
    }

    if (!this.signupForm.mobile.trim()) {
      this.signupErrors.mobile = 'Mobile Number is required';
      valid = false;
    } else if (!this.isValidMobile(this.signupForm.mobile.trim())) {
      this.signupErrors.mobile = 'Mobile number must be 10 digits';
      valid = false;
    } else {
      this.signupErrors.mobile = '';
    }

    return valid;
  }

  validateLoginForm() {
    let valid = true;

    if (!this.loginForm.email.trim()) {
      this.loginErrors.email = 'Email is required';
      valid = false;
    } else if (!this.isValidEmail(this.loginForm.email.trim())) {
      this.loginErrors.email = 'Enter a valid email';
      valid = false;
    } else {
      this.loginErrors.email = '';
    }

    if (!this.loginForm.password.trim()) {
      this.loginErrors.password = 'Password is required';
      valid = false;
    } else {
      this.loginErrors.password = '';
    }

    return valid;
  }

  showPopup(message: string) {
    this.popupMessage = message;
    this.popupVisible = true;
  }

  closePopup() {
    this.popupVisible = false;
  }

  handleSignup() {
    if (!this.validateSignupForm()) {
      this.showPopup('Please complete all required fields correctly 😣');
      return;
    }

    const signupRequest = {
      fullName: this.signupForm.fullName.trim(),
      name: this.signupForm.fullName.trim(),
      email: this.signupForm.email.trim(),
      password: this.signupForm.password.trim(),
      mobile: this.signupForm.mobile.trim(),
    };

    this.authService.signup(signupRequest).subscribe({
      next: (message) => {
        this.showPopup(message || 'Signup successful! Please login now 🦋');
        this.signupForm = { fullName: '', email: '', password: '', mobile: '' };
        this.resetErrors();
        setTimeout(() => {
          this.closePopup();
          this.toggleMode(false);
        }, 1500);
      },
      error: (error) => {
        const message = error?.error || error?.message || 'Signup failed. Please try again.';
        this.showPopup(message);
      }
    });
  }

  handleLogin() {
    if (!this.validateLoginForm()) {
      this.showPopup('Please complete login details correctly 😣');
      return;
    }

    const loginRequest = {
      email: this.loginForm.email.trim(),
      password: this.loginForm.password.trim(),
    };

    this.authService.login(loginRequest).subscribe({
      next: (message) => {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('qm_session', JSON.stringify({ email: loginRequest.email }));
        }
        this.showPopup(message || 'Logged in successfully! 🦋');
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1000);
      },
      error: (error) => {
        const message = error?.error || error?.message || 'Login failed. Please check your credentials.';
        this.showPopup(message);
      }
    });
  }

  loginWithGoogle() {
    if (typeof window !== 'undefined') {
      window.location.href = '/oauth2/authorization/google';
    }
  }

  togglePassword(field: 'signupPassword' | 'loginPassword') {
    const fieldInput = document.getElementById(field) as HTMLInputElement | null;
    if (!fieldInput) return;
    fieldInput.type = fieldInput.type === 'password' ? 'text' : 'password';
  }
}
