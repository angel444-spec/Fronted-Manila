import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { BebidasService } from '../servicios/bebidas.service';
import { PedidosService } from '../servicios/carrito.service';

@Component({
  selector: 'app-bebidas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bebidas.component.html',
  styleUrl: './bebidas.component.css'
})
export class BebidasComponent implements OnInit {

  bebidas: any[] = [];

  nombre = '';
  ingrediente = '';
  tipoSeleccionado = 'Non_Alcoholic';

  cargando = false;
  error = '';
  mensaje = '';

  private temporizador: any;

  constructor(
    private servicio: BebidasService,
    private pedidos: PedidosService
  ) {}

  ngOnInit(): void {
    this.cargarBebidas();
  }

  cargarBebidas(): void {
    this.cargando = true;
    this.error = '';

    this.servicio.obtenerBebidas().subscribe({
      next: data => {
        this.bebidas = data;
        this.cargando = false;
      },
      error: error => {
        console.error('Error al cargar bebidas:', error);
        this.bebidas = [];
        this.error = 'No se pudieron cargar las bebidas.';
        this.cargando = false;
      }
    });
  }

  buscarNombre(): void {
    if (!this.nombre.trim()) {
      this.cargarBebidas();
      return;
    }

    this.cargando = true;
    this.error = '';

    this.servicio.buscarNombre(this.nombre).subscribe({
      next: data => {
        this.bebidas = data;
        this.cargando = false;
      },
      error: error => {
        console.error('Error al buscar bebida:', error);
        this.bebidas = [];
        this.error = 'No se pudo realizar la búsqueda.';
        this.cargando = false;
      }
    });
  }

  buscarIngrediente(): void {
    if (!this.ingrediente.trim()) {
      this.cargarBebidas();
      return;
    }

    this.cargando = true;
    this.error = '';

    this.servicio.buscarIngrediente(this.ingrediente).subscribe({
      next: data => {
        this.bebidas = data;
        this.cargando = false;
      },
      error: error => {
        console.error('Error al buscar ingrediente:', error);
        this.bebidas = [];
        this.error = 'No se pudo buscar ese ingrediente.';
        this.cargando = false;
      }
    });
  }

  filtrarCategoria(categoria: string): void {
    this.cargando = true;
    this.error = '';

    this.servicio.buscarCategoria(categoria).subscribe({
      next: data => {
        this.bebidas = data;
        this.cargando = false;
      },
      error: error => {
        console.error('Error al filtrar bebidas:', error);
        this.bebidas = [];
        this.error = 'No se pudo aplicar el filtro.';
        this.cargando = false;
      }
    });
  }

  filtrarTipo(tipo: string): void {
    this.tipoSeleccionado = tipo;

    this.cargando = true;
    this.error = '';

    this.servicio.buscarTipo(tipo).subscribe({
      next: data => {
        this.bebidas = data;
        this.cargando = false;
      },
      error: error => {
        console.error('Error al filtrar tipo:', error);
        this.bebidas = [];
        this.error = 'No se pudo aplicar el filtro.';
        this.cargando = false;
      }
    });
  }

  agregar(bebida: any): void {
    this.pedidos.agregar({
      id: bebida.idDrink,
      nombre: bebida.strDrink,
      imagen: bebida.strDrinkThumb,
      tipo: 'Bebida',
      precio: bebida.precio,
      cantidad: 1
    });

    this.mostrarMensaje(
      `${bebida.strDrink} se agregó a tu pedido.`
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
