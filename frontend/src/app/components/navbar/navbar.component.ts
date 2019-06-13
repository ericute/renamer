import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.less']
})
export class NavbarComponent implements OnInit {

  title: String = "R&IG Mobility Transfer-In Process";

  constructor() { }

  ngOnInit() {
  }

}
