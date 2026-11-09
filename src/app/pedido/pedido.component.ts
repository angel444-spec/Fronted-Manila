
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import {
  PedidosService,
  ProductoPedido
} from '../servicios/carrito.service';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './pedido.component.html',
  styleUrl: './pedido.component.css'
})
export class PedidosComponent implements OnInit, OnDestroy {

  productos: ProductoPedido[] = [];

  total = 0;
  cantidadProductos = 0;

  nombreCliente = '';
  celular = '';
  direccion = '';

  fechaActual = '';

  pedidoConfirmado = false;

  private suscripcion!: Subscription;

  constructor(private pedidos: PedidosService) {

    this.fechaActual = new Date().toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

  }

  ngOnInit(): void {

    this.suscripcion = this.pedidos.pedido$.subscribe(data => {

      this.productos = data;
      this.total = this.pedidos.total();
      this.cantidadProductos = this.pedidos.cantidadTotal();

    });

  }

  aumentar(producto: ProductoPedido): void {

    this.pedidos.cambiarCantidad(
      producto.id,
      producto.tipo,
      producto.cantidad + 1
    );

    this.pedidoConfirmado = false;

  }

  disminuir(producto: ProductoPedido): void {

    this.pedidos.cambiarCantidad(
      producto.id,
      producto.tipo,
      producto.cantidad - 1
    );

    this.pedidoConfirmado = false;

  }

  eliminar(producto: ProductoPedido): void {

    this.pedidos.eliminar(
      producto.id,
      producto.tipo
    );

    this.pedidoConfirmado = false;

  }

  vaciar(): void {

    if (this.productos.length === 0) {
      return;
    }

    const confirmar = confirm(
      '¿Estás seguro de que deseas vaciar el pedido?'
    );

    if (confirmar) {

      this.pedidos.vaciar();
      this.pedidoConfirmado = false;

    }

  }

  confirmarPedido(): void {

    if (this.productos.length === 0) {
      alert('No tienes productos en tu pedido.');
      return;
    }

    if (
      !this.nombreCliente.trim() ||
      !this.celular.trim() ||
      !this.direccion.trim()
    ) {
      alert('Completa todos los datos del cliente.');
      return;
    }

    const confirmar = confirm(
      '¿Deseas confirmar tu pedido?'
    );

    if (confirmar) {

      this.pedidoConfirmado = true;

      alert('¡Pedido confirmado correctamente! Ya puedes descargar tu comprobante.');

    }

  }

  descargarPDF(): void {

    if (!this.pedidoConfirmado || this.productos.length === 0) {
      alert('Primero debes confirmar tu pedido.');
      return;
    }

    const documento = new jsPDF();

    const formatoPesos = (valor: number): string => {
      return '$' + valor.toLocaleString('es-CO');
    };

    const totalPedido = this.productos.reduce(
      (total, producto) =>
        total + producto.precio * producto.cantidad,
      0
    );

    documento.setFillColor(36, 24, 18);
    documento.rect(0, 0, 210, 42, 'F');

    documento.setTextColor(231, 201, 165);
    documento.setFontSize(25);
    documento.setFont('helvetica', 'bold');
    documento.text('MANILA', 105, 19, { align: 'center' });

    documento.setFontSize(11);
    documento.setTextColor(250, 243, 232);
    documento.text('COMPROBANTE DE PEDIDO', 105, 30, {
      align: 'center'
    });

    documento.setTextColor(36, 24, 18);
    documento.setFontSize(12);
    documento.setFont('helvetica', 'bold');

    documento.text('INFORMACION DEL CLIENTE', 15, 55);

    documento.setFont('helvetica', 'normal');
    documento.setFontSize(10);

    documento.text('Nombre: ' + this.nombreCliente, 15, 65);
    documento.text('Celular: ' + this.celular, 15, 73);
    documento.text('Direccion: ' + this.direccion, 15, 81);
    documento.text('Fecha: ' + this.fechaActual, 15, 89);

    autoTable(documento, {

      startY: 100,

      head: [[
        'Producto',
        'Tipo',
        'Cantidad',
        'Precio',
        'Subtotal'
      ]],

      body: this.productos.map(producto => [
        producto.nombre,
        producto.tipo,
        producto.cantidad.toString(),
        formatoPesos(producto.precio),
        formatoPesos(producto.precio * producto.cantidad)
      ]),

      theme: 'grid',

      headStyles: {
        fillColor: [102, 61, 46],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },

      styles: {
        fontSize: 9,
        cellPadding: 4
      }

    });

    const posicionFinal = (documento as any).lastAutoTable.finalY + 15;

    documento.setFontSize(14);
    documento.setFont('helvetica', 'bold');
    documento.setTextColor(36, 24, 18);

    documento.text(
      'TOTAL A PAGAR: ' + formatoPesos(totalPedido),
      195,
      posicionFinal,
      { align: 'right' }
    );

    documento.setFontSize(10);
    documento.setFont('helvetica', 'normal');
    documento.setTextColor(102, 61, 46);

    documento.text(
      'Gracias por elegir MANILA.',
      105,
      posicionFinal + 20,
      { align: 'center' }
    );

    documento.save('Pedido_MANILA.pdf');

  }

  ngOnDestroy(): void {

    this.suscripcion?.unsubscribe();

  }

}
