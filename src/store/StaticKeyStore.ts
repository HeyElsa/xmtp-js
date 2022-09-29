import {
  DecodePrivateKeyBundle,
  PrivateKeyBundleV1,
} from '../crypto/PrivateKeyBundle'
import { KeyStore } from './KeyStore'

export default class StaticKeyStore implements KeyStore {
  private value: Uint8Array
  constructor(value: Uint8Array) {
    this.value = value
  }

  async loadPrivateKeyBundle(): Promise<PrivateKeyBundleV1> {
    return DecodePrivateKeyBundle(this.value) as PrivateKeyBundleV1
  }

  async storePrivateKeyBundle(): Promise<void> {
    throw new Error('Store is not possible with StaticStore')
  }
}
