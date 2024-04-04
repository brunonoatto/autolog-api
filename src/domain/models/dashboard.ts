import type { TBudget } from './budget';
import { TCar } from './car';

export type TDashboardItem = Pick<TBudget, 'os' | 'status' | 'observation'> &
  Pick<TCar, 'license' | 'brand' | 'model' | 'year'> & {
    clientName: string;
  };
