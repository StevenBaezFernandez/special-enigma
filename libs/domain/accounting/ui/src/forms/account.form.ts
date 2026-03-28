import { FormControl, FormGroup, Validators } from '@angular/forms';

export function createAccountForm() {
  return new FormGroup({
    code: new FormControl('', [Validators.required, Validators.pattern(/^[0-9.]+$/)]),
    name: new FormControl('', [Validators.required]),
    type: new FormControl('asset', [Validators.required]),
    parentId: new FormControl(null),
  });
}
