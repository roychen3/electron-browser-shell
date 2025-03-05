import { useAuth as useAuthWithDefault } from './useAuthWithDefault';
import { useAuth as useAuthWithElectron } from './useAuthWithElectron';

export const useAuth = window.electronAPI
  ? useAuthWithElectron
  : useAuthWithDefault;
