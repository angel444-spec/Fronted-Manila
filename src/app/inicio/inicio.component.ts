import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { BebidasService } from '../servicios/bebidas.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent implements OnInit {

  bebidas: any[] = [];

  constructor(
    private bebidasService: BebidasService
  ) {}

  ngOnInit(): void {
    this.cargarBebidas();
  }

  cargarBebidas(): void {
    this.bebidasService.obtenerBebidas().subscribe({
      next: data => {
        this.bebidas = data || [];
      },
      error: error => {
        console.error('Error al cargar bebidas:', error);
      }
    });
  }
}
