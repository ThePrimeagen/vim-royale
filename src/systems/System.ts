import {EventData} from '../events';

export default interface System {
    run(data: EventData): void;
};

