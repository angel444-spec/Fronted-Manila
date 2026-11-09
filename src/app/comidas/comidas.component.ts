import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ComidasService } from '../servicios/comidas.service';
import { PedidosService } from '../servicios/carrito.service';

@Component({
  selector: 'app-comidas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comidas.component.html',
  styleUrl: './comidas.component.css'
})
export class ComidasComponent implements OnInit, OnDestroy {

  comidas: any[] = [];

  nombre = '';
  ingrediente = '';

  cargando = false;
  error = '';
  mensaje = '';

  private temporizador: any;

  constructor(
    private servicio: ComidasService,
    private pedidos: PedidosService
  ) {}

  ngOnInit(): void {
    this.cargarComidas();
  }

  ngOnDestroy(): void {
    clearTimeout(this.temporizador);
  }

  cargarComidas(): void {

    this.cargando = true;
    this.error = '';

    this.servicio.obtenerComidas().subscribe({
      next: data => {
        this.comidas = data;
        this.cargando = false;
      },
      error: error => {
        console.error('Error al cargar comidas:', error);
        this.comidas = [];
        this.error = 'No se pudieron cargar las comidas.';
        this.cargando = false;
      }
    });
  }

  buscarNombre(): void {

    if (!this.nombre.trim()) {
      this.cargarComidas();
      return;
    }

    this.cargando = true;
    this.error = '';

    this.servicio.buscarNombre(this.nombre).subscribe({
      next: data => {
        this.comidas = data;
        this.cargando = false;
      },
      error: error => {
        console.error('Error al buscar comida:', error);
        this.comidas = [];
        this.error = 'No se pudo realizar la búsqueda.';
        this.cargando = false;
      }
    });
  }

  buscarIngrediente(): void {

    if (!this.ingrediente.trim()) {
      this.cargarComidas();
      return;
    }

    this.cargando = true;
    this.error = '';

    this.servicio.buscarIngrediente(this.ingrediente).subscribe({
      next: data => {
        this.comidas = data;
        this.cargando = false;
      },
      error: error => {
        console.error('Error al buscar ingrediente:', error);
        this.comidas = [];
        this.error = 'No se pudo buscar ese ingrediente.';
        this.cargando = false;
      }
    });
  }

  filtrar(categoria: string): void {

    this.cargando = true;
    this.error = '';

    this.servicio.buscarCategoria(categoria).subscribe({
      next: data => {
        this.comidas = data;
        this.cargando = false;
      },
      error: error => {
        console.error('Error al filtrar comidas:', error);
        this.comidas = [];
        this.error = 'No se pudo aplicar el filtro.';
        this.cargando = false;
      }
    });
  }

  agregar(comida: any): void {

    this.pedidos.agregar({
      id: comida.idMeal,
      nombre: comida.strMeal,
      imagen: comida.strMealThumb,
      tipo: 'Comida',
      precio: comida.precio,
      cantidad: 1
    });

    this.mostrarMensaje(
      `${comida.strMeal} se agregó a tu pedido.`
    );
  }

  mostrarMensaje(texto: string): void {

    this.mensaje = texto;

    clearTimeout(this.temporizador);

    this.temporizador = setTimeout(() => {
      this.mensaje = '';
    }, 3000);
  }

}
