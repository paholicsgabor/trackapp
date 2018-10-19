import { Race } from './race';
import { Observable } from 'rxjs';
import { LocalRace } from './localrace';



describe('Race', () => {

  let race: Race;
  beforeEach(() => {
    race = new LocalRace();
  })

  it('should create an instance', () => {
    expect(race).toBeDefined();
  });

  it('should handle passings', () => {
    expect(race.passing).toBeDefined();
  });

  it('should store results', () => {
    expect(race.results instanceof Observable).toBeTruthy();
  });

  it('should store race mode', () => {
    expect(race.mode instanceof Observable).toBeTruthy();
  });

  it('should toggle race mode', () => {
    let racemode:string;
    race.mode.subscribe(res=>racemode=res);
    let racemode2 = racemode;
    race.togglemode();    
    expect(racemode).not.toBe(racemode2);
  });
  
  it('should store the start of race', ()=> {
    expect(race.start instanceof Observable).toBeTruthy();
  });  

  it('should update start of race on transponder passing', () => {
    let transponder = '1';
    let time = new Date(2018, 10, 15, 11, 34, 0, 0);
    race.passing(transponder, time);
    race.start.subscribe(res=>expect(res).toBe(time));
  });

  it('should update results on first passing', () => {
    let transponder = '1';
    let time = new Date;
    race.passing(transponder, time);    
    let results = [{
      transponder: transponder,
      laps: 0,
      total: "00.000",
      best: "",
      last: ""
    }];
    race.results.subscribe(res=>expect(res).toEqual(results));  
  });

  it('should update results on second passing', () => {
    let transponder = '1';
    let time = new Date(2018, 10, 15, 11, 34, 0, 0);
    race.passing(transponder, time);
    time = new Date(2018, 10, 15, 11, 34, 12, 535);
    race.passing(transponder, time);
    let results = [{
      transponder: transponder,
      laps: 1,
      total: "12.535",
      best: "12.535",
      last: "12.535"
    }];
    race.results.subscribe(res=>expect(res).toEqual(results)); 
  })

  it('should update results on different transponder passing', () => {

    //while (race.mode. == Racemode.Race) { race.togglemode(); }

    race.passing('1', new Date(2018, 10, 15, 11, 34, 0, 0));
    race.passing('2', new Date(2018, 10, 15, 11, 34, 0, 500));
    race.passing('2', new Date(2018, 10, 15, 11, 34, 12, 635));
    race.passing('1', new Date(2018, 10, 15, 11, 34, 12, 535));

    let results = [{
      transponder: '2',
      laps: 1,
      total: "12.635",
      best: "12.135",
      last: "12.135"
    }, {
      transponder: '1',
      laps: 1,
      total: "12.535",
      best: "12.535",
      last: "12.535"
    }];
    race.results.subscribe(res=>expect(res).toEqual(results));
  });

  it('should update results on toggle mode', () => {

    //while (race.mode == Racemode.Race) { race.togglemode(); }

    race.passing('1', new Date(2018, 10, 15, 11, 34, 0, 0));
    race.passing('2', new Date(2018, 10, 15, 11, 34, 0, 500));
    race.passing('2', new Date(2018, 10, 15, 11, 34, 12, 635));
    race.passing('1', new Date(2018, 10, 15, 11, 34, 12, 535));

    //while (race.mode == Racemode.Qualify) { race.togglemode(); }
    race.togglemode();
    let results = [{
      transponder: '1',
      laps: 1,
      total: "12.535",
      best: "12.535",
      last: "12.535"
    }, {
      transponder: '2',
      laps: 1,
      total: "12.635",
      best: "12.135",
      last: "12.135"
    }];
    race.results.subscribe(res=>expect(res).toEqual(results));
  });


});
