import type { Regulator } from './regulations';

/**
 * Logo files for each regulator, served from /public/regulators. Run
 * `npm run logos` after adding one: it shrinks every file to a small PNG. Rows for a
 * government ministry use the national coat of arms. A regulator with no entry,
 * or whose file is missing, shows its short code in a plain circle instead.
 */
export const REGULATOR_LOGO: Partial<Record<Regulator, string>> = {
  POTRAZ: '/regulators/potraz.png',
  RBZ: '/regulators/rbz.png',
  FIU: '/regulators/fiu.png',
  SECZ: '/regulators/secz.png',
  IPEC: '/regulators/ipec.png',
  CAAZ: '/regulators/caaz.png',
  NSSA: '/regulators/nssa.png',
  ZIMRA: '/regulators/zimra.png',
  ZIDA: '/regulators/zida.png',
  ZMC: '/regulators/zmc.png',
  IPO: '/regulators/zipo.png',
  EACZ: '/regulators/eacz.png',
  ZTA: '/regulators/zta.png',
  CONSUMER: '/regulators/cpc.png',
  BAZ: '/regulators/baz.png',
  HEALTH: '/regulators/mcaz.png',
  ZERA: '/regulators/zera.png',
  EDU: '/regulators/zimche.png',
  PRAZ: '/regulators/praz.png',
  TRANSPORT: '/regulators/coat-of-arms.png',
  LABOUR: '/regulators/coat-of-arms.png',
  REGISTRAR: '/regulators/coat-of-arms.png',
  AGRI: '/regulators/coat-of-arms.png',
  ICT: '/regulators/coat-of-arms.png',
};

/** Text for the plain circle when there is no logo. */
export const REGULATOR_MONOGRAM: Partial<Record<Regulator, string>> = {
  CONSUMER: 'CPC',
  IPO: 'IP',
  ZMC: 'ZMC',
  BANKS: 'BANK',
};
