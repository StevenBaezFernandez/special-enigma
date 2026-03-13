import { GridsterItem } from 'angular-gridster2';

export interface DashboardWidget extends Partial<GridsterItem> {
  componentType: string;
  id: string;
  name: string;
  data?: any;
  chartType?: any;
  [key: string]: any;
}
