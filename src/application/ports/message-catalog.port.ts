import { MessageCode } from '../../domain/value-objects/message-code.vo';

export const MESSAGE_CATALOG_PORT = Symbol('MESSAGE_CATALOG_PORT');

export const DEFAULT_LOCALE = 'vi';
export const SUPPORTED_LOCALES = ['vi', 'en'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export interface MessageCatalogPort {
  /**
   * Returns the interpolated message for `code`. Resolution order:
   * requested `locale` -> `DEFAULT_LOCALE` -> the raw `code` itself
   * (so a missing translation never crashes the response).
   */
  getMessage(code: MessageCode | string, locale?: string, params?: Record<string, string | number>): string;
}
