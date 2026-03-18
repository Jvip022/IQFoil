import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  getUnreadCount: any;
  fetchLatest: any;

  constructor() { }
}
