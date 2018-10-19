import { Race } from './race';
import { Result } from './result'
import { Racemode } from './racemode.enum';
import { Observable, BehaviorSubject } from 'rxjs';

/**
 * Race results data and calculation
 */
export class LocalRace extends Race {

    /**
     * Race mode: It can be Race or Qualify
     * Qualify: best lap wins
     * Race: most lap wins, with less total time
     */
    public get mode(): Observable<string> { return this.mode$ };

    /**Race start time. 
     * The time of the first passing, or null if there are no passings.
     */
    public get start(): Observable<Date> {
        return this._start;
    };


    /**
    * Race results, sorted based on race mode
    */
    public get results(): Observable<Array<Result>> { return this._results };

    /**
     * Adds new passing to the race and updates the race results
     * @param transponder Transponder number of passing
     * @param time Time of passing
     */
    public passing(transponder: string, time: Date) {
        if (!this.passings.hasOwnProperty(transponder)) {
            Object.defineProperty(this.passings, transponder, {
                value: [time],
                writable: true,
                configurable: true,
                enumerable: true
            });
        } else {
            this.passings[transponder].push(time);
        }
        this.UpdateResults();
    }

    /**
     * Toggles race mode Race->Qualify or Qualify->Race
     */
    public togglemode() {
        if (this._mode == Racemode.Qualify) {
            this._mode = Racemode.Race;
        } else {
            this._mode = Racemode.Qualify;
        }
        this.mode$.next(Racemode[this._mode]);
        this.UpdateResults();
    }

    private _mode: Racemode = Racemode.Qualify;
    private mode$ = new BehaviorSubject<string>(Racemode[this._mode]);
    private _start = new BehaviorSubject<Date>(null);
    private _results = new BehaviorSubject(new Array<Result>());

    private passings = new Object();

    private firstpass() {
        let result = null;
        let trans = Object.keys(this.passings);
        for (let i = 0; i < trans.length; i++) {
            if (this.passings[trans[i]].length > 0) {
                if (result === null || result > this.passings[trans[i]][0]) {
                    result = this.passings[trans[i]][0];
                }
            }
        }
        return result;
    }

    private getlast(tran) {
        let length = this.passings[tran].length;
        if (length < 2) {
            return -1;
        } else {
            return this.passings[tran][length - 1] - this.passings[tran][length - 2];
        }
    }

    private getbest(tran) {
        if (this.passings[tran].length < 2) return -1;

        let result = this.passings[tran][1] - this.passings[tran][0];

        for (let i = 2; i < this.passings[tran].length; i++) {
            result = Math.min(result, this.passings[tran][i] - this.passings[tran][i - 1]);
        }

        return result;

    }

    private sortRace = (a, b) => {
        let lapdif = this.passings[b].length - this.passings[a].length;
        if (lapdif === 0)
            return this.passings[a].slice(-1)[0] - this.passings[b].slice(-1)[0];
        return lapdif;
    }

    private sortQualify = (a, b) => {
        let besta = this.getbest(a);
        let bestb = this.getbest(b);

        if (besta === bestb)
            return this.passings[a].slice(-1)[0] - this.passings[b].slice(-1)[0];
        if (besta < 0)
            return 1;
        if (bestb < 0)
            return -1;

        return this.getbest(a) - this.getbest(b);
    }

    private UpdateResults() {

        let sortFn = this._mode == Racemode.Qualify ? this.sortQualify : this.sortRace;

        let transorted = Object.keys(this.passings).sort(sortFn);
        let fp = this.firstpass();
        if (fp != this._start.value) { this._start.next(fp); }
        let results = new Array<Result>();
        for (let i = 0; i < transorted.length; i++) {
            results.push({
                transponder: transorted[i],
                laps: this.passings[transorted[i]].length - 1,
                total: Race.ms2str(this.passings[transorted[i]].slice(-1)[0] - fp),
                best: Race.ms2str(this.getbest(transorted[i])),
                last: Race.ms2str(this.getlast(transorted[i]))

            })

        }
        this._results.next(results);
    }


}
