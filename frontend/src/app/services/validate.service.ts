import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ValidateService {

  constructor() { }

  isValidForm(directory, docData) {
    if (!directory || directory == '' || !docData || docData == '') {
      return false;
    } else {
      return true;
    }
  } 

}
