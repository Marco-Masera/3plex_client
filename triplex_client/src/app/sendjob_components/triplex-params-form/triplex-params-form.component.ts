import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-triplex-params-form',
  templateUrl: './triplex-params-form.component.html',
  styleUrls: ['./triplex-params-form.component.css']
})
export class TriplexParamsFormComponent {

  @Input() formGroup: FormGroup = new FormGroup({});
  @Input() default_triplex_params: any = {};
  @Input() sending: boolean = false;

  reset_triplex_params(){
    this.formGroup?.patchValue({
      min_len: null,
      max_len: null,
      error_rate: null,
      guanine_rate: null,
      filter_repeat: this.default_triplex_params?.filter_repeat.default,
      consecutive_errors: null
    });
  }

  get_triplex_params_description(param: string): string{
    if (this.default_triplex_params)
      return this.default_triplex_params[param]?.description || ""
    return ""
  }

  get_triplex_params_default_value(param: string): string{
    let to_ret: any | undefined;
    if (this.default_triplex_params)
      to_ret = this.default_triplex_params[param]?.default
    if (to_ret !== undefined){
      return to_ret
    }
    return ""
  }
  get_triplex_param_l_b(param: string): string{
    return this.default_triplex_params?.[param]?.bounds?.[0] ?? -9999999
  }
  get_triplex_param_h_b(param: string): string{
    return this.default_triplex_params?.[param]?.bounds?.[1] ?? 9999999
  }

}
