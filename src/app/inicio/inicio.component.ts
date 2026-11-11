
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ComidasService } from '../servicios/comidas.service';
import { BebidasService } from '../servicios/bebidas.service';
import { PedidosService } from '../servicios/carrito.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent implements OnInit, OnDestroy {

  comidaEstrella: any = null;
  bebidaEstrella: any = null;

  mensaje = '';
  private temporizador: any;

  constructor(
    private comidasService: ComidasService,
    private bebidasService: BebidasService,
    private pedidosService: PedidosService
  ) {}

  ngOnInit(): void {
    this.cargarComidaEstrella();
    this.cargarBebidaEstrella();
  }

  ngOnDestroy(): void {
    clearTimeout(this.temporizador);
  }

  cargarComidaEstrella(): void {
    this.comidasService.obtenerComidas().subscribe({
      next: data => {
        this.comidaEstrella = data?.length ? data[0] : null;
      },
      error: error => {
        console.error('Error al cargar el plato estrella:', error);
        this.comidaEstrella = null;
      }
    });
  }

  cargarBebidaEstrella(): void {
    this.bebidasService.obtenerBebidas().subscribe({
      next: data => {
        this.bebidaEstrella = data?.length ? data[0] : null;
      },
      error: error => {
        console.error('Error al cargar la bebida estrella:', error);
        this.bebidaEstrella = null;
      }
    });
  }

  agregarComida(): void {
    if (!this.comidaEstrella) {
      return;
    }

    this.pedidosService.agregar({
      id: this.comidaEstrella.idMeal,
      nombre: this.comidaEstrella.strMeal,
      imagen: this.comidaEstrella.strMealThumb,
      tipo: 'Comida',
      precio: this.comidaEstrella.precio,
      cantidad: 1
    });

    this.mostrarMensaje(
      `${this.comidaEstrella.strMeal} se agregó a tu pedido.`
    );
  }

  agregarBebida(): void {
    if (!this.bebidaEstrella) {
      return;
    }

    this.pedidosService.agregar({
      id: this.bebidaEstrella.idDrink,
      nombre: this.bebidaEstrella.strDrink,
      imagen: this.bebidaEstrella.strDrinkThumb,
      tipo: 'Bebida',
      precio: this.bebidaEstrella.precio,
      cantidad: 1
    });

    this.mostrarMensaje(
      `${this.bebidaEstrella.strDrink} se agregó a tu pedido.`
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
