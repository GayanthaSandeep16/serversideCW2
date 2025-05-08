import { FC } from 'react';

interface RegisterModalProps {
  show: boolean;
  onHide: () => void;
}

declare const RegisterModal: FC<RegisterModalProps>;
export default RegisterModal; 