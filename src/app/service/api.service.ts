import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  //private apiUrl = 'http://rickandmortyapi.com/api/character/1,23,9,183'; // URL de json-server

  private apiUrl = 'https://jsonplaceholder.typicode.com';

  constructor(private http: HttpClient) { }



  
  // Ejemplo: Obtener todos los posts
  getPosts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/posts`);
  }

  // Ejemplo: Crear un post
  createPost(post: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/posts`, post);
  }

  
}