import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AccountType } from '@virteex/domain-accounting-contracts';

export function createAccountForm() {
  return new FormGroup({
    code: new FormControl('', [Validators.required, Validators.pattern(/^[0-9.]+$/)]),
    name: new FormControl('', [Validators.required]),
    type: new FormControl(AccountType.ASSET, [Validators.required]),
    parentId: new FormControl(null),
  });
}
