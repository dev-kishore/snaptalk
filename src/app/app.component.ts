import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Socket, io } from 'socket.io-client';
import { values } from '../environment/environment';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'snaptalk';

  socket: Socket;

  connectedId: string;

  messages: any[] = [];

  message: string = '';

  isTyping: boolean = false;

  constructor() {
    this.socket = io(values.baseUrl);
    this.socket.on('message', (message: string) => {
      this.messages.push({ isReceived: true, message: message });
      window.scrollTo(0, document.body.scrollHeight);
    })
    this.socket.on('user-connected', (socketId) => {
      this.connectedId = socketId;
      this.messages.push({ isReceived: false, message: 'User connected', isMessage: true });
    })
    this.socket.on('user-disconnected', () => {
      this.messages.push({ isReceived: false, message: 'User disconnected', isMessage: true });
      this.connectedId = '';
      window.scrollTo(0, document.body.scrollHeight);
    })
    window.addEventListener("beforeunload", () => {
      this.socket.emit("disconnecter", this.connectedId);
    });
    this.socket.on('typing', () => {
      this.isTyping = true;
      window.scrollTo(0, document.body.scrollHeight);
    });
    this.socket.on('stop-typing', () => {
      this.isTyping = false;
      window.scrollTo(0, document.body.scrollHeight);
    })
  }

  sendMessage() {
    if(this.message.trim() === '') return;
    window.scrollTo(0, document.body.scrollHeight);
    this.socket.emit('message', this.message, this.connectedId);
    this.messages.push({ isReceived: false, message: this.message });
    this.socket.emit('stop-typing', this.connectedId);
    this.message = '';
  }

  emitTyping() {
    if(this.message.trim() === '') {
      this.socket.emit('stop-typing', this.connectedId);
    } else {
      this.socket.emit('typing', this.connectedId);
    }
  }

}
