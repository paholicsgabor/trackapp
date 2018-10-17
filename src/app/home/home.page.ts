import { Component, OnInit } from '@angular/core';
import { Race } from '../race';

@Component({
  selector: 'home-page',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{

  ngOnInit() {
    
  }
race = new Race();

pass(tran:string) {
  this.race.passing(tran, new Date());
}

}
