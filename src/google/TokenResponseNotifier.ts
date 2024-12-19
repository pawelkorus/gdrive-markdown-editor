import { TokenResponse } from './types'

export type TokenResponseListener = (token: TokenResponse) => void

export class TokenResponseNotifier {
  private listeners: TokenResponseListener[] = []

  public addListener(listener: TokenResponseListener) {
    this.listeners.push(listener)
  }

  public removeListener(listener: TokenResponseListener) {
    this.listeners = this.listeners.filter(l => l !== listener)
  }

  public notify(token: TokenResponse) {
    this.listeners.forEach(l => l(token))
  }
}
