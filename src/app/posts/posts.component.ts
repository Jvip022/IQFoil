import { Component, OnInit } from '@angular/core';
import { ApiService } from '../service/api.service';
//import { NgFor } from '@angular/common';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './posts.component.html',
})


  export class PostsComponent implements OnInit {

    posts = [{ title: 'Hola' }, { title: 'Mundo' }];


    data: any[] = [];
  
    constructor(private apiService: ApiService) { }
  
    ngOnInit(): void {
      this.apiService.getPosts().subscribe((pdata) => {
        this.data= pdata;
      });
    }
  }

