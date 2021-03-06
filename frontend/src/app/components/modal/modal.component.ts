import { Component, Input, OnInit } from '@angular/core';
import { NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.less']
})
export class ModalComponent implements OnInit {

  @Input() title = `Information`;
  @Input() message = `Message`;

  constructor(
    public activeModal: NgbActiveModal
  ) { }

  ngOnInit() {
  }

}
