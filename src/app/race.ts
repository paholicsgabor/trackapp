import { Result } from './result'
import { Racemode } from './racemode.enum';

/**
 * Race results data and calculation
 */
export class Race {

    /**
     * Race mode: It can be Race or Qualify
     * Qualify: best lap wins
     * Race: most lap wins, with less total time
     */
    public mode: Racemode = Racemode.Qualify;
    
    /**Race start time. 
     * The time of the first passing, or null if there are no passings.
     */
    public get start():Date {
        return this.firstpass();
    };


    /**
    * Race results, sorted based on race mode
    */
    public results = new Array<Result>();

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
        if (this.mode == Racemode.Qualify) {
            this.mode = Racemode.Race;
        } else {
            this.mode = Racemode.Qualify;
        }
        this.UpdateResults();
    }

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

        let sortFn = this.mode == Racemode.Qualify ? this.sortQualify : this.sortRace;

        let transorted = Object.keys(this.passings).sort(sortFn);
        let fp = this.firstpass();
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
        this.results = results;
    }

    private static ms2str(ms) {
        if (ms < 0) {
            return "";
        }
        let msec = ms;
        let hh = Math.floor(msec / 1000 / 60 / 60);
        msec -= hh * 1000 * 60 * 60;
        let mm = Math.floor(msec / 1000 / 60);
        msec -= mm * 1000 * 60;
        let ss = Math.floor(msec / 1000);
        msec -= ss * 1000;

        let result = "";

        if (hh > 0) {
            result = hh.toString() + ":";
        }
        if (mm > 0 || hh > 0) {
            if (mm < 10) {
                result = result + "0";
            }
            result = result + mm.toString() + ":";
        }
        if (ss < 10) {
            result = result + "0";
        }
        result = result + ss.toString() + ".";
        if (msec < 100) {
            result = result + "0";
        }
        if (msec < 10) {
            result = result + "0";
        }
        result = result + msec.toString();
        return result;

    }
}
