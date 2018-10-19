import { Result } from './result'
import { Observable } from 'rxjs';

/**
 * Race results data and calculation
 */
export abstract class Race {

    /**
     * Race mode: It can be Race or Qualify
     * Qualify: best lap wins
     * Race: most lap wins, with less total time
     */
    abstract get mode(): Observable<string>;

    /**Race start time. 
     * The time of the first passing, or null if there are no passings.
     */
    abstract get start(): Observable<Date>;


    /**
    * Race results, sorted based on race mode
    */
    abstract get results():Observable<Array<Result>>;

    /**
     * Adds new passing to the race and updates the race results
     * @param transponder Transponder number of passing
     * @param time Time of passing
     */
    abstract passing(transponder: string, time: Date);

    /**
     * Toggles race mode Race->Qualify or Qualify->Race
     */
    abstract togglemode();  
    
    protected static ms2str(ms) {
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
