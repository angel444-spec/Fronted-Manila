
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ProductoPedido {
  id: string;
  nombre: string;
  imagen: string;
  tipo: string;
  precio: number;
  cantidad: number;
}

@Injectable({
  providedIn: 'root'
})
export class PedidosService {

  private cargarDatos(): ProductoPedido[] {
    try {
      const datos = JSON.parse(
        localStorage.getItem('pedido') || '[]'
      );

      return Array.isArray(datos) ? datos : [];

    } catch {
      return [];
    }
  }

  private pedidoSubject = new BehaviorSubject<ProductoPedido[]>(
    this.cargarDatos()
  );

  pedido$ = this.pedidoSubject.asObservable();

  private actualizar(productos: ProductoPedido[]): void {

    this.pedidoSubject.next(productos);

    try {
      localStorage.setItem(
        'pedido',
        JSON.stringify(productos)
      );
    } catch (error) {
      console.error('Error al guardar el pedido:', error);
    }
  }

  agregar(producto: ProductoPedido): void {

    const productos = [...this.pedidoSubject.value];

    const existente = productos.find(
      p => p.id === producto.id && p.tipo === producto.tipo
    );

    if (existente) {

      existente.cantidad++;

    } else {

      productos.push({
        ...producto,
        cantidad: Math.max(1, producto.cantidad || 1)
      });

    }

    this.actualizar(productos);
  }

  eliminar(id: string, tipo: string): void {

    const productos = this.pedidoSubject.value.filter(
      p => !(p.id === id && p.tipo === tipo)
    );

    this.actualizar(productos);
  }

  cambiarCantidad(
    id: string,
    tipo: string,
    cantidad: number
  ): void {

    const productos = this.pedidoSubject.value.map(p => {

      if (p.id === id && p.tipo === tipo) {

        return {
          ...p,
          cantidad: Math.max(1, Math.floor(cantidad))
        };

      }

      return p;
    });

    this.actualizar(productos);
  }

  vaciar(): void {
    this.actualizar([]);
  }

  total(): number {

    return this.pedidoSubject.value.reduce(
      (total, p) => total + p.precio * p.cantidad,
      0
    );

  }

  cantidadTotal(): number {

    return this.pedidoSubject.value.reduce(
      (total, p) => total + p.cantidad,
      0
    );

  }

}
