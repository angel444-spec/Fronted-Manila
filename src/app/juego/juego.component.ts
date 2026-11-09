
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Carta {
  id: number;
  nombre: string;
  imagen: string;
  descubierta: boolean;
  encontrada: boolean;
}

@Component({
  selector: 'app-juego',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './juego.component.html',
  styleUrl: './juego.component.css'
})
export class JuegoComponent implements OnInit {

  cartas: Carta[] = [];
  primeraCarta: Carta | null = null;
  bloqueo = false;
  intentos = 0;
  parejasEncontradas = 0;
  juegoTerminado = false;

  ngOnInit(): void {
    this.nuevoJuego();
  }

  nuevoJuego(): void {

    const alimentos = [
      {
        nombre: 'Hamburguesa',
        imagen: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300'
      },
      {
        nombre: 'Pizza',
        imagen: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300'
      },
      {
        nombre: 'Helado',
        imagen: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300'
      },
      {
        nombre: 'Pastel',
        imagen: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300'
      },
      {
        nombre: 'Café',
        imagen: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300'
      },
      {
        nombre: 'Pasta',
        imagen: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=300'
      },
      {
        nombre: 'Ensalada',
        imagen: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300'
      },
      {
        nombre: 'Bebida',
        imagen: 'https://images.unsplash.com/photo-1513558161293-cdaf765edfd4?w=300'
      }
    ];

    const lista: Carta[] = alimentos.flatMap((alimento, index) => [
      {
        id: index * 2 + 1,
        nombre: alimento.nombre,
        imagen: alimento.imagen,
        descubierta: false,
        encontrada: false
      },
      {
        id: index * 2 + 2,
        nombre: alimento.nombre,
        imagen: alimento.imagen,
        descubierta: false,
        encontrada: false
      }
    ]);

    this.cartas = lista.sort(() => Math.random() - 0.5);
    this.primeraCarta = null;
    this.bloqueo = false;
    this.intentos = 0;
    this.parejasEncontradas = 0;
    this.juegoTerminado = false;
  }

  descubrir(carta: Carta): void {

    if (
      this.bloqueo ||
      carta.descubierta ||
      carta.encontrada ||
      this.juegoTerminado
    ) {
      return;
    }

    carta.descubierta = true;

    if (!this.primeraCarta) {
      this.primeraCarta = carta;
      return;
    }

    this.intentos++;

    if (this.primeraCarta.nombre === carta.nombre) {

      this.primeraCarta.encontrada = true;
      carta.encontrada = true;

      this.parejasEncontradas++;
      this.primeraCarta = null;

      if (this.parejasEncontradas === 8) {
        this.juegoTerminado = true;
      }

    } else {

      this.bloqueo = true;

      const primera = this.primeraCarta;

      setTimeout(() => {
        primera.descubierta = false;
        carta.descubierta = false;
        this.primeraCarta = null;
        this.bloqueo = false;
      }, 1000);

    }
  }
}
