export interface ModalOptions {
  title?: string;
  content?: any;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  centered?: boolean;
  scrollable?: boolean;
  backdrop?: boolean | 'static';
  keyboard?: boolean;
  data?: any;
}
