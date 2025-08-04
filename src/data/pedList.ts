import peds from './peds.json';

export interface Ped {
  model: string;
  image: string;
}

const pedList: Ped[] = peds;

export default pedList;
