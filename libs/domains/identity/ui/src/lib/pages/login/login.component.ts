import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ButtonComponent, InputComponent } from '@virteex/shared-ui';
import { SessionService } from '@virteex/shared-util-auth';

@Component({
  selector: 'virteex-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ButtonComponent, InputComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private sessionService = inject(SessionService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginForm: FormGroup;
  mfaForm: FormGroup;
  loading = false;
  errorMsg = '';
  lang = 'es';
  country = 'CO';

  mfaRequired = false;
  tempToken = '';

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      rememberMe: [false]
    });

    this.mfaForm = this.fb.group({
        code: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
      this.route.paramMap.subscribe(params => {
          this.lang = params.get('lang') || 'es';
      });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMsg = '';
      const payload = this.loginForm.value;

      this.authService.login(payload).subscribe({
        next: (res) => {
          if (res.mfaRequired && res.tempToken) {
              this.mfaRequired = true;
              this.tempToken = res.tempToken;
              this.loading = false;
          } else {
            this.sessionService.login();
            const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
            this.router.navigate([returnUrl]);
          }
        },
        error: (err) => {
          this.loading = false;
          if (err.status === 403) {
             this.errorMsg = 'Cuenta bloqueada o acceso denegado.';
          } else {
             this.errorMsg = 'Credenciales inválidas o error de conexión.';
          }
        }
      });
    }
  }

  onMfaSubmit() {
      if (this.mfaForm.valid) {
          this.loading = true;
          this.errorMsg = '';
          this.authService.verifyMfa({
              tempToken: this.tempToken,
              code: this.mfaForm.value.code
          }).subscribe({
              next: (res) => {
                  this.sessionService.login();
                  const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
                  this.router.navigate([returnUrl]);
              },
              error: () => {
                  this.loading = false;
                  this.errorMsg = 'Código inválido.';
              }
          });
      }
  }
}
