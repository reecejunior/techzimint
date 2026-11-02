import type { Regulator } from './regulations';

/**
 * Logo files for each regulator, served from /public/regulators. Rows for a
 * government ministry use the national coat of arms. A regulator with no entry,
 * or whose file is missing, shows its short code in a plain circle instead.
 */
export const REGULATOR_LOGO: Partial<Record<Regulator, string>> = {
  POTRAZ: '/regulators/potraz.png',
  RBZ: '/regulators/rbz.gif',
  FIU: '/regulators/fiu.png',
  SECZ: '/regulators/secz.png',
  IPEC: '/regulators/ipec.png',
  CAAZ: '/regulators/caaz.png',
  NSSA: '/regulators/nssa.png',
  BAZ: '/regulators/baz.png',
  HEALTH: '/regulators/mcaz.png',
  ZERA: '/regulators/zera.png',
  EDU: '/regulators/zimche.png',
  TRANSPORT: '/regulators/coat-of-arms.svg',
  LABOUR: '/regulators/coat-of-arms.svg',
  REGISTRAR: '/regulators/coat-of-arms.svg',
  AGRI: '/regulators/coat-of-arms.svg',
  ICT: '/regulators/coat-of-arms.svg',
};

/** Text for the plain circle when there is no logo. */
export const REGULATOR_MONOGRAM: Partial<Record<Regulator, string>> = {
  CONSUMER: 'CPC',
  ZIMRA: 'ZRA',
  IPO: 'IP',
  ZMC: 'ZMC',
};
