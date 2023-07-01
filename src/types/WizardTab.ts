export interface WizardTabProps {
  title: string;
  icon: string;
  shape?: string;
  color?: string;
  isActive: boolean;
  index?: number;
  ref: any;
  onClick?: () => void;
}
