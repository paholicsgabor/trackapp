import { Component, OnInit, OnDestroy } from '@angular/core';
import { Race } from '../race';
import { Racemode } from '../racemode.enum';

import { interval } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

@Component({
  selector: 'home-page',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {

  ngOnInit() {
    this.race = new Race();
    this.elapsed = '00:00';
    this.refresh = true;
    interval(999).pipe(takeWhile(() => this.refresh)).subscribe(() => this.refreshelapsed());
  }

  ngOnDestroy() {
    this.refresh = false;
  }

  race: Race = new Race();
  elapsed: string = '00:00';
  refresh: boolean = true;

  get mode(): string {
    return Racemode[this.race.mode];
  }

  refreshelapsed() {
    let now = new Date();
    let firstpass = this.race.start ? this.race.start : now;
    let elapsed = Math.round((now.getTime() - firstpass.getTime()) / 1000);
    let min = Math.floor(elapsed / 60);
    let sec = elapsed % 60;
    this.elapsed = ((min < 10) ? '0' : '') + min + ":" + ((sec < 10) ? '0' : '') + sec;
  }

  pass(tran: string) {
    this.race.passing(tran, new Date());
  }

  newRace() {
    this.race = new Race();
  }

}
