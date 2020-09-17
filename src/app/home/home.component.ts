import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  url: string = 'https://milovana.com/webteases/showtease.php?id=40253';

  get jsonUrl(): string {
    let match = this.url.match(/milovana.com\/webteases\/showtease.php\?id=(\d+)/);
    if (match) {
      return `https://milovana.com/webteases/geteosscript.php?id=${match[1]}`;
    }
    return 'Invalid URL';
  }

  constructor(private router: Router) { }

  ngOnInit(): void { }

}
